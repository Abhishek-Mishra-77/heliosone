-- Create tables for resiliency scoring

-- Resiliency Categories table
CREATE TABLE resiliency_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resiliency Questions table
CREATE TABLE resiliency_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES resiliency_categories NOT NULL,
  question text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('boolean', 'scale', 'text', 'date', 'multi_choice')),
  options jsonb,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  standard_reference jsonb,
  evidence_required boolean NOT NULL DEFAULT false,
  evidence_description text,
  evidence_requirements jsonb,
  conditional_logic jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resiliency Responses table
CREATE TABLE resiliency_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES bcdr_assessments NOT NULL,
  question_id uuid REFERENCES resiliency_questions NOT NULL,
  response jsonb NOT NULL,
  score numeric CHECK (score >= 0 AND score <= 100),
  evidence_links text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (assessment_id, question_id)
);

-- Enable RLS
ALTER TABLE resiliency_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resiliency_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resiliency_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "allow_read_resiliency_categories"
  ON resiliency_categories
  FOR SELECT
  USING (true);

CREATE POLICY "allow_read_resiliency_questions"
  ON resiliency_questions
  FOR SELECT
  USING (true);

CREATE POLICY "allow_read_resiliency_responses"
  ON resiliency_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bcdr_assessments a
      JOIN users u ON u.organization_id = a.organization_id
      WHERE u.id = auth.uid()
      AND a.id = resiliency_responses.assessment_id
    )
  );

CREATE POLICY "allow_insert_resiliency_responses"
  ON resiliency_responses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bcdr_assessments a
      JOIN users u ON u.organization_id = a.organization_id
      WHERE u.id = auth.uid()
      AND a.id = resiliency_responses.assessment_id
      AND u.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_resiliency_questions_category ON resiliency_questions(category_id);
CREATE INDEX idx_resiliency_responses_assessment ON resiliency_responses(assessment_id);
CREATE INDEX idx_resiliency_questions_conditional_logic ON resiliency_questions USING gin(conditional_logic);

-- Add update triggers
CREATE TRIGGER update_resiliency_categories_updated_at
  BEFORE UPDATE ON resiliency_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_resiliency_questions_updated_at
  BEFORE UPDATE ON resiliency_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_resiliency_responses_updated_at
  BEFORE UPDATE ON resiliency_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();