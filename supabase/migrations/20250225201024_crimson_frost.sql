-- Drop existing policies
DROP POLICY IF EXISTS "allow_select_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_insert_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_update_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_delete_business_processes" ON business_processes;

-- Create new simplified policies
CREATE POLICY "allow_select_business_processes"
  ON business_processes
  FOR SELECT
  USING (
    -- Users can see processes in their organization
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
    )
    OR
    -- Platform admins can see all
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_insert_business_processes"
  ON business_processes
  FOR INSERT
  WITH CHECK (
    -- Organization admins can create processes
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can create processes
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND EXISTS (
        SELECT 1 FROM department_users du
        WHERE du.user_id = auth.uid()
        AND du.role = 'department_admin'
      )
    )
    OR
    -- Platform admins can create processes
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_update_business_processes"
  ON business_processes
  FOR UPDATE
  USING (
    -- Organization admins can update processes
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can update processes
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND EXISTS (
        SELECT 1 FROM department_users du
        WHERE du.user_id = auth.uid()
        AND du.role = 'department_admin'
      )
    )
    OR
    -- Platform admins can update processes
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    -- Organization admins can update processes
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can update processes
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND EXISTS (
        SELECT 1 FROM department_users du
        WHERE du.user_id = auth.uid()
        AND du.role = 'department_admin'
      )
    )
    OR
    -- Platform admins can update processes
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_delete_business_processes"
  ON business_processes
  FOR DELETE
  USING (
    -- Organization admins can delete processes
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can delete processes
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND EXISTS (
        SELECT 1 FROM department_users du
        WHERE du.user_id = auth.uid()
        AND du.role = 'department_admin'
      )
    )
    OR
    -- Platform admins can delete processes
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Update the function to return all processes for an organization
CREATE OR REPLACE FUNCTION get_organization_processes(org_id uuid)
RETURNS SETOF business_processes
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the caller has permission to access the organization
  IF NOT EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.organization_id = org_id
  ) AND NOT EXISTS (
    SELECT 1 FROM platform_admins
    WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  RETURN QUERY
  SELECT bp.*
  FROM business_processes bp
  WHERE bp.organization_id = org_id
  ORDER BY bp.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_organization_processes(uuid) TO authenticated;