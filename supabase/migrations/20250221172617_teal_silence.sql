-- Drop existing policies
DROP POLICY IF EXISTS "allow_organization_members" ON department_users;
DROP POLICY IF EXISTS "users_can_view_department_members" ON department_users;
DROP POLICY IF EXISTS "allow_manage_assignments" ON department_users;

-- Create comprehensive RLS policies for department_users
CREATE POLICY "allow_view_department_users"
  ON department_users
  FOR SELECT
  USING (
    -- Users can view members of departments they belong to
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = department_users.department_id
      AND du.user_id = auth.uid()
    )
    OR
    -- Organization admins can view all department users
    EXISTS (
      SELECT 1 FROM users u
      JOIN departments d ON d.organization_id = u.organization_id
      WHERE u.id = auth.uid()
      AND d.id = department_users.department_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
    OR
    -- Platform admins can view all
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_insert_department_users"
  ON department_users
  FOR INSERT
  WITH CHECK (
    -- Organization admins can add users to departments
    EXISTS (
      SELECT 1 FROM users u
      JOIN departments d ON d.organization_id = u.organization_id
      WHERE u.id = auth.uid()
      AND d.id = department_users.department_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
    OR
    -- Department admins can add users to their departments
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = department_users.department_id
      AND du.user_id = auth.uid()
      AND du.role = 'department_admin'
    )
    OR
    -- Platform admins can add users
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_delete_department_users"
  ON department_users
  FOR DELETE
  USING (
    -- Organization admins can remove users from departments
    EXISTS (
      SELECT 1 FROM users u
      JOIN departments d ON d.organization_id = u.organization_id
      WHERE u.id = auth.uid()
      AND d.id = department_users.department_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
    OR
    -- Department admins can remove users from their departments
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = department_users.department_id
      AND du.user_id = auth.uid()
      AND du.role = 'department_admin'
    )
    OR
    -- Platform admins can remove users
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Create function to check if user has department management permissions
CREATE OR REPLACE FUNCTION can_manage_department(dept_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    -- Check if user is organization admin
    SELECT 1 FROM users u
    JOIN departments d ON d.organization_id = u.organization_id
    WHERE u.id = auth.uid()
    AND d.id = dept_id
    AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
  )
  OR EXISTS (
    -- Check if user is department admin
    SELECT 1 FROM department_users du
    WHERE du.department_id = dept_id
    AND du.user_id = auth.uid()
    AND du.role = 'department_admin'
  )
  OR EXISTS (
    -- Check if user is platform admin
    SELECT 1 FROM platform_admins
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION can_manage_department(uuid) TO authenticated;