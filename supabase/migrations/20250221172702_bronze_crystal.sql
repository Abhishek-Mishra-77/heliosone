-- Drop existing policies
DROP POLICY IF EXISTS "allow_view_department_users" ON department_users;
DROP POLICY IF EXISTS "allow_insert_department_users" ON department_users;
DROP POLICY IF EXISTS "allow_delete_department_users" ON department_users;

-- Create materialized view for department access rights to avoid recursion
CREATE MATERIALIZED VIEW IF NOT EXISTS department_access_rights AS
SELECT DISTINCT
  u.id as user_id,
  d.id as department_id,
  CASE 
    WHEN pa.id IS NOT NULL THEN 'platform_admin'
    WHEN u.role IN ('super_admin', 'admin', 'bcdr_manager') THEN 'org_admin'
    WHEN du.role = 'department_admin' THEN 'department_admin'
    ELSE 'member'
  END as access_level
FROM users u
CROSS JOIN departments d
LEFT JOIN platform_admins pa ON pa.id = u.id
LEFT JOIN department_users du ON du.user_id = u.id AND du.department_id = d.id
WHERE 
  -- User is in the same organization as the department
  u.organization_id = d.organization_id
  OR
  -- User is a platform admin
  pa.id IS NOT NULL;

-- Create index for performance
CREATE UNIQUE INDEX IF NOT EXISTS department_access_rights_idx 
ON department_access_rights(user_id, department_id);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_department_access_rights()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY department_access_rights;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh the view when relevant tables change
DROP TRIGGER IF EXISTS refresh_department_access_rights_users ON users;
CREATE TRIGGER refresh_department_access_rights_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_department_access_rights();

DROP TRIGGER IF EXISTS refresh_department_access_rights_departments ON departments;
CREATE TRIGGER refresh_department_access_rights_departments
  AFTER INSERT OR UPDATE OR DELETE ON departments
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_department_access_rights();

DROP TRIGGER IF EXISTS refresh_department_access_rights_dept_users ON department_users;
CREATE TRIGGER refresh_department_access_rights_dept_users
  AFTER INSERT OR UPDATE OR DELETE ON department_users
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_department_access_rights();

-- Create new RLS policies using the materialized view
CREATE POLICY "allow_view_department_users"
  ON department_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM department_access_rights dar
      WHERE dar.user_id = auth.uid()
      AND dar.department_id = department_users.department_id
    )
  );

CREATE POLICY "allow_manage_department_users"
  ON department_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM department_access_rights dar
      WHERE dar.user_id = auth.uid()
      AND dar.department_id = department_users.department_id
      AND dar.access_level IN ('platform_admin', 'org_admin', 'department_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM department_access_rights dar
      WHERE dar.user_id = auth.uid()
      AND dar.department_id = department_users.department_id
      AND dar.access_level IN ('platform_admin', 'org_admin', 'department_admin')
    )
  );

-- Update the get_available_department_users function to use the materialized view
CREATE OR REPLACE FUNCTION get_available_department_users(dept_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  user_role text
) SECURITY DEFINER AS $$
BEGIN
  -- Verify the caller has permission to manage the department
  IF NOT EXISTS (
    SELECT 1 FROM department_access_rights
    WHERE user_id = auth.uid()
    AND department_id = dept_id
    AND access_level IN ('platform_admin', 'org_admin', 'department_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  RETURN QUERY
  SELECT DISTINCT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.role as user_role
  FROM users u
  JOIN departments d ON d.organization_id = u.organization_id
  WHERE d.id = dept_id
  AND u.role != 'super_admin'
  AND NOT EXISTS (
    SELECT 1 FROM department_users du
    WHERE du.department_id = dept_id
    AND du.user_id = u.id
  )
  ORDER BY u.full_name;
END;
$$ LANGUAGE plpgsql;

-- Refresh the materialized view initially
REFRESH MATERIALIZED VIEW department_access_rights;

-- Grant necessary permissions
GRANT SELECT ON department_access_rights TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_department_users(uuid) TO authenticated;