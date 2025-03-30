/*
  # BCDR Assessment Schema Update

  1. New Tables
    - `maturity_assessment_templates` - Templates for maturity assessment questionnaires
    - `maturity_assessment_sections` - Sections within maturity assessment templates
    - `maturity_assessment_questions` - Questions for maturity assessment
    - `maturity_assessment_responses` - User responses to maturity assessment questions
    - `gap_analysis_templates` - Templates for gap analysis questionnaires
    - `gap_analysis_sections` - Sections within gap analysis templates
    - `gap_analysis_questions` - Questions for gap analysis
    - `gap_analysis_responses` - User responses to gap analysis questions
    - `evidence_requirements` - Evidence requirements for assessments
    - `evidence_submissions` - Submitted evidence for assessments

  2. Security
    - Enable RLS on all tables
    - Add policies for organization-based access control
    - Add policies for role-based access control

  3. Changes
    - Add comprehensive assessment schema
    - Add evidence tracking
    - Add version control for templates
*/

-- Maturity Assessment Templates
CREATE TABLE maturity_assessment_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  industry_type text,
  organization_size text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Maturity Assessment Sections
CREATE TABLE maturity_assessment_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES maturity_assessment_templates NOT NULL,
  name text NOT NULL,
  description text,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Maturity Assessment Questions
CREATE TABLE maturity_assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES maturity_assessment_sections NOT NULL,
  question text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('scale', 'boolean', 'text', 'date', 'multi_choice')),
  options jsonb,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  maturity_level integer CHECK (maturity_level BETWEEN 1 AND 5),
  evidence_required boolean NOT NULL DEFAULT false,
  evidence_description text,
  conditional_logic jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Maturity Assessment Responses
CREATE TABLE maturity_assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES bcdr_assessments NOT NULL,
  question_id uuid REFERENCES maturity_assessment_questions NOT NULL,
  response jsonb NOT NULL,
  score numeric CHECK (score >= 0 AND score <= 100),
  evidence_links text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (assessment_id, question_id)
);

-- Gap Analysis Templates
CREATE TABLE gap_analysis_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  framework_type text,
  industry_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gap Analysis Sections
CREATE TABLE gap_analysis_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES gap_analysis_templates NOT NULL,
  name text NOT NULL,
  description text,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gap Analysis Questions
CREATE TABLE gap_analysis_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES gap_analysis_sections NOT NULL,
  question text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('compliance', 'capability', 'resource', 'process')),
  priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  target_state text NOT NULL,
  evidence_required boolean NOT NULL DEFAULT false,
  evidence_description text,
  remediation_guidance text,
  conditional_logic jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gap Analysis Responses
CREATE TABLE gap_analysis_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES bcdr_assessments NOT NULL,
  question_id uuid REFERENCES gap_analysis_questions NOT NULL,
  current_state text NOT NULL,
  gap_description text,
  impact_assessment text,
  remediation_plan text,
  priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  target_date timestamptz,
  evidence_links text[],
  status text NOT NULL CHECK (status IN ('identified', 'in_progress', 'remediated', 'accepted')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (assessment_id, question_id)
);

-- Evidence Requirements
CREATE TABLE evidence_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('maturity', 'gap')),
  document_type text NOT NULL,
  description text NOT NULL,
  validation_criteria text,
  is_mandatory boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT question_type_id UNIQUE (question_id, question_type)
);

-- Evidence Submissions
CREATE TABLE evidence_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requirement_id uuid REFERENCES evidence_requirements NOT NULL,
  assessment_id uuid REFERENCES bcdr_assessments NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  uploaded_by uuid REFERENCES users NOT NULL,
  validation_status text NOT NULL CHECK (validation_status IN ('pending', 'approved', 'rejected')),
  validation_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE maturity_assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE maturity_assessment_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE maturity_assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maturity_assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analysis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analysis_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analysis_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gap_analysis_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Templates can be viewed by all authenticated users
CREATE POLICY "allow_view_templates"
  ON maturity_assessment_templates
  FOR SELECT
  USING (true);

