-- Drop existing policies
DROP POLICY IF EXISTS "users_access" ON users;
DROP POLICY IF EXISTS "allow_read_users" ON users;
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "View own profile" ON users;
DROP POLICY IF EXISTS "View organization members" ON users;

-- Create new simplified policies for user visibility
CREATE POLICY "allow_view_own_profile"
  ON users
  FOR SELECT
  USING (
    -- Users can always see their own profile
    auth.uid() = id
  );

CREATE POLICY "allow_view_organization_users"
  ON users
  FOR SELECT
  USING (
    -- Users can see other users in their organization
    EXISTS (
      SELECT 1 FROM users self
      WHERE self.id = auth.uid()
      AND self.organization_id = users.organization_id
    )
    OR
    -- Platform admins can see all users
    EXISTS (
      SELECT 1 FROM platform_admins
      WHERE id = auth.uid()
    )
  );

-- Create function to get available users for department assignment
CREATE OR REPLACE FUNCTION get_available_department_users(dept_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  role text
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT u.id, u.full_name, u.email, u.role
  FROM users u
  WHERE u.organization_id = (
    SELECT organization_id FROM departments WHERE id = dept_id
  )
  AND u.role != 'super_admin'
  AND NOT EXISTS (
    SELECT 1 FROM department_users du
    WHERE du.department_id = dept_id
    AND du.user_id = u.id
  )
  ORDER BY u.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_available_department_users(uuid) TO authenticated;