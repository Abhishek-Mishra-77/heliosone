-- Create tables for resiliency scoring if they don't exist
DO $$ 
BEGIN
  -- Create Resiliency Categories table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'resiliency_categories') THEN
    CREATE TABLE resiliency_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text,
      weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 100),
      order_index integer NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE resiliency_categories ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Create Resiliency Questions table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'resiliency_questions') THEN
    CREATE TABLE resiliency_questions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      category_id uuid REFERENCES resiliency_categories NOT NULL,
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
      conditional_logic jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE resiliency_questions ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Create Resiliency Responses table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'resiliency_responses') THEN
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
    ALTER TABLE resiliency_responses ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Categories policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'resiliency_categories' 
    AND policyname = 'allow_read_resiliency_categories'
  ) THEN
    CREATE POLICY "allow_read_resiliency_categories"
      ON resiliency_categories
      FOR SELECT
      USING (true);
  END IF;

  -- Questions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'resiliency_questions' 
    AND policyname = 'allow_read_resiliency_questions'
  ) THEN
    CREATE POLICY "allow_read_resiliency_questions"
      ON resiliency_questions
      FOR SELECT
      USING (true);
  END IF;

  -- Responses policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'resiliency_responses' 
    AND policyname = 'allow_read_resiliency_responses'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'resiliency_responses' 
    AND policyname = 'allow_insert_resiliency_responses'
  ) THEN
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
  END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'resiliency_questions' 
    AND indexname = 'idx_resiliency_questions_category'
  ) THEN
    CREATE INDEX idx_resiliency_questions_category ON resiliency_questions(category_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'resiliency_responses' 
    AND indexname = 'idx_resiliency_responses_assessment'
  ) THEN
    CREATE INDEX idx_resiliency_responses_assessment ON resiliency_responses(assessment_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'resiliency_questions' 
    AND indexname = 'idx_resiliency_questions_conditional_logic'
  ) THEN
    CREATE INDEX idx_resiliency_questions_conditional_logic ON resiliency_questions USING gin(conditional_logic);
  END IF;
END $$;

-- Add update triggers if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_resiliency_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_resiliency_categories_updated_at
      BEFORE UPDATE ON resiliency_categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_timestamp();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_resiliency_questions_updated_at'
  ) THEN
    CREATE TRIGGER update_resiliency_questions_updated_at
      BEFORE UPDATE ON resiliency_questions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_timestamp();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_resiliency_responses_updated_at'
  ) THEN
    CREATE TRIGGER update_resiliency_responses_updated_at
      BEFORE UPDATE ON resiliency_responses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_timestamp();
  END IF;
END $$;