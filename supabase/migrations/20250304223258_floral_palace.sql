-- Add missing columns to business_processes table
DO $$ 
BEGIN
  -- Add alternative_procedures if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_processes' 
    AND column_name = 'alternative_procedures'
  ) THEN
    ALTER TABLE business_processes 
    ADD COLUMN alternative_procedures text;
  END IF;

  -- Add assessment_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_processes' 
    AND column_name = 'assessment_id'
  ) THEN
    ALTER TABLE business_processes 
    ADD COLUMN assessment_id uuid REFERENCES bcdr_assessments(id);
  END IF;

  -- Add index for assessment_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_business_processes_assessment_id'
  ) THEN
    CREATE INDEX idx_business_processes_assessment_id 
    ON business_processes(assessment_id);
  END IF;

END $$;

-- Update RLS policies to include assessment_id
DROP POLICY IF EXISTS "allow_select_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_insert_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_update_business_processes" ON business_processes;
DROP POLICY IF EXISTS "allow_delete_business_processes" ON business_processes;

-- Create new policies
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