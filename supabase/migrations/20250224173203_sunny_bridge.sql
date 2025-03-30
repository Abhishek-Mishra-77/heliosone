-- Create a function to validate department questionnaire assignments
CREATE OR REPLACE FUNCTION validate_questionnaire_assignment()
RETURNS TRIGGER AS $$
DECLARE
  user_has_access boolean;
  dept_type text;
  template_type text;
BEGIN
  -- Check if the department exists and get its type
  SELECT department_type INTO dept_type
  FROM departments
  WHERE id = NEW.department_id;

  -- Get template type
  SELECT department_type INTO template_type
  FROM department_questionnaire_templates
  WHERE id = NEW.template_id;

  -- Verify department and template types match
  IF dept_type != template_type THEN
    RAISE EXCEPTION 'Template type does not match department type';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for assignment validation
DROP TRIGGER IF EXISTS validate_questionnaire_assignment_trigger 
ON department_questionnaire_assignments;

CREATE TRIGGER validate_questionnaire_assignment_trigger
  BEFORE INSERT OR UPDATE ON department_questionnaire_assignments
  FOR EACH ROW
  EXECUTE FUNCTION validate_questionnaire_assignment();

-- Create function to clean up assignments when a user is removed from a department
CREATE OR REPLACE FUNCTION cleanup_questionnaire_assignments()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user is removed from a department, update their assignments
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

-- Create trigger for assignment cleanup
DROP TRIGGER IF EXISTS cleanup_questionnaire_assignments_trigger 
ON department_users;

CREATE TRIGGER cleanup_questionnaire_assignments_trigger
  AFTER DELETE ON department_users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_questionnaire_assignments();

-- Add created_by column to track who created responses
ALTER TABLE department_question_responses 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id);

-- Update RLS policies for questionnaire assignments
DROP POLICY IF EXISTS "allow_view_assignments" ON department_questionnaire_assignments;
CREATE POLICY "allow_view_assignments"
  ON department_questionnaire_assignments
  FOR SELECT
  USING (
    -- Users can only view assignments for departments they belong to
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = department_questionnaire_assignments.department_id
      AND du.user_id = auth.uid()
    )
    OR
    -- Organization admins can view all assignments
    EXISTS (
      SELECT 1 FROM users u
      JOIN departments d ON d.organization_id = u.organization_id
      WHERE u.id = auth.uid()
      AND d.id = department_questionnaire_assignments.department_id
      AND u.role = 'admin'
    )
    OR
    -- Platform admins can view all
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Create function to get user's questionnaire assignments
CREATE OR REPLACE FUNCTION get_user_questionnaire_assignments(user_id uuid)
RETURNS TABLE (
  assignment_id uuid,
  template_id uuid,
  department_id uuid,
  department_name text,
  template_name text,
  status text,
  due_date timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dqa.id as assignment_id,
    dqa.template_id,
    dqa.department_id,
    d.name as department_name,
    dqt.name as template_name,
    dqa.status,
    dqa.due_date
  FROM department_questionnaire_assignments dqa
  JOIN departments d ON d.id = dqa.department_id
  JOIN department_questionnaire_templates dqt ON dqt.id = dqa.template_id
  JOIN department_users du ON du.department_id = dqa.department_id
  WHERE du.user_id = user_id
  AND dqa.status != 'expired'
  ORDER BY dqa.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_questionnaire_assignments(uuid) TO authenticated;