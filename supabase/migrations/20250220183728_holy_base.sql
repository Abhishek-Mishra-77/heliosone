-- Add department_id and owner_id to business processes
ALTER TABLE business_processes 
ADD COLUMN department_id uuid REFERENCES departments(id),
ADD COLUMN owner_id uuid REFERENCES users(id),
ALTER COLUMN owner DROP NOT NULL; -- Drop the old text owner field constraint

-- Create index for new columns
CREATE INDEX business_processes_department_id_idx ON business_processes(department_id);
CREATE INDEX business_processes_owner_id_idx ON business_processes(owner_id);

-- Update RLS policies to enforce department-level access
DROP POLICY IF EXISTS "users_can_view_org_processes" ON business_processes;
DROP POLICY IF EXISTS "users_can_insert_org_processes" ON business_processes;
DROP POLICY IF EXISTS "users_can_update_org_processes" ON business_processes;
DROP POLICY IF EXISTS "users_can_delete_org_processes" ON business_processes;

-- View policy - Users can view processes if:
-- 1. They are in the same organization
-- 2. They are the process owner
-- 3. They are a department admin/assessor for the process's department
CREATE POLICY "allow_view_processes"
  ON business_processes
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) OR
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = business_processes.department_id
      AND du.user_id = auth.uid()
      AND du.role IN ('department_admin', 'assessor')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Insert policy - Users can create processes if:
-- 1. They are a department admin/assessor for the department
-- 2. They are an org admin/bcdr manager
CREATE POLICY "allow_insert_processes"
  ON business_processes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = business_processes.department_id
      AND du.user_id = auth.uid()
      AND du.role IN ('department_admin', 'assessor')
    ) OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Update policy - Users can update processes if:
-- 1. They are the process owner
-- 2. They are a department admin for the department
-- 3. They are an org admin/bcdr manager
CREATE POLICY "allow_update_processes"
  ON business_processes
  FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = business_processes.department_id
      AND du.user_id = auth.uid()
      AND du.role = 'department_admin'
    ) OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = business_processes.department_id
      AND du.user_id = auth.uid()
      AND du.role = 'department_admin'
    ) OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Delete policy - Only department admins and org admins can delete processes
CREATE POLICY "allow_delete_processes"
  ON business_processes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = business_processes.department_id
      AND du.user_id = auth.uid()
      AND du.role = 'department_admin'
    ) OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = business_processes.organization_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Create function to get processes by department
CREATE OR REPLACE FUNCTION get_department_processes(dept_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  priority text,
  owner_name text,
  owner_email text,
  rto integer,
  rpo integer,
  revenue_impact jsonb,
  operational_score integer,
  reputational_score integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.priority,
    u.full_name as owner_name,
    u.email as owner_email,
    p.rto,
    p.rpo,
    p.revenue_impact,
    (p.operational_impact->>'score')::integer as operational_score,
    (p.reputational_impact->>'score')::integer as reputational_score
  FROM business_processes p
  LEFT JOIN users u ON u.id = p.owner_id
  WHERE p.department_id = dept_id
  ORDER BY 
    CASE p.priority 
      WHEN 'critical' THEN 1 
      WHEN 'high' THEN 2 
      WHEN 'medium' THEN 3 
      WHEN 'low' THEN 4 
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_department_processes(uuid) TO authenticated;