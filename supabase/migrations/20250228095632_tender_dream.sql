-- First, ensure we have the correct schema
DO $$ 
BEGIN
  -- Drop existing tables if they exist
  DROP TABLE IF EXISTS gap_analysis_responses CASCADE;
  DROP TABLE IF EXISTS gap_analysis_questions CASCADE;
  DROP TABLE IF EXISTS gap_analysis_categories CASCADE;

  -- Create Gap Analysis Categories table
  CREATE TABLE gap_analysis_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
    order_index integer NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  -- Create Gap Analysis Questions table
  CREATE TABLE gap_analysis_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid REFERENCES gap_analysis_categories NOT NULL,
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

  -- Create Gap Analysis Responses table
  CREATE TABLE gap_analysis_responses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id uuid REFERENCES bcdr_assessments NOT NULL,
    question_id uuid REFERENCES gap_analysis_questions NOT NULL,
    response jsonb NOT NULL,
    score numeric CHECK (score >= 0 AND score <= 100),
    evidence_links text[],
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (assessment_id, question_id)
  );

  -- Enable RLS
  ALTER TABLE gap_analysis_categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE gap_analysis_questions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE gap_analysis_responses ENABLE ROW LEVEL SECURITY;

  -- Create RLS policies
  CREATE POLICY "allow_read_gap_categories"
    ON gap_analysis_categories
    FOR SELECT
    USING (true);

  CREATE POLICY "allow_read_gap_questions"
    ON gap_analysis_questions
    FOR SELECT
    USING (true);

  CREATE POLICY "allow_read_gap_responses"
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

  CREATE POLICY "allow_insert_gap_responses"
    ON gap_analysis_responses
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM bcdr_assessments a
        JOIN users u ON u.organization_id = a.organization_id
        WHERE u.id = auth.uid()
        AND a.id = gap_analysis_responses.assessment_id
        AND u.role = 'admin'
      )
    );

  -- Create indexes
  CREATE INDEX idx_gap_questions_category ON gap_analysis_questions(category_id);
  CREATE INDEX idx_gap_responses_assessment ON gap_analysis_responses(assessment_id);
  CREATE INDEX idx_gap_questions_conditional_logic ON gap_analysis_questions USING gin(conditional_logic);

  -- Add update triggers
  CREATE TRIGGER update_gap_categories_updated_at
    BEFORE UPDATE ON gap_analysis_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

  CREATE TRIGGER update_gap_questions_updated_at
    BEFORE UPDATE ON gap_analysis_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

  CREATE TRIGGER update_gap_responses_updated_at
    BEFORE UPDATE ON gap_analysis_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

EXCEPTION WHEN others THEN
  -- Log error details
  RAISE NOTICE 'Error creating gap analysis tables: %', SQLERRM;
  -- Re-raise the error
  RAISE;
END $$;