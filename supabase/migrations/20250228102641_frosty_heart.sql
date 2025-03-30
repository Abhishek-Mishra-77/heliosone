-- First, check if tables already exist and drop them if needed
DO $$ 
BEGIN
  -- Drop tables in correct order if they exist
  DROP TABLE IF EXISTS maturity_assessment_responses CASCADE;
  DROP TABLE IF EXISTS maturity_assessment_questions CASCADE;
  DROP TABLE IF EXISTS maturity_assessment_categories CASCADE;
END $$;

-- Create tables for maturity assessment

-- Maturity Assessment Categories
CREATE TABLE maturity_assessment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE maturity_assessment_categories ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "allow_read_maturity_categories"
  ON maturity_assessment_categories
  FOR SELECT
  USING (true);

-- Maturity Assessment Questions
CREATE TABLE maturity_assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES maturity_assessment_categories NOT NULL,
  question text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('boolean', 'scale', 'text', 'date', 'multi_choice')),
  options jsonb,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  maturity_level integer CHECK (maturity_level BETWEEN 1 AND 5),
  standard_reference jsonb,
  evidence_required boolean NOT NULL DEFAULT false,
  evidence_description text,
  evidence_requirements jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE maturity_assessment_questions ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "allow_read_maturity_questions"
  ON maturity_assessment_questions
  FOR SELECT
  USING (true);

-- Create index for questions
CREATE INDEX idx_maturity_questions_category ON maturity_assessment_questions(category_id);

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

-- Enable RLS
ALTER TABLE maturity_assessment_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "allow_read_maturity_responses"
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

CREATE POLICY "allow_insert_maturity_responses"
  ON maturity_assessment_responses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bcdr_assessments a
      JOIN users u ON u.organization_id = a.organization_id
      WHERE u.id = auth.uid()
      AND a.id = maturity_assessment_responses.assessment_id
      AND u.role = 'admin'
    )
  );

-- Create index for responses
CREATE INDEX idx_maturity_responses_assessment ON maturity_assessment_responses(assessment_id);

-- Add update triggers
CREATE TRIGGER update_maturity_categories_updated_at
  BEFORE UPDATE ON maturity_assessment_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_maturity_questions_updated_at
  BEFORE UPDATE ON maturity_assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_maturity_responses_updated_at
  BEFORE UPDATE ON maturity_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();