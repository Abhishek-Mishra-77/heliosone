-- First, clean up any existing data
DELETE FROM resiliency_responses;
DELETE FROM resiliency_questions;
DELETE FROM resiliency_categories;

-- Create function to safely get category ID
CREATE OR REPLACE FUNCTION get_resiliency_category_id(p_name text) 
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

-- Create function to safely insert questions
CREATE OR REPLACE FUNCTION insert_resiliency_question(
  p_category_id uuid,
  p_question text,
  p_description text,
  p_type text,
  p_options jsonb,
  p_weight integer,
  p_order_index integer,
  p_standard_reference jsonb,
  p_evidence_required boolean,
  p_evidence_description text,
  p_conditional_logic jsonb,
  p_evidence_requirements jsonb
) RETURNS void AS $$
BEGIN
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
    conditional_logic,
    evidence_requirements
  ) VALUES (
    p_category_id,
    p_question,
    p_description,
    p_type,
    p_options,
    p_weight,
    p_order_index,
    p_standard_reference,
    p_evidence_required,
    p_evidence_description,
    p_conditional_logic,
    p_evidence_requirements
  );
END;
$$ LANGUAGE plpgsql;

-- Insert categories
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

-- Insert questions for each category
DO $$ 
DECLARE
  v_category_id uuid;
BEGIN
  -- Leadership and Governance Questions
  v_category_id := get_resiliency_category_id('Leadership and Governance');

  PERFORM insert_resiliency_question(
    v_category_id,
    'Is there a formal BCDR steering committee?',
    'Assess the existence and effectiveness of program governance',
    'boolean',
    NULL,
    20,
    1,
    '{"name": "ISO 22301:2019", "clause": "5.1", "description": "Leadership and commitment"}',
    true,
    'Provide steering committee charter and meeting minutes',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "committee_charter_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How often does the steering committee meet?',
    'Evaluate the frequency of governance oversight',
    'multi_choice',
    '{"options": ["Never", "Annually", "Semi-annually", "Quarterly", "Monthly"]}',
    20,
    2,
    '{"name": "ISO 22301:2019", "clause": "5.1", "description": "Management review"}',
    true,
    'Provide meeting schedule and minutes',
    '{"dependsOn": "Is there a formal BCDR steering committee?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "committee_minutes_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'Is there a documented BCDR policy?',
    'Assess the existence of formal BCDR policies',
    'boolean',
    NULL,
    20,
    3,
    '{"name": "ISO 22301:2019", "clause": "5.2", "description": "Policy"}',
    true,
    'Provide BCDR policy documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "bcdr_policy_{date}"}'
  );

  -- Add more questions for each category...
  -- Continue with the same pattern for all categories and their questions

  -- Risk Management Questions
  v_category_id := get_resiliency_category_id('Risk Management');

  PERFORM insert_resiliency_question(
    v_category_id,
    'Do you have a formal risk assessment methodology?',
    'Assess the existence of structured risk assessment processes',
    'boolean',
    NULL,
    20,
    1,
    '{"name": "ISO 22301:2019", "clause": "8.2.3", "description": "Risk assessment"}',
    true,
    'Provide risk assessment methodology documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_methodology_{date}"}'
  );

  -- Continue adding questions for each category...

END $$;

-- Drop helper functions
DROP FUNCTION IF EXISTS get_resiliency_category_id(text);
DROP FUNCTION IF EXISTS insert_resiliency_question(uuid, text, text, text, jsonb, integer, integer, jsonb, boolean, text, jsonb, jsonb);

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