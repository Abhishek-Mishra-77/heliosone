-- Drop all existing user policies
DROP POLICY IF EXISTS "users_access" ON users;
DROP POLICY IF EXISTS "allow_read_users" ON users;
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "View own profile" ON users;
DROP POLICY IF EXISTS "View organization members" ON users;
DROP POLICY IF EXISTS "allow_view_own_profile" ON users;
DROP POLICY IF EXISTS "allow_view_organization_users" ON users;
DROP POLICY IF EXISTS "allow_user_access" ON users;

-- Create a materialized view for organization memberships to avoid recursion
CREATE MATERIALIZED VIEW IF NOT EXISTS user_organizations AS
SELECT DISTINCT
  u.id as user_id,
  u.organization_id
FROM users u;

-- Create index for performance
CREATE UNIQUE INDEX IF NOT EXISTS user_organizations_user_id_idx 
ON user_organizations(user_id, organization_id);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_user_organizations()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_organizations;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh the view when users table changes
DROP TRIGGER IF EXISTS refresh_user_organizations_trigger ON users;
CREATE TRIGGER refresh_user_organizations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH STATEMENT
  EXECUTE FUNCTION refresh_user_organizations();

-- Create new simplified policy for user visibility
CREATE POLICY "allow_user_access"
  ON users
  FOR SELECT
  USING (
    -- Users can see their own profile
    id = auth.uid()
    OR
    -- Users in the same organization can see each other (using materialized view)
    EXISTS (
      SELECT 1 
      FROM user_organizations uo1
      JOIN user_organizations uo2 ON uo1.organization_id = uo2.organization_id
      WHERE uo1.user_id = auth.uid()
      AND uo2.user_id = users.id
    )
    OR
    -- Platform admins can see all users
    EXISTS (
      SELECT 1 FROM platform_admins 
      WHERE id = auth.uid()
    )
  );

-- Update the get_available_department_users function
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

-- Refresh the materialized view initially
REFRESH MATERIALIZED VIEW user_organizations;