-- Drop the existing function
DROP FUNCTION IF EXISTS get_user_questionnaire_assignments(uuid);

-- Create an improved version with unambiguous column references
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
  JOIN department_users du ON du.department_id = dqa.department_id
  WHERE du.user_id = p_user_id
  AND dqa.status != 'expired'
  ORDER BY dqa.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_questionnaire_assignments(uuid) TO authenticated;