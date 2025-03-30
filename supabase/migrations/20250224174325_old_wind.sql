-- First, let's clean up any incorrect assignments more thoroughly
DO $$
BEGIN
  -- 1. Expire all assignments for departments where the user is not assigned
  UPDATE department_questionnaire_assignments dqa
  SET status = 'expired'
  WHERE EXISTS (
    SELECT 1 FROM departments d
    WHERE d.id = dqa.department_id
    AND NOT EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = d.id
      AND du.user_id = 'b06059d8-5613-4a38-a136-62533999193c'
    )
  );

  -- 2. Expire all assignments where department type doesn't match template type
  UPDATE department_questionnaire_assignments dqa
  SET status = 'expired'
  WHERE EXISTS (
    SELECT 1 FROM departments d
    JOIN department_questionnaire_templates t ON t.id = dqa.template_id
    WHERE d.id = dqa.department_id
    AND d.department_type != t.department_type
  );

  -- 3. For each department/template combination, keep only the most recent active assignment
  WITH ranked_assignments AS (
    SELECT 
      id,
      department_id,
      template_id,
      ROW_NUMBER() OVER (
        PARTITION BY department_id, template_id 
        ORDER BY created_at DESC
      ) as rn
    FROM department_questionnaire_assignments
    WHERE status != 'expired'
  )
  UPDATE department_questionnaire_assignments dqa
  SET status = 'expired'
  WHERE id IN (
    SELECT id FROM ranked_assignments
    WHERE rn > 1
  );
END $$;

-- Create a more robust function to get user questionnaire assignments
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
    SELECT DISTINCT du.department_id, d.department_type
    FROM department_users du
    JOIN departments d ON d.id = du.department_id
    WHERE du.user_id = p_user_id
  ),
  valid_assignments AS (
    -- Get only valid assignments (matching department type and template type)
    SELECT DISTINCT ON (dqa.department_id, dqa.template_id)
      dqa.id,
      dqa.template_id,
      dqa.department_id,
      dqa.status,
      dqa.due_date,
      dqa.completed_at
    FROM department_questionnaire_assignments dqa
    JOIN departments d ON d.id = dqa.department_id
    JOIN department_questionnaire_templates dqt ON dqt.id = dqa.template_id
    WHERE d.department_type = dqt.department_type
    AND dqa.status != 'expired'
    ORDER BY dqa.department_id, dqa.template_id, dqa.created_at DESC
  )
  SELECT 
    va.id,
    va.template_id,
    va.department_id,
    va.status,
    va.due_date,
    va.completed_at,
    jsonb_build_object(
      'name', dqt.name,
      'description', dqt.description,
      'department_type', dqt.department_type
    ) as template,
    jsonb_build_object(
      'name', d.name,
      'type', d.department_type
    ) as department
  FROM valid_assignments va
  JOIN departments d ON d.id = va.department_id
  JOIN department_questionnaire_templates dqt ON dqt.id = va.template_id
  -- Only include assignments for departments the user is assigned to
  JOIN user_departments ud ON ud.department_id = va.department_id
  ORDER BY va.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to validate assignment before creation
CREATE OR REPLACE FUNCTION validate_questionnaire_assignment()
RETURNS TRIGGER AS $$
DECLARE
  dept_type text;
  template_type text;
  existing_count integer;
BEGIN
  -- Get department type
  SELECT department_type INTO dept_type
  FROM departments
  WHERE id = NEW.department_id;

  IF dept_type IS NULL THEN
    RAISE EXCEPTION 'Department not found';
  END IF;

  -- Get template type
  SELECT department_type INTO template_type
  FROM department_questionnaire_templates
  WHERE id = NEW.template_id;

  IF template_type IS NULL THEN
    RAISE EXCEPTION 'Template not found';
  END IF;

  -- Verify department and template types match
  IF dept_type != template_type THEN
    RAISE EXCEPTION 'Template type (%) does not match department type (%)', template_type, dept_type;
  END IF;

  -- Check for existing active assignments
  SELECT COUNT(*) INTO existing_count
  FROM department_questionnaire_assignments
  WHERE department_id = NEW.department_id
  AND template_id = NEW.template_id
  AND status != 'expired';

  IF existing_count > 0 AND TG_OP = 'INSERT' THEN
    -- Instead of raising an exception, expire the old assignment
    UPDATE department_questionnaire_assignments
    SET status = 'expired'
    WHERE department_id = NEW.department_id
    AND template_id = NEW.template_id
    AND status != 'expired';
  END IF;

  -- Set default status if not provided
  IF NEW.status IS NULL THEN
    NEW.status := 'pending';
  END IF;

  -- Set default due date if not provided (30 days from now)
  IF NEW.due_date IS NULL THEN
    NEW.due_date := CURRENT_TIMESTAMP + INTERVAL '30 days';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for assignment validation
DROP TRIGGER IF EXISTS validate_questionnaire_assignment_trigger ON department_questionnaire_assignments;
CREATE TRIGGER validate_questionnaire_assignment_trigger
  BEFORE INSERT OR UPDATE ON department_questionnaire_assignments
  FOR EACH ROW
  EXECUTE FUNCTION validate_questionnaire_assignment();

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
CREATE INDEX IF NOT EXISTS idx_questionnaire_assignments_dept_template 
ON department_questionnaire_assignments(department_id, template_id) 
WHERE status != 'expired';

CREATE INDEX IF NOT EXISTS idx_questionnaire_assignments_status 
ON department_questionnaire_assignments(status);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_questionnaire_assignments(uuid) TO authenticated;