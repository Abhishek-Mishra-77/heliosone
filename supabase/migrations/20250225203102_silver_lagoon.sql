-- Drop existing policies
DROP POLICY IF EXISTS "allow_select_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_insert_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_update_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_delete_business_processes" ON business_processes;

-- Create new simplified policies that handle all cases

-- Select policy - Anyone in the organization can view processes
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

-- Insert policy - Only admins and department heads can create
CREATE POLICY "allow_insert_business_processes"
  ON business_processes
  FOR INSERT
  WITH CHECK (
    -- Organization admins can create
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can create
    EXISTS (
      SELECT 1 FROM users u
      JOIN department_users du ON du.user_id = u.id
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND du.role = 'department_admin'
    )
    OR
    -- Platform admins can create
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Update policy - Only admins and department heads can update
CREATE POLICY "allow_update_business_processes"
  ON business_processes
  FOR UPDATE
  USING (
    -- Organization admins can update
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can update
    EXISTS (
      SELECT 1 FROM users u
      JOIN department_users du ON du.user_id = u.id
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND du.role = 'department_admin'
    )
    OR
    -- Platform admins can update
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    -- Organization admins can update
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can update
    EXISTS (
      SELECT 1 FROM users u
      JOIN department_users du ON du.user_id = u.id
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND du.role = 'department_admin'
    )
    OR
    -- Platform admins can update
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Delete policy - Only admins and department heads can delete
CREATE POLICY "allow_delete_business_processes"
  ON business_processes
  FOR DELETE
  USING (
    -- Organization admins can delete
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can delete
    EXISTS (
      SELECT 1 FROM users u
      JOIN department_users du ON du.user_id = u.id
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND du.role = 'department_admin'
    )
    OR
    -- Platform admins can delete
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Create function to get processes for an organization
CREATE OR REPLACE FUNCTION get_organization_processes(org_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  priority text,
  category text,
  rto integer,
  rpo integer,
  mtd integer,
  revenue_impact jsonb,
  operational_impact jsonb,
  reputational_impact jsonb,
  department_id uuid,
  created_at timestamptz
) AS $$
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
  SELECT 
    bp.id,
    bp.name,
    bp.description,
    bp.priority,
    bp.category,
    bp.rto,
    bp.rpo,
    bp.mtd,
    bp.revenue_impact,
    bp.operational_impact,
    bp.reputational_impact,
    bp.department_id,
    bp.created_at
  FROM business_processes bp
  WHERE bp.organization_id = org_id
  ORDER BY 
    CASE bp.priority 
      WHEN 'critical' THEN 1 
      WHEN 'high' THEN 2 
      WHEN 'medium' THEN 3 
      WHEN 'low' THEN 4 
    END,
    bp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_processes_org_id 
ON business_processes(organization_id);

CREATE INDEX IF NOT EXISTS idx_business_processes_dept_id 
ON business_processes(department_id);

CREATE INDEX IF NOT EXISTS idx_business_processes_priority 
ON business_processes(priority);

CREATE INDEX IF NOT EXISTS idx_business_processes_created 
ON business_processes(created_at);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_organization_processes(uuid) TO authenticated;