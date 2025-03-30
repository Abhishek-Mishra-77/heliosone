-- Create base assessment tables

-- Assessment Categories
CREATE TABLE assessment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_type text NOT NULL CHECK (assessment_type IN ('resiliency', 'gap', 'maturity')),
  name text NOT NULL,
  description text,
  weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assessment Questions
CREATE TABLE assessment_questions (
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
  evidence_requirements jsonb,
  conditional_logic jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assessment Responses
CREATE TABLE assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES bcdr_assessments NOT NULL,
  question_id uuid REFERENCES assessment_questions NOT NULL,
  response jsonb NOT NULL,
  score numeric CHECK (score >= 0 AND score <= 100),
  evidence_links text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (assessment_id, question_id)
);

-- Enable RLS
ALTER TABLE assessment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "allow_read_categories"
  ON assessment_categories
  FOR SELECT
  USING (true);

CREATE POLICY "allow_read_questions"
  ON assessment_questions
  FOR SELECT
  USING (true);

CREATE POLICY "allow_read_responses"
  ON assessment_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bcdr_assessments a
      JOIN users u ON u.organization_id = a.organization_id
      WHERE u.id = auth.uid()
      AND a.id = assessment_responses.assessment_id
    )
  );

CREATE POLICY "allow_insert_responses"
  ON assessment_responses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bcdr_assessments a
      JOIN users u ON u.organization_id = a.organization_id
      WHERE u.id = auth.uid()
      AND a.id = assessment_responses.assessment_id
      AND u.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX idx_assessment_questions_category ON assessment_questions(category_id);
CREATE INDEX idx_assessment_responses_assessment ON assessment_responses(assessment_id);
CREATE INDEX idx_assessment_questions_conditional_logic ON assessment_questions USING gin(conditional_logic);

-- Add update triggers
CREATE TRIGGER update_assessment_categories_updated_at
  BEFORE UPDATE ON assessment_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_assessment_questions_updated_at
  BEFORE UPDATE ON assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_assessment_responses_updated_at
  BEFORE UPDATE ON assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();