/*
  # BCDR Recommendations and Improvements Schema

  1. New Tables
    - `bcdr_standards` - Industry standards and frameworks
    - `bcdr_recommendations` - Recommendations based on assessments
    - `improvement_initiatives` - Tracked improvement initiatives
    - `improvement_metrics` - Metrics for measuring improvements
    - `standard_mappings` - Maps recommendations to standards

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access control

  3. Changes
    - Add comprehensive recommendations tracking
    - Add improvement measurement capabilities
    - Add standards compliance tracking
*/

-- BCDR Standards and Frameworks
CREATE TABLE bcdr_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  version text,
  category text NOT NULL CHECK (category IN ('regulatory', 'industry', 'best_practice', 'framework')),
  description text,
  requirements jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- BCDR Recommendations
CREATE TABLE bcdr_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations NOT NULL,
  assessment_id uuid REFERENCES bcdr_assessments,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('strategic', 'tactical', 'operational')),
  priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  impact_areas text[] NOT NULL,
  estimated_effort text NOT NULL CHECK (estimated_effort IN ('small', 'medium', 'large', 'xlarge')),
  estimated_cost_range jsonb,
  implementation_complexity text NOT NULL CHECK (implementation_complexity IN ('simple', 'moderate', 'complex', 'very_complex')),
  prerequisites text[],
  benefits text[],
  risks text[],
  status text NOT NULL CHECK (status IN ('proposed', 'approved', 'in_progress', 'completed', 'deferred')) DEFAULT 'proposed',
  target_date timestamptz,
  completion_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Improvement Initiatives
CREATE TABLE improvement_initiatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations NOT NULL,
  recommendation_id uuid REFERENCES bcdr_recommendations,
  name text NOT NULL,
  description text NOT NULL,
  objective text NOT NULL,
  scope text NOT NULL,
  status text NOT NULL CHECK (status IN ('planned', 'active', 'completed', 'on_hold')),
  start_date timestamptz,
  target_completion_date timestamptz,
  actual_completion_date timestamptz,
  success_criteria text[],
  dependencies text[],
  stakeholders jsonb,
  resources_required jsonb,
  budget_allocated numeric,
  budget_spent numeric,
  progress_percentage integer CHECK (progress_percentage BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Improvement Metrics
CREATE TABLE improvement_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id uuid REFERENCES improvement_initiatives NOT NULL,
  metric_name text NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('quantitative', 'qualitative', 'binary')),
  description text NOT NULL,
  measurement_frequency text NOT NULL CHECK (measurement_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')),
  baseline_value jsonb NOT NULL,
  target_value jsonb NOT NULL,
  current_value jsonb NOT NULL,
  unit_of_measure text,
  data_source text,
  calculation_method text,
  last_measured_at timestamptz,
  next_measurement_due timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Standard Mappings
CREATE TABLE standard_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id uuid REFERENCES bcdr_standards NOT NULL,
  recommendation_id uuid REFERENCES bcdr_recommendations NOT NULL,
  compliance_level text NOT NULL CHECK (compliance_level IN ('full', 'partial', 'none')),
  mapping_details jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (standard_id, recommendation_id)
);

-- Enable RLS
ALTER TABLE bcdr_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE bcdr_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE standard_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Standards can be viewed by all authenticated users
CREATE POLICY "allow_view_standards"
  ON bcdr_standards
  FOR SELECT
  USING (true);

-- Organization-specific policies for recommendations
CREATE POLICY "allow_view_org_recommendations"
  ON bcdr_recommendations
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Organization-specific policies for initiatives
CREATE POLICY "allow_view_org_initiatives"
  ON improvement_initiatives
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Metrics can be viewed by users in the same organization
CREATE POLICY "allow_view_org_metrics"
  ON improvement_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM improvement_initiatives i
      WHERE i.id = improvement_metrics.initiative_id
      AND i.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Standard mappings can be viewed by users in the same organization
CREATE POLICY "allow_view_org_mappings"
  ON standard_mappings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bcdr_recommendations r
      WHERE r.id = standard_mappings.recommendation_id
      AND r.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Create indexes for performance
CREATE INDEX bcdr_recommendations_organization_id_idx ON bcdr_recommendations(organization_id);
CREATE INDEX bcdr_recommendations_assessment_id_idx ON bcdr_recommendations(assessment_id);
CREATE INDEX improvement_initiatives_organization_id_idx ON improvement_initiatives(organization_id);
CREATE INDEX improvement_initiatives_recommendation_id_idx ON improvement_initiatives(recommendation_id);
CREATE INDEX improvement_metrics_initiative_id_idx ON improvement_metrics(initiative_id);
CREATE INDEX standard_mappings_standard_id_idx ON standard_mappings(standard_id);
CREATE INDEX standard_mappings_recommendation_id_idx ON standard_mappings(recommendation_id);

-- Add update triggers
CREATE TRIGGER update_bcdr_standards_updated_at
  BEFORE UPDATE ON bcdr_standards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_bcdr_recommendations_updated_at
  BEFORE UPDATE ON bcdr_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_improvement_initiatives_updated_at
  BEFORE UPDATE ON improvement_initiatives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_improvement_metrics_updated_at
  BEFORE UPDATE ON improvement_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_standard_mappings_updated_at
  BEFORE UPDATE ON standard_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

-- Insert initial BCDR standards
INSERT INTO bcdr_standards (name, version, category, description, requirements) VALUES
(
  'ISO 22301',
  '2019',
  'regulatory',
  'Business Continuity Management Systems Requirements',
  jsonb_build_object(
    'context', ARRAY['Understanding organization context', 'Interested parties needs and expectations', 'Scope of the BCMS'],
    'leadership', ARRAY['Leadership commitment', 'Business continuity policy', 'Roles and responsibilities'],
    'planning', ARRAY['Actions to address risks and opportunities', 'Business continuity objectives', 'Changes to the BCMS'],
    'support', ARRAY['Resources', 'Competence', 'Awareness', 'Communication', 'Documented information'],
    'operation', ARRAY['Operational planning and control', 'Business impact analysis', 'Risk assessment', 'Business continuity strategies'],
    'performance', ARRAY['Monitoring and measurement', 'Internal audit', 'Management review'],
    'improvement', ARRAY['Nonconformity and corrective action', 'Continual improvement']
  )
),
(
  'NIST SP 800-34',
  'Rev 1',
  'framework',
  'Contingency Planning Guide for Federal Information Systems',
  jsonb_build_object(
    'planning', ARRAY['Develop contingency planning policy', 'Conduct business impact analysis', 'Identify preventive controls'],
    'implementation', ARRAY['Develop recovery strategies', 'Develop contingency plan', 'Plan testing and exercises'],
    'maintenance', ARRAY['Training and awareness', 'Plan maintenance', 'Continuous improvement']
  )
),
(
  'FFIEC BCM',
  '2019',
  'regulatory',
  'Business Continuity Management Booklet',
  jsonb_build_object(
    'governance', ARRAY['Board and senior management oversight', 'BCM strategy', 'Program management'],
    'risk_management', ARRAY['Risk assessment', 'Business impact analysis', 'Risk monitoring'],
    'implementation', ARRAY['Business continuity plan development', 'Crisis management', 'Training and testing']
  )
);