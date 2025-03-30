-- Create business processes table
CREATE TABLE business_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations NOT NULL,
  name text NOT NULL,
  description text,
  owner text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  category text NOT NULL,
  dependencies text[] DEFAULT '{}',
  stakeholders text[] DEFAULT '{}',
  critical_periods text[] DEFAULT '{}',
  alternative_procedures text,
  rto integer NOT NULL, -- Recovery Time Objective in hours
  rpo integer NOT NULL, -- Recovery Point Objective in hours
  mtd integer NOT NULL, -- Maximum Tolerable Downtime in hours
  revenue_impact jsonb NOT NULL,
  operational_impact jsonb NOT NULL,
  reputational_impact jsonb NOT NULL,
  costs jsonb NOT NULL,
  applications jsonb[] DEFAULT '{}',
  infrastructure_dependencies jsonb[] DEFAULT '{}',
  external_dependencies jsonb[] DEFAULT '{}',
  data_requirements jsonb NOT NULL,
  supply_chain_impact jsonb,
  cross_border_operations jsonb,
  environmental_impact jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE business_processes ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX business_processes_organization_id_idx ON business_processes(organization_id);
CREATE INDEX business_processes_priority_idx ON business_processes(priority);
CREATE INDEX business_processes_category_idx ON business_processes(category);

-- Add update trigger
CREATE TRIGGER update_business_processes_updated_at
  BEFORE UPDATE ON business_processes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

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

-- Add platform admin policies
CREATE POLICY "platform_admins_full_access"
  ON business_processes
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Create function to get process statistics
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