-- First, let's clean up ALL existing assignments for Matthew
UPDATE department_questionnaire_assignments dqa
SET status = 'expired'
WHERE EXISTS (
  SELECT 1 FROM department_users du
  WHERE du.user_id = 'b06059d8-5613-4a38-a136-62533999193c'
  AND du.department_id = dqa.department_id
);

-- Get Matthew's departments and create fresh assignments
WITH matthew_depts AS (
  SELECT DISTINCT d.id, d.department_type
  FROM departments d
  JOIN department_users du ON du.department_id = d.id
  WHERE du.user_id = 'b06059d8-5613-4a38-a136-62533999193c'
),
admin_user AS (
  SELECT id FROM users WHERE email = 'admin@helios.com' LIMIT 1
)
INSERT INTO department_questionnaire_assignments (
  template_id,
  department_id,
  assigned_by,
  status,
  due_date
)
SELECT DISTINCT
  t.id as template_id,
  d.id as department_id,
  admin_user.id as assigned_by,
  'pending' as status,
  CURRENT_TIMESTAMP + INTERVAL '30 days' as due_date
FROM matthew_depts d
JOIN department_questionnaire_templates t ON t.department_type = d.department_type
CROSS JOIN admin_user
WHERE t.is_active = true;

-- Create a more precise function to get assignments
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
    -- Get ONLY the departments where the user is actively assigned
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

-- Create a strict validation function for new assignments
CREATE OR REPLACE FUNCTION validate_new_assignment()
RETURNS TRIGGER AS $$
DECLARE
  dept_type text;
  template_type text;
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

  -- Strict type matching
  IF dept_type != template_type THEN
    RAISE EXCEPTION 'Department type (%) does not match template type (%)', dept_type, template_type;
  END IF;

  -- If an active assignment already exists, expire it
  UPDATE department_questionnaire_assignments
  SET status = 'expired'
  WHERE department_id = NEW.department_id
  AND template_id = NEW.template_id
  AND status != 'expired'
  AND id != NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new assignment validation
DROP TRIGGER IF EXISTS validate_new_assignment_trigger ON department_questionnaire_assignments;
CREATE TRIGGER validate_new_assignment_trigger
  BEFORE INSERT OR UPDATE ON department_questionnaire_assignments
  FOR EACH ROW
  EXECUTE FUNCTION validate_new_assignment();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dept_questionnaire_dept_template 
ON department_questionnaire_assignments(department_id, template_id);

CREATE INDEX IF NOT EXISTS idx_dept_questionnaire_status 
ON department_questionnaire_assignments(status);

CREATE INDEX IF NOT EXISTS idx_dept_questionnaire_created 
ON department_questionnaire_assignments(created_at);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_questionnaire_assignments(uuid) TO authenticated;