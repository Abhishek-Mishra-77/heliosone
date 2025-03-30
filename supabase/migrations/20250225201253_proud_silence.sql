-- Drop existing policies
DROP POLICY IF EXISTS "users_can_view_org_processes" ON business_processes;
DROP POLICY IF EXISTS "users_can_insert_org_processes" ON business_processes;
DROP POLICY IF EXISTS "users_can_update_org_processes" ON business_processes;
DROP POLICY IF EXISTS "users_can_delete_org_processes" ON business_processes;
DROP POLICY IF EXISTS "platform_admins_full_access" ON business_processes;
DROP POLICY IF EXISTS "allow_select_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_insert_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_update_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_delete_business_processes" ON business_processes;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_department_processes(uuid);
DROP FUNCTION IF EXISTS get_organization_processes(uuid);

-- Create new simplified policies
CREATE POLICY "allow_select_business_processes"
  ON business_processes
  FOR SELECT
  USING (
    -- Users can see processes in their organization
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
    OR
    -- Platform admins can see all
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_insert_business_processes"
  ON business_processes
  FOR INSERT
  WITH CHECK (
    -- Users can create processes in their organization
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
    OR
    -- Platform admins can create processes
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_update_business_processes"
  ON business_processes
  FOR UPDATE
  USING (
    -- Users can update processes in their organization
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
    OR
    -- Platform admins can update processes
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    -- Users can update processes in their organization
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
    OR
    -- Platform admins can update processes
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_delete_business_processes"
  ON business_processes
  FOR DELETE
  USING (
    -- Users can delete processes in their organization
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
    OR
    -- Platform admins can delete processes
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

CREATE INDEX IF NOT EXISTS idx_business_processes_priority 
ON business_processes(priority);

CREATE INDEX IF NOT EXISTS idx_business_processes_created 
ON business_processes(created_at);

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_organization_processes(uuid) TO authenticated;