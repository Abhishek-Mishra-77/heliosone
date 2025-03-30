-- Drop the existing function first
DROP FUNCTION IF EXISTS get_available_department_users(uuid);

-- Create the function with the new return type
CREATE OR REPLACE FUNCTION get_available_department_users(dept_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  role text
) SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH dept_org AS (
    SELECT organization_id 
    FROM departments 
    WHERE id = dept_id
  )
  SELECT DISTINCT 
    u.id,
    u.full_name,
    u.email,
    u.role
  FROM users u
  JOIN dept_org ON u.organization_id = dept_org.organization_id
  WHERE u.role != 'super_admin'
  AND NOT EXISTS (
    SELECT 1 
    FROM department_users du
    WHERE du.department_id = dept_id
    AND du.user_id = u.id
  )
  ORDER BY u.full_name;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_available_department_users(uuid) TO authenticated;