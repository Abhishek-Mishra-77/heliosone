DO $$ 
BEGIN
  -- Only create tables if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'maturity_assessment_templates') THEN
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

    -- Enable RLS
    ALTER TABLE maturity_assessment_templates ENABLE ROW LEVEL SECURITY;

    -- Create policy
    CREATE POLICY "allow_view_templates"
      ON maturity_assessment_templates
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'maturity_assessment_sections') THEN
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

    -- Enable RLS
    ALTER TABLE maturity_assessment_sections ENABLE ROW LEVEL SECURITY;

    -- Create policy
    CREATE POLICY "allow_view_sections"
      ON maturity_assessment_sections
      FOR SELECT
      USING (true);

    -- Create index
    CREATE INDEX maturity_assessment_sections_template_id_idx ON maturity_assessment_sections(template_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'maturity_assessment_questions') THEN
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

    -- Enable RLS
    ALTER TABLE maturity_assessment_questions ENABLE ROW LEVEL SECURITY;

    -- Create policy
    CREATE POLICY "allow_view_questions"
      ON maturity_assessment_questions
      FOR SELECT
      USING (true);

    -- Create index
    CREATE INDEX maturity_assessment_questions_section_id_idx ON maturity_assessment_questions(section_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'maturity_assessment_responses') THEN
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

    -- Create policy
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

    -- Create index
    CREATE INDEX maturity_assessment_responses_assessment_id_idx ON maturity_assessment_responses(assessment_id);
  END IF;

  -- Add update triggers if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_maturity_assessment_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_maturity_assessment_templates_updated_at
      BEFORE UPDATE ON maturity_assessment_templates
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_timestamp();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_maturity_assessment_sections_updated_at'
  ) THEN
    CREATE TRIGGER update_maturity_assessment_sections_updated_at
      BEFORE UPDATE ON maturity_assessment_sections
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_timestamp();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_maturity_assessment_questions_updated_at'
  ) THEN
    CREATE TRIGGER update_maturity_assessment_questions_updated_at
      BEFORE UPDATE ON maturity_assessment_questions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_timestamp();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_maturity_assessment_responses_updated_at'
  ) THEN
    CREATE TRIGGER update_maturity_assessment_responses_updated_at
      BEFORE UPDATE ON maturity_assessment_responses
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_timestamp();
  END IF;

  -- Insert initial template if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM maturity_assessment_templates 
    WHERE name = 'BCDR Maturity Assessment'
  ) THEN
    INSERT INTO maturity_assessment_templates (name, description, industry_type)
    VALUES (
      'BCDR Maturity Assessment',
      'Comprehensive assessment of BCDR program maturity based on industry standards',
      'All'
    );
  END IF;

END $$;