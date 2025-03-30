-- First, ensure we have the correct schema
DO $$ 
BEGIN
  -- Drop existing tables if they exist
  DROP TABLE IF EXISTS maturity_assessment_responses CASCADE;
  DROP TABLE IF EXISTS maturity_assessment_questions CASCADE;
  DROP TABLE IF EXISTS maturity_assessment_categories CASCADE;

  -- Create Maturity Assessment Categories table
  CREATE TABLE maturity_assessment_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
    order_index integer NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Create Maturity Assessment Questions table
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

  -- Create Maturity Assessment Responses table
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
  ALTER TABLE maturity_assessment_categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE maturity_assessment_questions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE maturity_assessment_responses ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  CREATE POLICY "allow_read_maturity_categories"
    ON maturity_assessment_categories
    FOR SELECT
    USING (true);

  CREATE POLICY "allow_read_maturity_questions"
    ON maturity_assessment_questions
    FOR SELECT
    USING (true);

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

  -- Create indexes
  CREATE INDEX idx_maturity_questions_category ON maturity_assessment_questions(category_id);
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

END $$;

-- Insert initial categories
INSERT INTO maturity_assessment_categories (name, description, weight, order_index)
VALUES 
('Program Management', 'Assessment of BCDR program management and governance', 20, 1),
('Risk Assessment', 'Evaluation of risk assessment and treatment processes', 20, 2),
('Business Impact Analysis', 'Assessment of BIA methodology and implementation', 20, 3),
('Strategy Development', 'Evaluation of recovery and continuity strategies', 20, 4),
('Plan Development', 'Assessment of plan documentation and maintenance', 20, 5);

-- Insert sample questions for Program Management
WITH cat AS (
  SELECT id FROM maturity_assessment_categories WHERE name = 'Program Management'
)
INSERT INTO maturity_assessment_questions (
  category_id,
  question,
  description,
  type,
  options,
  weight,
  order_index,
  maturity_level,
  standard_reference,
  evidence_required,
  evidence_description,
  evidence_requirements
)
SELECT 
  cat.id,
  'Is there a formal BCDR program in place?',
  'Assess the existence and structure of the BCDR program',
  'boolean',
  NULL,
  20,
  1,
  3,
  '{"name": "ISO 22301:2019", "clause": "5.1", "description": "Leadership and commitment"}'::jsonb,
  true,
  'Provide program charter and governance documentation',
  '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "program_charter_{date}"}'::jsonb
FROM cat;

-- Verify the structure
DO $$
DECLARE
  category_count integer;
  question_count integer;
BEGIN
  SELECT COUNT(*) INTO category_count
  FROM maturity_assessment_categories;

  SELECT COUNT(*) INTO question_count
  FROM maturity_assessment_questions;

  IF category_count != 5 THEN
    RAISE EXCEPTION 'Expected 5 categories, found %', category_count;
  END IF;

  IF question_count < 1 THEN
    RAISE EXCEPTION 'Expected at least 1 question, found %', question_count;
  END IF;
END $$;