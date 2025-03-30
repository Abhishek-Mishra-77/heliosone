-- First, ensure we have the correct schema for maturity assessment questions
DO $$ 
BEGIN
  -- Add maturity_level column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assessment_questions' 
    AND column_name = 'maturity_level'
  ) THEN
    ALTER TABLE assessment_questions 
    ADD COLUMN maturity_level integer;
  END IF;
END $$;

-- Migrate maturity assessment questions
INSERT INTO maturity_assessment_questions (
  section_id,
  question,
  description,
  type,
  options,
  weight,
  order_index,
  evidence_required,
  evidence_description,
  conditional_logic
)
SELECT 
  ms.id as section_id,
  aq.question,
  aq.description,
  aq.type,
  aq.options,
  aq.weight,
  aq.order_index,
  aq.evidence_required,
  aq.evidence_description,
  aq.conditional_logic
FROM assessment_questions aq
JOIN assessment_categories ac ON ac.id = aq.category_id
JOIN maturity_assessment_sections ms ON ms.name = ac.name
WHERE ac.assessment_type = 'maturity';

-- Migrate gap analysis questions
INSERT INTO gap_analysis_questions (
  section_id,
  question,
  description,
  type,
  priority,
  weight,
  order_index,
  target_state,
  evidence_required,
  evidence_description,
  remediation_guidance,
  conditional_logic
)
SELECT 
  gs.id as section_id,
  aq.question,
  aq.description,
  aq.type,
  'medium' as priority, -- Default priority
  aq.weight,
  aq.order_index,
  'Compliant with framework requirements' as target_state, -- Default target state
  aq.evidence_required,
  aq.evidence_description,
  'Follow framework guidance for remediation' as remediation_guidance, -- Default guidance
  aq.conditional_logic
FROM assessment_questions aq
JOIN assessment_categories ac ON ac.id = aq.category_id
JOIN gap_analysis_sections gs ON gs.name = ac.name
WHERE ac.assessment_type = 'gap';

-- Now we can safely remove the generic tables
DROP TABLE IF EXISTS assessment_responses CASCADE;
DROP TABLE IF EXISTS assessment_questions CASCADE;
DROP TABLE IF EXISTS assessment_categories CASCADE;

-- Add any missing indexes
CREATE INDEX IF NOT EXISTS idx_maturity_questions_section ON maturity_assessment_questions(section_id);
CREATE INDEX IF NOT EXISTS idx_gap_questions_section ON gap_analysis_questions(section_id);
CREATE INDEX IF NOT EXISTS idx_maturity_responses_assessment ON maturity_assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_gap_responses_assessment ON gap_analysis_responses(assessment_id);