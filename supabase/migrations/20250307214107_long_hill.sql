/*
  # Add Maturity Assessment Questions

  1. New Categories
    - Governance
    - Risk Management 
    - Business Impact Analysis
    - Recovery Strategy
    - Training and Awareness

  2. Questions
    - Added questions for each category
    - Questions organized by maturity level (1-5)
    - Evidence requirements and standard references included

  3. Security
    - Enabled RLS
    - Added read-only policy if not exists
*/

-- First create the categories if they don't exist
INSERT INTO maturity_assessment_categories (name, description, weight, order_index)
SELECT name, description, weight, order_index
FROM (VALUES
  ('Governance', 'BCDR program governance and oversight', 20, 1),
  ('Risk Management', 'Risk assessment and management processes', 20, 2),
  ('Business Impact Analysis', 'Business impact analysis methodology and execution', 20, 3),
  ('Recovery Strategy', 'Recovery and continuity strategy development', 20, 4),
  ('Training and Awareness', 'Training program and awareness initiatives', 20, 5)
) AS data(name, description, weight, order_index)
WHERE NOT EXISTS (
  SELECT 1 FROM maturity_assessment_categories 
  WHERE name = data.name
);

-- Add questions for Governance category
INSERT INTO maturity_assessment_questions (
  category_id,
  question,
  description,
  type,
  options,
  weight,
  maturity_level,
  evidence_required,
  evidence_description,
  standard_reference,
  order_index
)
SELECT 
  id as category_id,
  'Is there a documented BCDR policy?' as question,
  'Basic policy document outlining BCDR requirements and responsibilities' as description,
  'boolean' as type,
  null as options,
  10 as weight,
  1 as maturity_level,
  true as evidence_required,
  'Provide the current BCDR policy document' as evidence_description,
  jsonb_build_object(
    'name', 'ISO 22301',
    'clause', '5.2',
    'description', 'Top management shall establish a business continuity policy'
  ) as standard_reference,
  1 as order_index
FROM maturity_assessment_categories
WHERE name = 'Governance'
AND NOT EXISTS (
  SELECT 1 FROM maturity_assessment_questions 
  WHERE question = 'Is there a documented BCDR policy?'
);

-- Add more governance questions
INSERT INTO maturity_assessment_questions (
  category_id,
  question,
  description,
  type,
  options,
  weight,
  maturity_level,
  evidence_required,
  evidence_description,
  standard_reference,
  order_index
)
SELECT 
  id as category_id,
  'How frequently is the BCDR policy reviewed?' as question,
  'Regular review and updates of BCDR policy' as description,
  'multi_choice' as type,
  jsonb_build_object(
    'options', array['Annually', 'Semi-annually', 'Quarterly', 'Monthly']
  ) as options,
  15 as weight,
  2 as maturity_level,
  true as evidence_required,
  'Provide policy review records and meeting minutes' as evidence_description,
  jsonb_build_object(
    'name', 'ISO 22301',
    'clause', '9.3',
    'description', 'Management review intervals and inputs'
  ) as standard_reference,
  2 as order_index
FROM maturity_assessment_categories
WHERE name = 'Governance'
AND NOT EXISTS (
  SELECT 1 FROM maturity_assessment_questions 
  WHERE question = 'How frequently is the BCDR policy reviewed?'
);

-- Add Risk Management questions
INSERT INTO maturity_assessment_questions (
  category_id,
  question,
  description,
  type,
  options,
  weight,
  maturity_level,
  evidence_required,
  evidence_description,
  standard_reference,
  order_index
)
SELECT 
  id as category_id,
  'Do you have a formal risk assessment process?' as question,
  'Basic risk identification and assessment process' as description,
  'boolean' as type,
  null as options,
  10 as weight,
  1 as maturity_level,
  true as evidence_required,
  'Provide risk assessment methodology document' as evidence_description,
  jsonb_build_object(
    'name', 'ISO 22301',
    'clause', '6.1',
    'description', 'Actions to address risks and opportunities'
  ) as standard_reference,
  1 as order_index
FROM maturity_assessment_categories
WHERE name = 'Risk Management'
AND NOT EXISTS (
  SELECT 1 FROM maturity_assessment_questions 
  WHERE question = 'Do you have a formal risk assessment process?'
);

