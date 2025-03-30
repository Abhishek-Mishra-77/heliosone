-- First, let's clean up any incorrect assignments more thoroughly
DO $$
DECLARE
  assignment RECORD;
BEGIN
  -- Mark assignments as expired if:
  -- 1. User is not assigned to the department
  -- 2. Department type doesn't match template type
  -- 3. Multiple assignments exist for same department/template combination
  UPDATE department_questionnaire_assignments dqa
  SET status = 'expired'
  WHERE 
    -- No valid department user assignment exists
    NOT EXISTS (
      SELECT 1 
      FROM department_users du
      WHERE du.department_id = dqa.department_id
      AND du.user_id IN (
        SELECT user_id 
        FROM department_users 
        WHERE department_id = dqa.department_id
      )
    )
    OR
    -- Department type doesn't match template type
    EXISTS (
      SELECT 1
      FROM departments d
      JOIN department_questionnaire_templates t ON t.id = dqa.template_id
      WHERE d.id = dqa.department_id
      AND d.department_type != t.department_type
    )
    OR
    -- Duplicate assignments (keep the most recent one)
    id NOT IN (
      SELECT DISTINCT ON (department_id, template_id) id
      FROM department_questionnaire_assignments
      ORDER BY department_id, template_id, created_at DESC
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
  AND d.department_type = dqt.department_type  -- Ensure type match
  ORDER BY dqa.department_id, dqa.template_id, dqa.created_at DESC;
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
    RAISE EXCEPTION 'An active assignment already exists for this department and template';
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

-- Add unique constraint to prevent duplicate active assignments
DROP INDEX IF EXISTS idx_unique_active_assignments;
CREATE UNIQUE INDEX idx_unique_active_assignments 
ON department_questionnaire_assignments (department_id, template_id) 
WHERE status != 'expired';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_questionnaire_assignments(uuid) TO authenticated;

-- Clean up Matthew's assignments specifically
UPDATE department_questionnaire_assignments dqa
SET status = 'expired'
WHERE dqa.department_id IN (
  SELECT d.id
  FROM departments d
  WHERE NOT EXISTS (
    SELECT 1 
    FROM department_users du
    WHERE du.department_id = d.id
    AND du.user_id = 'b06059d8-5613-4a38-a136-62533999193c'
  )
);