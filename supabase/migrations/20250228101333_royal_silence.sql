-- Remove conditional logic from resiliency scoring tables

-- First, backup any existing responses
CREATE TABLE IF NOT EXISTS resiliency_responses_backup AS 
SELECT * FROM resiliency_responses;

-- Remove conditional logic from questions
UPDATE resiliency_questions 
SET conditional_logic = NULL;

-- Verify the update
DO $$
DECLARE
  questions_with_logic integer;
BEGIN
  SELECT COUNT(*) INTO questions_with_logic
  FROM resiliency_questions
  WHERE conditional_logic IS NOT NULL;

  IF questions_with_logic > 0 THEN
    RAISE EXCEPTION 'Found % questions still with conditional logic', questions_with_logic;
  END IF;
END $$;

-- Drop the conditional logic index since it's no longer needed
DROP INDEX IF EXISTS idx_resiliency_questions_conditional_logic;

-- Remove the conditional_logic column
ALTER TABLE resiliency_questions 
DROP COLUMN IF EXISTS conditional_logic;

-- Verify the column removal
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'resiliency_questions' 
    AND column_name = 'conditional_logic'
  ) THEN
    RAISE EXCEPTION 'conditional_logic column still exists';
  END IF;
END $$;