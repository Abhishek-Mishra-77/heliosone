-- First, ensure we have migrated any needed data
DO $$ 
BEGIN
  -- Check if we have the new resiliency tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'resiliency_categories'
  ) THEN
    RAISE EXCEPTION 'New resiliency tables not found. Please ensure new schema is created first.';
  END IF;

  -- Check if we have data in the new tables
  IF NOT EXISTS (
    SELECT 1 FROM resiliency_categories
  ) THEN
    RAISE EXCEPTION 'New resiliency tables appear to be empty. Please ensure data migration is complete first.';
  END IF;
END $$;

-- Now we can safely remove the old tables
DROP TABLE IF EXISTS assessment_responses CASCADE;
DROP TABLE IF EXISTS assessment_questions CASCADE;
DROP TABLE IF EXISTS assessment_categories CASCADE;

-- Verify old tables are gone and new tables exist
DO $$
DECLARE
  old_tables_exist boolean;
  new_tables_exist boolean;
BEGIN
  -- Check if any old tables still exist
  SELECT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename IN ('assessment_responses', 'assessment_questions', 'assessment_categories')
  ) INTO old_tables_exist;

  -- Check if new tables exist
  SELECT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename IN ('resiliency_categories', 'resiliency_questions', 'resiliency_responses')
  ) INTO new_tables_exist;

  -- Verify the migration was successful
  IF old_tables_exist THEN
    RAISE EXCEPTION 'Old assessment tables still exist';
  END IF;

  IF NOT new_tables_exist THEN
    RAISE EXCEPTION 'New resiliency tables not found';
  END IF;
END $$;