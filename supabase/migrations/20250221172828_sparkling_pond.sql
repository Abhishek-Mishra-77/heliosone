-- Drop existing materialized view and related objects
DROP MATERIALIZED VIEW IF EXISTS department_access_rights CASCADE;
DROP FUNCTION IF EXISTS refresh_department_access_rights() CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "allow_view_department_users" ON department_users;
DROP POLICY IF EXISTS "allow_manage_department_users" ON department_users;

-- Create simplified RLS policies for department_users
CREATE POLICY "allow_view_department_users"
  ON department_users
  FOR SELECT
  USING (
    -- Users can view members of departments in their organization
    EXISTS (
      SELECT 1 FROM users u
      JOIN departments d ON d.organization_id = u.organization_id
      WHERE u.id = auth.uid()
      AND d.id = department_users.department_id
    )
    OR
    -- Platform admins can view all
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_manage_department_users"
  ON department_users
  FOR ALL
  USING (
    -- Organization admins can manage department users
    EXISTS (
      SELECT 1 FROM users u
      JOIN departments d ON d.organization_id = u.organization_id
      WHERE u.id = auth.uid()
      AND d.id = department_users.department_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
    OR
    -- Department admins can manage their department users
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = department_users.department_id
      AND du.user_id = auth.uid()
      AND du.role = 'department_admin'
    )
    OR
    -- Platform admins can manage all
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    -- Organization admins can manage department users
    EXISTS (
      SELECT 1 FROM users u
      JOIN departments d ON d.organization_id = u.organization_id
      WHERE u.id = auth.uid()
      AND d.id = department_users.department_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
    OR
    -- Department admins can manage their department users
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = department_users.department_id
      AND du.user_id = auth.uid()
      AND du.role = 'department_admin'
    )
    OR
    -- Platform admins can manage all
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Update the get_available_department_users function
CREATE OR REPLACE FUNCTION get_available_department_users(dept_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  email text,
  user_role text
) SECURITY DEFINER AS $$
BEGIN
  -- Verify the caller has permission to manage the department
  IF NOT (
    -- Check if user is an organization admin
    EXISTS (
      SELECT 1 FROM users u
      JOIN departments d ON d.organization_id = u.organization_id
      WHERE u.id = auth.uid()
      AND d.id = dept_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
    OR
    -- Check if user is a department admin
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = dept_id
      AND du.user_id = auth.uid()
      AND du.role = 'department_admin'
    )
    OR
    -- Check if user is a platform admin
    auth.uid() IN (SELECT id FROM platform_admins)
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  RETURN QUERY
  WITH dept_org AS (
    SELECT d.organization_id 
    FROM departments d
    WHERE d.id = dept_id
  )
  SELECT DISTINCT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.role as user_role
  FROM users u
  JOIN dept_org ON dept_org.organization_id = u.organization_id
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