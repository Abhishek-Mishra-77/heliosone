-- Drop existing policies
DROP POLICY IF EXISTS "allow_view_department_users" ON department_users;
DROP POLICY IF EXISTS "allow_manage_department_users" ON department_users;

-- Create simplified non-recursive policies
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
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
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
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
    OR
    -- Platform admins can remove users
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
    AND role IN ('super_admin', 'admin', 'bcdr_manager')
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_available_department_users(uuid) TO authenticated;