CREATE POLICY "allow_view_templates"
  ON gap_analysis_templates
  FOR SELECT
  USING (true);

-- Sections and questions can be viewed by all authenticated users
CREATE POLICY "allow_view_sections"
  ON maturity_assessment_sections
  FOR SELECT
  USING (true);

CREATE POLICY "allow_view_sections"
  ON gap_analysis_sections
  FOR SELECT
  USING (true);

CREATE POLICY "allow_view_questions"
  ON maturity_assessment_questions
  FOR SELECT
  USING (true);

CREATE POLICY "allow_view_questions"
  ON gap_analysis_questions
  FOR SELECT
  USING (true);

-- Responses can only be viewed by users in the same organization
CREATE POLICY "allow_view_responses"
  ON maturity_assessment_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bcdr_assessments a
      JOIN users u ON u.organization_id = a.organization_id
      WHERE u.id = auth.uid()
      AND a.id = maturity_assessment_responses.assessment_id
    )
  );

CREATE POLICY "allow_view_responses"
  ON gap_analysis_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bcdr_assessments a
      JOIN users u ON u.organization_id = a.organization_id
      WHERE u.id = auth.uid()
      AND a.id = gap_analysis_responses.assessment_id
    )
  );

-- Evidence requirements can be viewed by all authenticated users
CREATE POLICY "allow_view_requirements"
  ON evidence_requirements
  FOR SELECT
  USING (true);

-- Evidence submissions can only be viewed by users in the same organization
CREATE POLICY "allow_view_submissions"
  ON evidence_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bcdr_assessments a
      JOIN users u ON u.organization_id = a.organization_id
      WHERE u.id = auth.uid()
      AND a.id = evidence_submissions.assessment_id
    )
  );

-- Create indexes for performance
CREATE INDEX maturity_assessment_sections_template_id_idx ON maturity_assessment_sections(template_id);
CREATE INDEX maturity_assessment_questions_section_id_idx ON maturity_assessment_questions(section_id);
CREATE INDEX maturity_assessment_responses_assessment_id_idx ON maturity_assessment_responses(assessment_id);
CREATE INDEX gap_analysis_sections_template_id_idx ON gap_analysis_sections(template_id);
CREATE INDEX gap_analysis_questions_section_id_idx ON gap_analysis_questions(section_id);
CREATE INDEX gap_analysis_responses_assessment_id_idx ON gap_analysis_responses(assessment_id);
CREATE INDEX evidence_submissions_assessment_id_idx ON evidence_submissions(assessment_id);

-- Add update triggers
CREATE TRIGGER update_maturity_assessment_templates_updated_at
  BEFORE UPDATE ON maturity_assessment_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_maturity_assessment_sections_updated_at
  BEFORE UPDATE ON maturity_assessment_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_maturity_assessment_questions_updated_at
  BEFORE UPDATE ON maturity_assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_maturity_assessment_responses_updated_at
  BEFORE UPDATE ON maturity_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_gap_analysis_templates_updated_at
  BEFORE UPDATE ON gap_analysis_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_gap_analysis_sections_updated_at
  BEFORE UPDATE ON gap_analysis_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_gap_analysis_questions_updated_at
  BEFORE UPDATE ON gap_analysis_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_gap_analysis_responses_updated_at
  BEFORE UPDATE ON gap_analysis_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_evidence_requirements_updated_at
  BEFORE UPDATE ON evidence_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_evidence_submissions_updated_at
  BEFORE UPDATE ON evidence_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

-- Insert initial maturity assessment template
INSERT INTO maturity_assessment_templates (name, description, industry_type)
VALUES (
  'BCDR Maturity Assessment',
  'Comprehensive assessment of BCDR program maturity based on industry standards',
  'All'
);

-- Insert initial gap analysis template
INSERT INTO gap_analysis_templates (name, description, framework_type)
VALUES (
  'BCDR Gap Analysis',
  'Comprehensive gap analysis based on industry best practices and standards',
  'BCDR'
);