-- Create or replace process statistics function
CREATE OR REPLACE FUNCTION get_process_stats(org_id uuid)
RETURNS TABLE (
  total_processes bigint,
  critical_processes bigint,
  high_priority_processes bigint,
  avg_rto numeric,
  avg_rpo numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_processes,
    COUNT(*) FILTER (WHERE priority = 'critical') as critical_processes,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_processes,
    ROUND(AVG(rto), 2) as avg_rto,
    ROUND(AVG(rpo), 2) as avg_rpo
  FROM business_processes
  WHERE organization_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_process_stats(uuid) TO authenticated;

-- Add new columns if they don't exist
DO $$ 
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_processes' AND column_name = 'supply_chain_impact'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE business_processes ADD COLUMN supply_chain_impact jsonb;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_processes' AND column_name = 'cross_border_operations'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE business_processes ADD COLUMN cross_border_operations jsonb;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_processes' AND column_name = 'environmental_impact'
  ) INTO column_exists;
  
  IF NOT column_exists THEN
    ALTER TABLE business_processes ADD COLUMN environmental_impact jsonb;
  END IF;
END $$;

-- Update or add constraints
ALTER TABLE business_processes DROP CONSTRAINT IF EXISTS business_processes_priority_check;
ALTER TABLE business_processes ADD CONSTRAINT business_processes_priority_check 
  CHECK (priority IN ('critical', 'high', 'medium', 'low'));

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'business_processes_organization_id_idx'
  ) THEN
    CREATE INDEX business_processes_organization_id_idx ON business_processes(organization_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'business_processes_priority_idx'
  ) THEN
    CREATE INDEX business_processes_priority_idx ON business_processes(priority);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'business_processes_category_idx'
  ) THEN
    CREATE INDEX business_processes_category_idx ON business_processes(category);
  END IF;
END $$;

-- Drop and recreate RLS policies
DROP POLICY IF EXISTS "users_can_view_org_processes" ON business_processes;
DROP POLICY IF EXISTS "users_can_insert_org_processes" ON business_processes;
DROP POLICY IF EXISTS "users_can_update_org_processes" ON business_processes;
DROP POLICY IF EXISTS "users_can_delete_org_processes" ON business_processes;
DROP POLICY IF EXISTS "platform_admins_full_access" ON business_processes;

-- Create RLS policies
CREATE POLICY "users_can_view_org_processes"
  ON business_processes
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "users_can_insert_org_processes"
  ON business_processes
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "users_can_update_org_processes"
  ON business_processes
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "users_can_delete_org_processes"
  ON business_processes
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "platform_admins_full_access"
  ON business_processes
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM platform_admins)
  );