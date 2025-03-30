-- Drop existing policies
DROP POLICY IF EXISTS "allow_select_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_insert_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_update_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_delete_business_processes" ON business_processes;

-- Create new policies with proper department-level restrictions

-- Select policy - Controls who can view processes
CREATE POLICY "allow_select_business_processes"
  ON business_processes
  FOR SELECT
  USING (
    -- Platform admins can see all processes
    auth.uid() IN (SELECT id FROM platform_admins)
    OR
    -- Organization admins can see all processes in their org
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can see all processes in their org
    EXISTS (
      SELECT 1 FROM users u
      JOIN department_users du ON du.user_id = u.id
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND du.role = 'department_admin'
    )
    OR
    -- Department assessors/viewers can only see processes from their department
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.user_id = auth.uid()
      AND du.department_id = business_processes.department_id
      AND du.role IN ('assessor', 'viewer')
    )
  );

-- Insert policy - Controls who can create processes
CREATE POLICY "allow_insert_business_processes"
  ON business_processes
  FOR INSERT
  WITH CHECK (
    -- Platform admins can create processes
    auth.uid() IN (SELECT id FROM platform_admins)
    OR
    -- Organization admins can create processes in their org
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can create processes for their department
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.user_id = auth.uid()
      AND du.department_id = business_processes.department_id
      AND du.role = 'department_admin'
    )
  );

-- Update policy - Controls who can modify processes
CREATE POLICY "allow_update_business_processes"
  ON business_processes
  FOR UPDATE
  USING (
    -- Platform admins can update processes
    auth.uid() IN (SELECT id FROM platform_admins)
    OR
    -- Organization admins can update processes in their org
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can update their department's processes
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.user_id = auth.uid()
      AND du.department_id = business_processes.department_id
      AND du.role = 'department_admin'
    )
  )
  WITH CHECK (
    -- Platform admins can update processes
    auth.uid() IN (SELECT id FROM platform_admins)
    OR
    -- Organization admins can update processes in their org
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can update their department's processes
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.user_id = auth.uid()
      AND du.department_id = business_processes.department_id
      AND du.role = 'department_admin'
    )
  );

-- Delete policy - Controls who can remove processes
CREATE POLICY "allow_delete_business_processes"
  ON business_processes
  FOR DELETE
  USING (
    -- Platform admins can delete processes
    auth.uid() IN (SELECT id FROM platform_admins)
    OR
    -- Organization admins can delete processes in their org
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role = 'admin'
    )
    OR
    -- Department heads can delete their department's processes
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.user_id = auth.uid()
      AND du.department_id = business_processes.department_id
      AND du.role = 'department_admin'
    )
  );

-- Create function to get processes with proper access control
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
DECLARE
  user_role text;
  user_dept_id uuid;
  is_dept_head boolean;
BEGIN
  -- Get user's role and department info
  SELECT 
    u.role,
    du.department_id,
    du.role = 'department_admin'
  INTO user_role, user_dept_id, is_dept_head
  FROM users u
  LEFT JOIN department_users du ON du.user_id = u.id
  WHERE u.id = auth.uid()
  LIMIT 1;

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
  AND (
    -- Platform admins see all
    auth.uid() IN (SELECT id FROM platform_admins)
    -- Org admins see all in their org
    OR user_role = 'admin'
    -- Department heads see all in their org
    OR is_dept_head
    -- Department users see only their department's processes
    OR (
      user_dept_id IS NOT NULL 
      AND bp.department_id = user_dept_id
    )
  )
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_organization_processes(uuid) TO authenticated;