-- First, ensure departments have the correct department_type
UPDATE departments d
SET department_type = d.type
WHERE department_type IS NULL OR department_type != type;

-- Add NOT NULL constraint to department_type if it doesn't exist
DO $$ 
BEGIN
  ALTER TABLE departments 
  ALTER COLUMN department_type SET NOT NULL;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Add check constraint if it doesn't exist
DO $$
BEGIN
  ALTER TABLE departments
  ADD CONSTRAINT department_type_matches_type
  CHECK (department_type = type);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create a function to get active assignments
CREATE OR REPLACE FUNCTION get_active_assignments(dept_id uuid, template_id uuid)
RETURNS TABLE (
  id uuid,
  status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dqa.id,
    dqa.status
  FROM department_questionnaire_assignments dqa
  WHERE dqa.department_id = dept_id
  AND dqa.template_id = template_id
  AND dqa.status != 'expired';
END;
$$ LANGUAGE plpgsql;

-- Create a function to safely create new assignments
CREATE OR REPLACE FUNCTION create_department_assignment(
  p_template_id uuid,
  p_department_id uuid,
  p_assigned_by uuid
)
RETURNS uuid AS $$
DECLARE
  v_assignment_id uuid;
  v_dept_type text;
  v_template_type text;
BEGIN
  -- Get department type
  SELECT department_type INTO v_dept_type
  FROM departments
  WHERE id = p_department_id;

  IF v_dept_type IS NULL THEN
    RAISE EXCEPTION 'Department not found';
  END IF;

  -- Get template type
  SELECT department_type INTO v_template_type
  FROM department_questionnaire_templates
  WHERE id = p_template_id;

  IF v_template_type IS NULL THEN
    RAISE EXCEPTION 'Template not found';
  END IF;

  -- Verify types match
  IF v_dept_type != v_template_type THEN
    RAISE EXCEPTION 'Department type (%) does not match template type (%)', v_dept_type, v_template_type;
  END IF;

  -- Expire any existing assignments
  UPDATE department_questionnaire_assignments
  SET status = 'expired'
  WHERE department_id = p_department_id
  AND template_id = p_template_id
  AND status != 'expired';

  -- Create new assignment
  INSERT INTO department_questionnaire_assignments (
    template_id,
    department_id,
    assigned_by,
    status,
    due_date
  ) VALUES (
    p_template_id,
    p_department_id,
    p_assigned_by,
    'pending',
    CURRENT_TIMESTAMP + INTERVAL '30 days'
  )
  RETURNING id INTO v_assignment_id;

  RETURN v_assignment_id;
END;
$$ LANGUAGE plpgsql;

-- Update the get_user_questionnaire_assignments function
CREATE OR REPLACE FUNCTION get_user_questionnaire_assignments(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  template_id uuid,
  department_id uuid,
  status text,
  due_date timestamptz,
  completed_at timestamptz,
  template jsonb,
  department jsonb
) AS $$
BEGIN
  RETURN QUERY
  WITH user_departments AS (
    -- Get only departments where the user is actively assigned
    SELECT DISTINCT d.id as department_id, d.department_type
    FROM departments d
    JOIN department_users du ON du.department_id = d.id
    WHERE du.user_id = p_user_id
  )
  SELECT DISTINCT ON (dqa.department_id, dqa.template_id)
    dqa.id,
    dqa.template_id,
    dqa.department_id,
    dqa.status,
    dqa.due_date,
    dqa.completed_at,
    jsonb_build_object(
      'name', dqt.name,
      'description', dqt.description,
      'department_type', dqt.department_type
    ) as template,
    jsonb_build_object(
      'name', d.name,
      'type', d.department_type
    ) as department
  FROM department_questionnaire_assignments dqa
  JOIN departments d ON d.id = dqa.department_id
  JOIN department_questionnaire_templates dqt ON dqt.id = dqa.template_id
  -- Only include assignments for departments the user is assigned to
  JOIN user_departments ud ON ud.department_id = dqa.department_id
  WHERE dqa.status != 'expired'
  -- Ensure department type matches template type
  AND d.department_type = dqt.department_type
  ORDER BY dqa.department_id, dqa.template_id, dqa.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to handle department user removal
CREATE OR REPLACE FUNCTION handle_department_user_removal()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user is removed from a department, expire their assignments
  UPDATE department_questionnaire_assignments
  SET status = 'expired'
  WHERE department_id = OLD.department_id
  AND EXISTS (
    SELECT 1 FROM department_question_responses dqr
    WHERE dqr.department_assessment_id = department_questionnaire_assignments.id
    AND dqr.created_by = OLD.user_id
  );

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for department user removal
DROP TRIGGER IF EXISTS handle_department_user_removal_trigger ON department_users;
CREATE TRIGGER handle_department_user_removal_trigger
  AFTER DELETE ON department_users
  FOR EACH ROW
  EXECUTE FUNCTION handle_department_user_removal();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dept_questionnaire_dept_template 
ON department_questionnaire_assignments(department_id, template_id);

CREATE INDEX IF NOT EXISTS idx_dept_questionnaire_status 
ON department_questionnaire_assignments(status);

CREATE INDEX IF NOT EXISTS idx_dept_questionnaire_created 
ON department_questionnaire_assignments(created_at);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_active_assignments(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION create_department_assignment(uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_questionnaire_assignments(uuid) TO authenticated;