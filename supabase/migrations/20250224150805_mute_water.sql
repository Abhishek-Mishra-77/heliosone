-- Drop existing policies
DROP POLICY IF EXISTS "allow_user_access" ON users;
DROP POLICY IF EXISTS "users_access" ON users;
DROP POLICY IF EXISTS "allow_read_users" ON users;
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "View own profile" ON users;
DROP POLICY IF EXISTS "View organization members" ON users;
DROP POLICY IF EXISTS "allow_view_own_profile" ON users;
DROP POLICY IF EXISTS "allow_view_organization_users" ON users;
DROP POLICY IF EXISTS "platform_admins_full_access" ON users;

-- Create a simple non-recursive policy for user access
CREATE POLICY "basic_user_access"
  ON users
  FOR SELECT
  USING (
    -- Users can see their own profile
    id = auth.uid()
    OR
    -- Platform admins can see all users
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.id = auth.uid()
    )
    OR
    -- Users can see others in their organization based on org_id direct comparison
    (
      SELECT organization_id 
      FROM users u2 
      WHERE u2.id = auth.uid()
    ) = users.organization_id
  );

-- Create a function to safely check user permissions
CREATE OR REPLACE FUNCTION check_user_permissions(target_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN 
    -- User can access their own data
    target_user_id = auth.uid()
    OR
    -- Platform admins can access all users
    EXISTS (
      SELECT 1 FROM platform_admins pa
      WHERE pa.id = auth.uid()
    )
    OR
    -- Users can access others in their organization
    EXISTS (
      SELECT 1 
      FROM users u1
      JOIN users u2 ON u1.organization_id = u2.organization_id
      WHERE u1.id = auth.uid()
      AND u2.id = target_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_permissions(uuid) TO authenticated;

-- Create indexes to improve policy performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_platform_admins_id ON platform_admins(id);