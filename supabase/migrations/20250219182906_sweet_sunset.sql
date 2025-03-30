-- Drop and recreate business_processes table with proper structure
DROP TABLE IF EXISTS business_processes CASCADE;

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

-- Insert sample data for testing
DO $$ 
DECLARE
  org_id uuid;
BEGIN
  -- Get first organization's ID
  SELECT id INTO org_id FROM organizations LIMIT 1;

  IF org_id IS NOT NULL THEN
    INSERT INTO business_processes (
      organization_id,
      name,
      description,
      owner,
      priority,
      category,
      dependencies,
      stakeholders,
      critical_periods,
      alternative_procedures,
      rto,
      rpo,
      mtd,
      revenue_impact,
      operational_impact,
      reputational_impact,
      costs,
      applications,
      infrastructure_dependencies,
      external_dependencies,
      data_requirements
    ) VALUES (
      org_id,
      'Financial Reporting',
      'Core financial reporting and accounting processes',
      'Finance Director',
      'critical',
      'Finance',
      ARRAY['ERP System', 'Financial Database'],
      ARRAY['CFO', 'Finance Team', 'Auditors'],
      ARRAY['Month-end', 'Quarter-end', 'Year-end'],
      'Manual processing with offline systems',
      4,
      1,
      8,
      '{"daily": 50000, "weekly": 350000, "monthly": 1500000}'::jsonb,
      '{"score": 90, "details": "Critical impact on financial operations"}'::jsonb,
      '{"score": 85, "details": "High visibility to stakeholders"}'::jsonb,
      '{"direct": 25000, "indirect": 15000, "recovery": 10000}'::jsonb,
      ARRAY['{"name": "ERP System", "type": "internal", "criticality": "critical", "description": "Core financial system"}'::jsonb],
      ARRAY['{"name": "Financial Database", "type": "database", "description": "Primary financial data store"}'::jsonb],
      ARRAY['{"name": "Bank Services", "type": "service", "provider": "Bank", "description": "Banking operations"}'::jsonb],
      '{"classification": "confidential", "backupFrequency": "hourly", "retentionPeriod": "7 years", "compliance": ["SOX", "GAAP"]}'::jsonb
    );
  END IF;
END $$;