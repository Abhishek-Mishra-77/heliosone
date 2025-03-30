-- Create tables for resiliency scoring if they don't exist
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "allow_read_resiliency_categories" ON resiliency_categories;
  DROP POLICY IF EXISTS "allow_read_resiliency_questions" ON resiliency_questions;
  DROP POLICY IF EXISTS "allow_read_resiliency_responses" ON resiliency_responses;
  DROP POLICY IF EXISTS "allow_insert_resiliency_responses" ON resiliency_responses;

  -- Create new policies
  CREATE POLICY "allow_read_resiliency_categories_new"
    ON resiliency_categories
    FOR SELECT
    USING (true);

  CREATE POLICY "allow_read_resiliency_questions_new"
    ON resiliency_questions
    FOR SELECT
    USING (true);

  CREATE POLICY "allow_read_resiliency_responses_new"
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

  CREATE POLICY "allow_insert_resiliency_responses_new"
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

  -- Create or replace indexes
  DROP INDEX IF EXISTS idx_resiliency_questions_category;
  DROP INDEX IF EXISTS idx_resiliency_responses_assessment;
  DROP INDEX IF EXISTS idx_resiliency_questions_conditional_logic;

  CREATE INDEX idx_resiliency_questions_category_new ON resiliency_questions(category_id);
  CREATE INDEX idx_resiliency_responses_assessment_new ON resiliency_responses(assessment_id);
  CREATE INDEX idx_resiliency_questions_conditional_logic_new ON resiliency_questions USING gin(conditional_logic);

  -- Drop existing triggers
  DROP TRIGGER IF EXISTS update_resiliency_categories_updated_at ON resiliency_categories;
  DROP TRIGGER IF EXISTS update_resiliency_questions_updated_at ON resiliency_questions;
  DROP TRIGGER IF EXISTS update_resiliency_responses_updated_at ON resiliency_responses;

  -- Create new triggers
  CREATE TRIGGER update_resiliency_categories_updated_at_new
    BEFORE UPDATE ON resiliency_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

  CREATE TRIGGER update_resiliency_questions_updated_at_new
    BEFORE UPDATE ON resiliency_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

  CREATE TRIGGER update_resiliency_responses_updated_at_new
    BEFORE UPDATE ON resiliency_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_timestamp();

END $$;