-- First, drop all existing policies
DO $$ 
BEGIN
  -- Drop all policies from bcdr_assessments
  DROP POLICY IF EXISTS "assessments_read_own_org" ON bcdr_assessments;
  DROP POLICY IF EXISTS "assessments_insert_managers" ON bcdr_assessments;
  DROP POLICY IF EXISTS "allow_read_assessments" ON bcdr_assessments;
  DROP POLICY IF EXISTS "allow_insert_assessments" ON bcdr_assessments;
  DROP POLICY IF EXISTS "allow_update_assessments" ON bcdr_assessments;
  DROP POLICY IF EXISTS "assessments_access" ON bcdr_assessments;
  DROP POLICY IF EXISTS "allow_manage_assessments" ON bcdr_assessments;
END $$;

-- Create new policies with unique names
CREATE POLICY "bcdr_assessments_select"
  ON bcdr_assessments
  FOR SELECT
  USING (
    -- Users can see assessments from their organization
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
    OR
    -- Platform admins can see all
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "bcdr_assessments_insert"
  ON bcdr_assessments
  FOR INSERT
  WITH CHECK (
    -- Organization admins can create assessments
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND organization_id = bcdr_assessments.organization_id
      AND role = 'admin'
    )
    OR
    -- Platform admins can create assessments
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "bcdr_assessments_update"
  ON bcdr_assessments
  FOR UPDATE
  USING (
    -- Organization admins can update assessments
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND organization_id = bcdr_assessments.organization_id
      AND role = 'admin'
    )
    OR
    -- Platform admins can update assessments
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    -- Organization admins can update assessments
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND organization_id = bcdr_assessments.organization_id
      AND role = 'admin'
    )
    OR
    -- Platform admins can update assessments
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Create function to check assessment access
CREATE OR REPLACE FUNCTION check_assessment_access(assessment_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM bcdr_assessments a
    JOIN users u ON u.organization_id = a.organization_id
    WHERE a.id = assessment_id
    AND u.id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM platform_admins
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_assessment_access(uuid) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bcdr_assessments_org_type 
ON bcdr_assessments(organization_id, assessment_type);

CREATE INDEX IF NOT EXISTS idx_bcdr_assessments_status 
ON bcdr_assessments(status);