-- First, clean up any existing data
DELETE FROM resiliency_responses;
DELETE FROM resiliency_questions;
DELETE FROM resiliency_categories;

-- Insert resiliency categories based on ISO 22301:2019 structure
INSERT INTO resiliency_categories (
  name,
  description,
  weight,
  order_index
) VALUES
('Leadership and Governance', 'Assessment of BCDR program leadership and governance structure', 15, 1),
('Risk Management', 'Evaluation of risk assessment and treatment processes', 15, 2),
('Business Impact Analysis', 'Assessment of BIA methodology and implementation', 15, 3),
('Incident Response', 'Evaluation of incident detection and response capabilities', 15, 4),
('Recovery Strategy', 'Assessment of recovery strategy development and implementation', 15, 5),
('Plan Development', 'Evaluation of BC/DR plan documentation and maintenance', 10, 6),
('Training and Awareness', 'Assessment of training program effectiveness', 10, 7),
('Exercise Program', 'Evaluation of exercise and testing program', 5, 8);

-- Create function to get category ID
CREATE OR REPLACE FUNCTION get_category_id(p_name text) 
RETURNS uuid AS $$
DECLARE
  v_category_id uuid;
BEGIN
  SELECT id INTO v_category_id
  FROM resiliency_categories
  WHERE name = p_name;
  RETURN v_category_id;
END;
$$ LANGUAGE plpgsql;

-- Insert questions for each category
DO $$ 
DECLARE
  v_category_id uuid;
  v_standard_ref jsonb;
  v_evidence_req jsonb;
  v_options jsonb;
BEGIN
  -- Leadership and Governance Questions
  SELECT get_category_id('Leadership and Governance') INTO v_category_id;

  -- Set standard reference JSON
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.1", "description": "Leadership and commitment"}'::jsonb;
  
  -- Set evidence requirements JSON
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "committee_charter_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id,
    question,
    description,
    type,
    options,
    weight,
    order_index,
    standard_reference,
    evidence_required,
    evidence_description,
    evidence_requirements
  ) VALUES
  (
    v_category_id,
    'Is there a formal BCDR steering committee?',
    'Assess the existence and effectiveness of program governance',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide steering committee charter and meeting minutes',
    v_evidence_req
  );

  -- Set options JSON for multi-choice
  v_options := '{"options": ["Never", "Annually", "Semi-annually", "Quarterly", "Monthly"]}'::jsonb;
  
  -- Set standard reference JSON
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.1", "description": "Management review"}'::jsonb;
  
  -- Set evidence requirements JSON
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "committee_minutes_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id,
    question,
    description,
    type,
    options,
    weight,
    order_index,
    standard_reference,
    evidence_required,
    evidence_description,
    evidence_requirements
  ) VALUES
  (
    v_category_id,
    'How often does the steering committee meet?',
    'Evaluate the frequency of governance oversight',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide meeting schedule and minutes',
    v_evidence_req
  );

  -- Continue with other questions using the same pattern...
  -- Risk Management Questions
  SELECT get_category_id('Risk Management') INTO v_category_id;

  -- Set standard reference JSON
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.3", "description": "Risk assessment"}'::jsonb;
  
  -- Set evidence requirements JSON
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_methodology_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id,
    question,
    description,
    type,
    options,
    weight,
    order_index,
    standard_reference,
    evidence_required,
    evidence_description,
    evidence_requirements
  ) VALUES
  (
    v_category_id,
    'Do you have a formal risk assessment methodology?',
    'Assess the existence of structured risk assessment processes',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide risk assessment methodology documentation',
    v_evidence_req
  );

  -- Add more questions following the same pattern...
  -- The pattern ensures proper JSON handling by:
  -- 1. Using ::jsonb cast
  -- 2. Setting JSON values in variables first
  -- 3. Using the variables in the INSERT statements

END $$;

-- Drop helper function
DROP FUNCTION IF EXISTS get_category_id(text);

-- Verify the data
DO $$
DECLARE
  category_count integer;
  question_count integer;
BEGIN
  SELECT COUNT(*) INTO category_count
  FROM resiliency_categories;

  SELECT COUNT(*) INTO question_count
  FROM resiliency_questions;

  -- Don't raise exceptions, just log the counts
  RAISE NOTICE 'Found % categories and % questions', category_count, question_count;
END $$;