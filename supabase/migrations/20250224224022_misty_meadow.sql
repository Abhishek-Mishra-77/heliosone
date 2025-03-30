-- Create new assessment question categories
CREATE TABLE IF NOT EXISTS assessment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_type text NOT NULL CHECK (assessment_type IN ('resiliency', 'gap', 'maturity')),
  name text NOT NULL,
  description text,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create new assessment questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES assessment_categories NOT NULL,
  question text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('boolean', 'scale', 'text', 'date', 'multi_choice')),
  options jsonb,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  standard_reference jsonb,
  evidence_required boolean NOT NULL DEFAULT false,
  evidence_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assessment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "allow_read_categories"
  ON assessment_categories
  FOR SELECT
  USING (true);

CREATE POLICY "allow_read_questions"
  ON assessment_questions
  FOR SELECT
  USING (true);

-- Insert Resiliency Scoring Categories
INSERT INTO assessment_categories (assessment_type, name, description, weight, order_index) VALUES
('resiliency', 'Incident Response Readiness', 'Assessment of incident detection and response capabilities', 20, 1),
('resiliency', 'Recovery Capabilities', 'Evaluation of recovery procedures and automation', 20, 2),
('resiliency', 'Communication Readiness', 'Assessment of crisis communication capabilities', 15, 3),
('resiliency', 'Technical Resilience', 'Evaluation of technical infrastructure resilience', 25, 4),
('resiliency', 'Data Protection', 'Assessment of data backup and protection measures', 20, 5);

-- Insert Gap Analysis Categories
INSERT INTO assessment_categories (assessment_type, name, description, weight, order_index) VALUES
('gap', 'ISO 22301 Compliance', 'Gap analysis against ISO 22301:2019 requirements', 25, 1),
('gap', 'NIST Framework Alignment', 'Gap analysis against NIST SP 800-34 framework', 25, 2),
('gap', 'Industry Best Practices', 'Evaluation against industry best practices', 25, 3),
('gap', 'Regulatory Requirements', 'Assessment of regulatory compliance gaps', 25, 4);

-- Insert Maturity Assessment Categories
INSERT INTO assessment_categories (assessment_type, name, description, weight, order_index) VALUES
('maturity', 'Program Governance', 'Maturity of BCDR program governance', 20, 1),
('maturity', 'Risk Management', 'Maturity of risk assessment and management', 20, 2),
('maturity', 'Business Impact Analysis', 'Maturity of BIA processes', 20, 3),
('maturity', 'Training and Awareness', 'Maturity of training and awareness programs', 20, 4),
('maturity', 'Continuous Improvement', 'Maturity of improvement processes', 20, 5);

-- Insert Resiliency Scoring Questions
WITH cat AS (SELECT id FROM assessment_categories WHERE assessment_type = 'resiliency' AND name = 'Incident Response Readiness')
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index, standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'What is your mean time to detect (MTTD) for critical incidents?',
  'Assessment of incident detection capabilities',
  'multi_choice',
  '{"options": ["< 15 minutes", "15-30 minutes", "30-60 minutes", "> 60 minutes"]}',
  20,
  1,
  '{"standard": "NIST SP 800-34", "clause": "3.2.1 Detection and Analysis"}',
  true,
  'Provide incident detection metrics and monitoring dashboard screenshots'
),
(
  (SELECT id FROM cat),
  'Do you have automated incident detection systems?',
  'Evaluation of automated detection capabilities',
  'boolean',
  NULL,
  15,
  2,
  '{"standard": "ISO 22301", "clause": "8.4.3 Detection and Monitoring"}',
  true,
  'Provide documentation of automated detection systems'
);

-- Insert Gap Analysis Questions
WITH cat AS (SELECT id FROM assessment_categories WHERE assessment_type = 'gap' AND name = 'ISO 22301 Compliance')
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index, standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'Does your BCMS policy align with ISO 22301:2019 Section 5.2?',
  'Assessment of policy compliance with ISO 22301',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["No alignment", "Partial alignment", "Mostly aligned", "Fully aligned", "Exceeds requirements"]}',
  20,
  1,
  '{"standard": "ISO 22301:2019", "clause": "5.2 Policy"}',
  true,
  'Provide BCMS policy documentation showing alignment with ISO 22301:2019 requirements'
),
(
  (SELECT id FROM cat),
  'Have you implemented all required documented information per ISO 22301:2019?',
  'Assessment of documentation requirements',
  'multi_choice',
  '{"options": ["None implemented", "Some implemented", "Most implemented", "All implemented", "Exceeds requirements"]}',
  15,
  2,
  '{"standard": "ISO 22301:2019", "clause": "7.5 Documented Information"}',
  true,
  'Provide documentation inventory mapped to ISO 22301 requirements'
);

-- Insert Maturity Assessment Questions
WITH cat AS (SELECT id FROM assessment_categories WHERE assessment_type = 'maturity' AND name = 'Program Governance')
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index, standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'What is the maturity level of your BCDR steering committee?',
  'Assessment of governance structure maturity',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Initial", "Managed", "Defined", "Measured", "Optimizing"]}',
  20,
  1,
  '{"standard": "CMMI", "level": "Governance"}',
  true,
  'Provide steering committee charter, meeting minutes, and governance documentation'
),
(
  (SELECT id FROM cat),
  'How mature is your BCDR policy review and update process?',
  'Assessment of policy management maturity',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Repeatable", "Defined", "Managed", "Optimizing"]}',
  15,
  2,
  '{"standard": "CMMI", "level": "Policy Management"}',
  true,
  'Provide policy review schedule, change history, and approval process documentation'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_categories_type ON assessment_categories(assessment_type);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_category ON assessment_questions(category_id);

-- Grant necessary permissions
GRANT SELECT ON assessment_categories TO authenticated;
GRANT SELECT ON assessment_questions TO authenticated;