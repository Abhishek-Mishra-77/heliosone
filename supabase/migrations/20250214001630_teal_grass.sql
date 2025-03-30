/*
  # Department Questionnaires Schema

  1. New Tables
    - `department_questionnaire_templates`
      - Templates for department-specific questions
    - `department_questionnaire_sections`
      - Sections within questionnaires
    - `department_questions`
      - Individual questions for each department type
    - `department_question_responses`
      - Responses to department questions

  2. Changes
    - Adds department type-specific questionnaire support
    - Enables weighted scoring per department type
    - Supports conditional questions based on department role

  3. Security
    - RLS policies for all new tables
    - Role-based access control
*/

-- Department questionnaire templates
CREATE TABLE department_questionnaire_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  department_type text NOT NULL CHECK (department_type IN ('department', 'business_unit', 'team', 'division')),
  version integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Questionnaire sections
CREATE TABLE department_questionnaire_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES department_questionnaire_templates NOT NULL,
  name text NOT NULL,
  description text,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Department-specific questions
CREATE TABLE department_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES department_questionnaire_sections NOT NULL,
  question text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('boolean', 'scale', 'text', 'date')),
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  required boolean NOT NULL DEFAULT true,
  evidence_required boolean NOT NULL DEFAULT false,
  conditional_logic jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Department question responses
CREATE TABLE department_question_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_assessment_id uuid REFERENCES department_assessments NOT NULL,
  question_id uuid REFERENCES department_questions NOT NULL,
  response jsonb NOT NULL,
  score numeric CHECK (score >= 0 AND score <= 100),
  evidence_links text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (department_assessment_id, question_id)
);

-- Enable RLS
ALTER TABLE department_questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_questionnaire_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_question_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "allow_view_templates"
  ON department_questionnaire_templates
  FOR SELECT
  USING (true);

CREATE POLICY "allow_view_sections"
  ON department_questionnaire_sections
  FOR SELECT
  USING (true);

CREATE POLICY "allow_view_questions"
  ON department_questions
  FOR SELECT
  USING (true);

CREATE POLICY "allow_view_own_responses"
  ON department_question_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM department_assessments da
      JOIN departments d ON d.id = da.department_id
      JOIN users u ON u.organization_id = d.organization_id
      WHERE u.id = auth.uid()
      AND da.id = department_question_responses.department_assessment_id
    )
  );

CREATE POLICY "allow_create_own_responses"
  ON department_question_responses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM department_assessments da
      JOIN departments d ON d.id = da.department_id
      JOIN department_users du ON du.department_id = d.id
      WHERE du.user_id = auth.uid()
      AND du.role IN ('department_admin', 'assessor')
      AND da.id = department_question_responses.department_assessment_id
    )
  );

-- Indexes for performance
CREATE INDEX department_questions_section_id_idx ON department_questions(section_id);
CREATE INDEX department_question_responses_assessment_id_idx ON department_question_responses(department_assessment_id);
CREATE INDEX department_questionnaire_sections_template_id_idx ON department_questionnaire_sections(template_id);

-- Insert initial questionnaire templates
INSERT INTO department_questionnaire_templates (name, description, department_type) VALUES
  ('IT Department Assessment', 'Comprehensive assessment for IT departments', 'department'),
  ('Finance Department Assessment', 'Risk and continuity assessment for finance departments', 'department'),
  ('Operations Assessment', 'Operational resilience assessment', 'department'),
  ('HR Department Assessment', 'Personnel and workplace safety assessment', 'department');

-- Insert sections for IT Department template
WITH it_template AS (
  SELECT id FROM department_questionnaire_templates WHERE name = 'IT Department Assessment' LIMIT 1
)
INSERT INTO department_questionnaire_sections (template_id, name, description, weight, order_index) 
SELECT 
  it_template.id,
  name,
  description,
  weight,
  order_index
FROM (
  VALUES 
    ('Technical Recovery', 'Assessment of technical recovery capabilities', 25, 1),
    ('Data Protection', 'Evaluation of data backup and protection measures', 25, 2),
    ('System Resilience', 'Analysis of system redundancy and failover', 25, 3),
    ('Cyber Security', 'Assessment of security controls and incident response', 25, 4)
) AS sections(name, description, weight, order_index)
CROSS JOIN it_template;

-- Insert sections for Finance Department template
WITH finance_template AS (
  SELECT id FROM department_questionnaire_templates WHERE name = 'Finance Department Assessment' LIMIT 1
)
INSERT INTO department_questionnaire_sections (template_id, name, description, weight, order_index)
SELECT 
  finance_template.id,
  name,
  description,
  weight,
  order_index
FROM (
  VALUES 
    ('Financial Controls', 'Assessment of financial control measures', 30, 1),
    ('Payment Systems', 'Evaluation of payment processing resilience', 25, 2),
    ('Reporting Capabilities', 'Analysis of financial reporting continuity', 25, 3),
    ('Compliance', 'Assessment of regulatory compliance measures', 20, 4)
) AS sections(name, description, weight, order_index)
CROSS JOIN finance_template;

-- Add update triggers
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_department_questionnaire_templates_updated_at
  BEFORE UPDATE ON department_questionnaire_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_department_questionnaire_sections_updated_at
  BEFORE UPDATE ON department_questionnaire_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_department_questions_updated_at
  BEFORE UPDATE ON department_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_department_question_responses_updated_at
  BEFORE UPDATE ON department_question_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();