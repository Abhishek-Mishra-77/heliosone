/*
  # Add Incident Responses Table

  1. New Table
    - Creates incident_responses table to track response and recovery metrics
    - Stores detection, response, and recovery times
    - Links to organizations and users
    - Includes status tracking and impact assessment

  2. Security
    - Enables RLS
    - Adds policies for organization access
*/

-- Create incident_responses table
CREATE TABLE IF NOT EXISTS incident_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  incident_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status text NOT NULL CHECK (status IN ('detected', 'responding', 'recovering', 'resolved')),
  detection_time interval NOT NULL,
  response_time interval NOT NULL,
  recovery_time interval NOT NULL,
  detected_by uuid REFERENCES users(id),
  resolved_by uuid REFERENCES users(id),
  impact_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_incident_responses_org ON incident_responses(organization_id);
CREATE INDEX idx_incident_responses_type ON incident_responses(incident_type);
CREATE INDEX idx_incident_responses_severity ON incident_responses(severity);
CREATE INDEX idx_incident_responses_status ON incident_responses(status);
CREATE INDEX idx_incident_responses_created ON incident_responses(created_at);

-- Enable RLS
ALTER TABLE incident_responses ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their organization's incidents"
  ON incident_responses
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 
      FROM platform_admins 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage incidents"
  ON incident_responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM users 
      WHERE id = auth.uid() 
      AND organization_id = incident_responses.organization_id 
      AND role IN ('admin', 'super_admin')
    )
    OR 
    EXISTS (
      SELECT 1 
      FROM platform_admins 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM users 
      WHERE id = auth.uid() 
      AND organization_id = incident_responses.organization_id 
      AND role IN ('admin', 'super_admin')
    )
    OR 
    EXISTS (
      SELECT 1 
      FROM platform_admins 
      WHERE id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_incident_responses_updated_at
  BEFORE UPDATE ON incident_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert sample data
INSERT INTO incident_responses (
  organization_id,
  incident_type,
  severity,
  status,
  detection_time,
  response_time,
  recovery_time,
  impact_details
)
SELECT 
  o.id,
  incident_type,
  severity,
  'resolved',
  detection_time,
  response_time,
  recovery_time,
  impact_details
FROM organizations o
CROSS JOIN (
  VALUES 
    ('system_outage', 'high', '10 minutes'::interval, '30 minutes'::interval, '4 hours'::interval, '{"affected_users": 1000, "revenue_impact": 50000}'::jsonb),
    ('data_breach', 'critical', '5 minutes'::interval, '15 minutes'::interval, '2 hours'::interval, '{"affected_records": 500, "severity": "high"}'::jsonb),
    ('network_disruption', 'medium', '15 minutes'::interval, '45 minutes'::interval, '3 hours'::interval, '{"affected_services": ["email", "vpn"], "impact": "moderate"}'::jsonb)
) AS samples(incident_type, severity, detection_time, response_time, recovery_time, impact_details)
WHERE EXISTS (
  SELECT 1 FROM bcdr_assessments WHERE organization_id = o.id
);