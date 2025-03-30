-- First, let's clean up any incorrect assignments
DO $$
DECLARE
  assignment RECORD;
  has_access boolean;
BEGIN
  -- Check each assignment
  FOR assignment IN 
    SELECT 
      dqa.id,
      dqa.department_id,
      dqa.template_id,
      dqt.department_type as template_type,
      d.department_type as dept_type
    FROM department_questionnaire_assignments dqa
    JOIN departments d ON d.id = dqa.department_id
    JOIN department_questionnaire_templates dqt ON dqt.id = dqa.template_id
  LOOP
    -- Check if department type matches template type
    IF assignment.template_type != assignment.dept_type THEN
      -- Mark mismatched assignments as expired
      UPDATE department_questionnaire_assignments
      SET status = 'expired'
      WHERE id = assignment.id;
    END IF;
  END LOOP;
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
  WITH valid_departments AS (
    -- Get only departments where the user is actively assigned
    SELECT DISTINCT du.department_id
    FROM department_users du
    WHERE du.user_id = p_user_id
  )
  SELECT 
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
      'name', d.name
    ) as department
  FROM department_questionnaire_assignments dqa
  JOIN departments d ON d.id = dqa.department_id
  JOIN department_questionnaire_templates dqt ON dqt.id = dqa.template_id
  -- Only include assignments for departments the user is assigned to
  JOIN valid_departments vd ON vd.department_id = dqa.department_id
  WHERE dqa.status != 'expired'
  AND d.department_type = dqt.department_type  -- Ensure type match
  ORDER BY dqa.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_questionnaire_assignment_trigger ON department_questionnaire_assignments;

-- Create an improved validation function
CREATE OR REPLACE FUNCTION validate_questionnaire_assignment()
RETURNS TRIGGER AS $$
DECLARE
  dept_type text;
  template_type text;
BEGIN
  -- Get department type
  SELECT department_type INTO dept_type
  FROM departments
  WHERE id = NEW.department_id;

  -- Get template type
  SELECT department_type INTO template_type
  FROM department_questionnaire_templates
  WHERE id = NEW.template_id;

  -- Verify department and template types match
  IF dept_type != template_type THEN
    RAISE EXCEPTION 'Template type (%) does not match department type (%)', template_type, dept_type;
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

-- Create trigger for assignment validation
CREATE TRIGGER validate_questionnaire_assignment_trigger
  BEFORE INSERT OR UPDATE ON department_questionnaire_assignments
  FOR EACH ROW
  EXECUTE FUNCTION validate_questionnaire_assignment();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_questionnaire_assignments(uuid) TO authenticated;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dept_questionnaire_assignments_user 
ON department_users(user_id, department_id);

CREATE INDEX IF NOT EXISTS idx_dept_questionnaire_assignments_dept 
ON department_questionnaire_assignments(department_id, template_id);

-- Clean up any existing incorrect assignments for Matthew specifically
UPDATE department_questionnaire_assignments dqa
SET status = 'expired'
WHERE id IN (
  SELECT dqa.id
  FROM department_questionnaire_assignments dqa
  LEFT JOIN department_users du ON du.department_id = dqa.department_id
  WHERE du.user_id = 'b06059d8-5613-4a38-a136-62533999193c'
  AND NOT EXISTS (
    SELECT 1 
    FROM department_users du2 
    WHERE du2.department_id = dqa.department_id 
    AND du2.user_id = 'b06059d8-5613-4a38-a136-62533999193c'
  )
);