-- Add more risk management questions
INSERT INTO maturity_assessment_questions (
  category_id,
  question,
  description,
  type,
  options,
  weight,
  maturity_level,
  evidence_required,
  evidence_description,
  standard_reference,
  order_index
)
SELECT 
  id as category_id,
  'How comprehensive is your risk monitoring?' as question,
  'Effectiveness of risk monitoring processes' as description,
  'scale' as type,
  jsonb_build_object(
    'min', 1,
    'max', 5,
    'step', 1,
    'labels', array['Basic', 'Developing', 'Established', 'Advanced', 'Leading']
  ) as options,
  20 as weight,
  3 as maturity_level,
  true as evidence_required,
  'Provide risk monitoring procedures and reports' as evidence_description,
  jsonb_build_object(
    'name', 'ISO 22301',
    'clause', '6.1.2',
    'description', 'Business continuity risk assessment'
  ) as standard_reference,
  2 as order_index
FROM maturity_assessment_categories
WHERE name = 'Risk Management'
AND NOT EXISTS (
  SELECT 1 FROM maturity_assessment_questions 
  WHERE question = 'How comprehensive is your risk monitoring?'
);

-- Add Business Impact Analysis questions
INSERT INTO maturity_assessment_questions (
  category_id,
  question,
  description,
  type,
  options,
  weight,
  maturity_level,
  evidence_required,
  evidence_description,
  standard_reference,
  order_index
)
SELECT 
  id as category_id,
  'Have you identified critical business processes?' as question,
  'Basic identification of critical processes' as description,
  'boolean' as type,
  null as options,
  10 as weight,
  1 as maturity_level,
  true as evidence_required,
  'Provide list of critical business processes' as evidence_description,
  jsonb_build_object(
    'name', 'ISO 22301',
    'clause', '8.2.2',
    'description', 'Business impact analysis'
  ) as standard_reference,
  1 as order_index
FROM maturity_assessment_categories
WHERE name = 'Business Impact Analysis'
AND NOT EXISTS (
  SELECT 1 FROM maturity_assessment_questions 
  WHERE question = 'Have you identified critical business processes?'
);

-- Add Recovery Strategy questions
INSERT INTO maturity_assessment_questions (
  category_id,
  question,
  description,
  type,
  options,
  weight,
  maturity_level,
  evidence_required,
  evidence_description,
  standard_reference,
  order_index
)
SELECT 
  id as category_id,
  'Are recovery strategies documented?' as question,
  'Basic documentation of recovery approaches' as description,
  'boolean' as type,
  null as options,
  10 as weight,
  1 as maturity_level,
  true as evidence_required,
  'Provide recovery strategy documentation' as evidence_description,
  jsonb_build_object(
    'name', 'ISO 22301',
    'clause', '8.3',
    'description', 'Business continuity strategies and solutions'
  ) as standard_reference,
  1 as order_index
FROM maturity_assessment_categories
WHERE name = 'Recovery Strategy'
AND NOT EXISTS (
  SELECT 1 FROM maturity_assessment_questions 
  WHERE question = 'Are recovery strategies documented?'
);

-- Add Training and Awareness questions
INSERT INTO maturity_assessment_questions (
  category_id,
  question,
  description,
  type,
  options,
  weight,
  maturity_level,
  evidence_required,
  evidence_description,
  standard_reference,
  order_index
)
SELECT 
  id as category_id,
  'Is BCDR training provided to employees?' as question,
  'Basic BCDR awareness training' as description,
  'boolean' as type,
  null as options,
  10 as weight,
  1 as maturity_level,
  true as evidence_required,
  'Provide training materials and records' as evidence_description,
  jsonb_build_object(
    'name', 'ISO 22301',
    'clause', '7.2',
    'description', 'Competence'
  ) as standard_reference,
  1 as order_index
FROM maturity_assessment_categories
WHERE name = 'Training and Awareness'
AND NOT EXISTS (
  SELECT 1 FROM maturity_assessment_questions 
  WHERE question = 'Is BCDR training provided to employees?'
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'maturity_assessment_questions' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE maturity_assessment_questions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Add policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'maturity_assessment_questions' 
    AND policyname = 'Allow read maturity questions'
  ) THEN
    CREATE POLICY "Allow read maturity questions"
      ON maturity_assessment_questions
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;