-- Drop existing RLS policies
DROP POLICY IF EXISTS "allow_organization_members" ON departments;

-- Create new RLS policies for departments
CREATE POLICY "allow_select_departments"
  ON departments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_insert_departments"
  ON departments
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_update_departments"
  ON departments
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_delete_departments"
  ON departments
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Ensure RLS is enabled
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON departments TO authenticated;