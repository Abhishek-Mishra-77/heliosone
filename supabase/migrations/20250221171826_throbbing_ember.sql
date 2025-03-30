-- Drop all existing user policies to start fresh
DROP POLICY IF EXISTS "users_access" ON users;
DROP POLICY IF EXISTS "allow_read_users" ON users;
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "View own profile" ON users;
DROP POLICY IF EXISTS "View organization members" ON users;
DROP POLICY IF EXISTS "allow_view_own_profile" ON users;
DROP POLICY IF EXISTS "allow_view_organization_users" ON users;

-- Create a single, simplified policy for user visibility
CREATE POLICY "allow_user_access"
  ON users
  FOR SELECT
  USING (
    -- Users can see their own profile
    id = auth.uid()
    OR
    -- Users in the same organization can see each other
    organization_id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
      LIMIT 1
    )
    OR
    -- Platform admins can see all users
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Update the get_available_department_users function to be more efficient
CREATE OR REPLACE FUNCTION get_available_department_users(dept_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  role text
) SECURITY DEFINER AS $$
DECLARE
  dept_org_id uuid;
BEGIN
  -- Get the organization ID once
  SELECT organization_id INTO dept_org_id
  FROM departments
  WHERE id = dept_id;

  RETURN QUERY
  SELECT DISTINCT 
    u.id,
    u.full_name,
    u.email,
    u.role
  FROM users u
  WHERE 
    u.organization_id = dept_org_id
    AND u.role != 'super_admin'
    AND NOT EXISTS (
      SELECT 1 
      FROM department_users du
      WHERE du.department_id = dept_id
      AND du.user_id = u.id
    )
  ORDER BY u.full_name;
END;
$$ LANGUAGE plpgsql;