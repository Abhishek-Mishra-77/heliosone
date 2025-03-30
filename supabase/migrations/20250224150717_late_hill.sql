-- Drop existing role check constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Update existing BCDR managers to admin role
UPDATE users 
SET role = 'admin'
WHERE role = 'bcdr_manager';

-- Add new role check constraint
ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('super_admin', 'admin', 'user'));

-- Update function to handle new role structure
CREATE OR REPLACE FUNCTION get_available_department_users(dept_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  user_role text
) SECURITY DEFINER AS $$
DECLARE
  dept_org_id uuid;
BEGIN
  -- Get the organization ID for the department
  SELECT organization_id INTO dept_org_id
  FROM departments
  WHERE id = dept_id;

  -- Check permissions
  IF NOT EXISTS (
    -- Check if user is an organization admin
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND organization_id = dept_org_id
    AND role = 'admin'
  ) AND NOT EXISTS (
    -- Check if user is a platform admin
    SELECT 1 FROM platform_admins
    WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Return available users
  RETURN QUERY
  SELECT DISTINCT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.role as user_role
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

-- Update RLS policies to use simplified role structure
DROP POLICY IF EXISTS "allow_select_department_users" ON department_users;
DROP POLICY IF EXISTS "allow_insert_department_users" ON department_users;
DROP POLICY IF EXISTS "allow_delete_department_users" ON department_users;

CREATE POLICY "allow_select_department_users"
  ON department_users
  FOR SELECT
  USING (
    -- Users can view departments in their organization
    EXISTS (
      SELECT 1 FROM departments d
      JOIN users u ON u.organization_id = d.organization_id
      WHERE u.id = auth.uid()
      AND d.id = department_users.department_id
    )
    OR
    -- Platform admins can view all
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_insert_department_users"
  ON department_users
  FOR INSERT
  WITH CHECK (
    -- Organization admins can add users
    EXISTS (
      SELECT 1 FROM departments d
      JOIN users u ON u.organization_id = d.organization_id
      WHERE u.id = auth.uid()
      AND d.id = department_users.department_id
      AND u.role = 'admin'
    )
    OR
    -- Platform admins can add users
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_delete_department_users"
  ON department_users
  FOR DELETE
  USING (
    -- Organization admins can remove users
    EXISTS (
      SELECT 1 FROM departments d
      JOIN users u ON u.organization_id = d.organization_id
      WHERE u.id = auth.uid()
      AND d.id = department_users.department_id
      AND u.role = 'admin'
    )
    OR
    -- Platform admins can remove users
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Update other relevant policies
DROP POLICY IF EXISTS "allow_user_access" ON users;

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

-- Update any existing views or functions that reference the old role
CREATE OR REPLACE VIEW admin_users AS
SELECT id, full_name, email, organization_id
FROM users
WHERE role = 'admin';

-- Grant necessary permissions
GRANT SELECT ON admin_users TO authenticated;