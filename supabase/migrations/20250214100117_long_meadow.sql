-- Only create tables if they don't exist
DO $$ 
BEGIN
  -- Department Questionnaire Templates
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'department_questionnaire_templates') THEN
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

    ALTER TABLE department_questionnaire_templates ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Department Questionnaire Sections
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'department_questionnaire_sections') THEN
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

    ALTER TABLE department_questionnaire_sections ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Department Questions
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'department_questions') THEN
    CREATE TABLE department_questions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      section_id uuid REFERENCES department_questionnaire_sections NOT NULL,
      question text NOT NULL,
      description text,
      type text NOT NULL CHECK (type IN ('boolean', 'scale', 'text', 'date', 'multi_choice')),
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

    ALTER TABLE department_questions ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Department Question Responses
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'department_question_responses') THEN
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

    ALTER TABLE department_question_responses ENABLE ROW LEVEL SECURITY;
  END IF;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "allow_view_templates" ON department_questionnaire_templates;
  DROP POLICY IF EXISTS "allow_view_sections" ON department_questionnaire_sections;
  DROP POLICY IF EXISTS "allow_view_questions" ON department_questions;
  DROP POLICY IF EXISTS "allow_view_responses" ON department_question_responses;
  DROP POLICY IF EXISTS "allow_create_responses" ON department_question_responses;

  -- Create new policies
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

  CREATE POLICY "allow_view_responses"
    ON department_question_responses
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM department_assessments da
        JOIN departments d ON d.id = da.department_id
        JOIN department_users du ON du.department_id = d.id
        WHERE du.user_id = auth.uid()
        AND da.id = department_question_responses.department_assessment_id
      )
    );

  CREATE POLICY "allow_create_responses"
    ON department_question_responses
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM department_assessments da
        JOIN departments d ON d.id = da.department_id
        JOIN department_users du ON du.department_id = d.id
        WHERE du.user_id = auth.uid()
        AND du.role IN ('department_head', 'assessor')
        AND da.id = department_question_responses.department_assessment_id
      )
    );

  -- Create indexes if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'department_questions_section_id_idx') THEN
    CREATE INDEX department_questions_section_id_idx ON department_questions(section_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'department_question_responses_assessment_id_idx') THEN
    CREATE INDEX department_question_responses_assessment_id_idx ON department_question_responses(assessment_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'department_questionnaire_sections_template_id_idx') THEN
    CREATE INDEX department_questionnaire_sections_template_id_idx ON department_questionnaire_sections(template_id);
  END IF;

  -- Add update triggers
  DROP TRIGGER IF EXISTS update_department_questionnaire_templates_updated_at ON department_questionnaire_templates;
  DROP TRIGGER IF EXISTS update_department_questionnaire_sections_updated_at ON department_questionnaire_sections;
  DROP TRIGGER IF EXISTS update_department_questions_updated_at ON department_questions;
  DROP TRIGGER IF EXISTS update_department_question_responses_updated_at ON department_question_responses;

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

  -- Insert initial templates if they don't exist
  IF NOT EXISTS (SELECT 1 FROM department_questionnaire_templates WHERE name = 'IT Department Assessment') THEN
    INSERT INTO department_questionnaire_templates (name, description, department_type)
    VALUES 
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
  END IF;
END $$;