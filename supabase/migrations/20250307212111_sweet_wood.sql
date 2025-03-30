/*
  # Add Maturity Assessment Categories and Questions

  1. New Categories
    - Governance
    - Risk Management
    - Business Impact Analysis
    - Recovery Strategy
    - Training and Awareness

  2. Questions
    - Organized by maturity levels (1-5)
    - Include evidence requirements
    - Mapped to standards

  3. Security
    - Enables RLS
    - Adds appropriate policies
*/

-- First create the categories
INSERT INTO maturity_assessment_categories (
  name,
  description,
  weight,
  order_index
) VALUES
(
  'Governance',
  'BCDR program governance and oversight',
  25,
  1
),
(
  'Risk Management',
  'Risk assessment and management processes',
  20,
  2
),
(
  'Business Impact Analysis',
  'Business impact analysis methodology and execution',
  20,
  3
),
(
  'Recovery Strategy',
  'Recovery planning and strategy development',
  20,
  4
),
(
  'Training and Awareness',
  'BCDR training and awareness program',
  15,
  5
);

-- Now add questions for each category
DO $$ 
DECLARE
  governance_id uuid;
  risk_id uuid;
  bia_id uuid;
  recovery_id uuid;
  training_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO governance_id FROM maturity_assessment_categories WHERE name = 'Governance';
  SELECT id INTO risk_id FROM maturity_assessment_categories WHERE name = 'Risk Management';
  SELECT id INTO bia_id FROM maturity_assessment_categories WHERE name = 'Business Impact Analysis';
  SELECT id INTO recovery_id FROM maturity_assessment_categories WHERE name = 'Recovery Strategy';
  SELECT id INTO training_id FROM maturity_assessment_categories WHERE name = 'Training and Awareness';

  -- Governance Questions
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
  ) VALUES
  -- Level 1
  (
    governance_id,
    'Is there a documented BCDR policy?',
    'Basic policy document outlining BCDR requirements and responsibilities',
    'boolean',
    null,
    10,
    1,
    true,
    'Provide the current BCDR policy document',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '5.2',
      'description', 'Top management shall establish a business continuity policy'
    ),
    1
  ),
  -- Level 2
  (
    governance_id,
    'How frequently is the BCDR policy reviewed?',
    'Regular review and updates of BCDR policy',
    'multi_choice',
    jsonb_build_object(
      'options', array['Annually', 'Semi-annually', 'Quarterly', 'Monthly']
    ),
    15,
    2,
    true,
    'Provide policy review records and meeting minutes',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '9.3',
      'description', 'Management review intervals and inputs'
    ),
    2
  ),
  -- Level 3
  (
    governance_id,
    'How mature is your BCDR steering committee?',
    'Effectiveness of BCDR governance structure',
    'scale',
    jsonb_build_object(
      'min', 1,
      'max', 5,
      'step', 1,
      'labels', array['Basic', 'Developing', 'Established', 'Advanced', 'Leading']
    ),
    20,
    3,
    true,
    'Provide committee charter, meeting minutes, and decision records',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '5.1',
      'description', 'Leadership and commitment'
    ),
    3
  ),
  -- Level 4
  (
    governance_id,
    'How do you measure BCDR program effectiveness?',
    'Quantitative measurement of program performance',
    'multi_choice',
    jsonb_build_object(
      'options', array[
        'Basic metrics tracked',
        'Regular performance reporting',
        'KPI dashboard with trends',
        'Predictive analytics and forecasting'
      ]
    ),
    25,
    4,
    true,
    'Provide performance reports, metrics dashboard, and trend analysis',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '9.1',
      'description', 'Monitoring, measurement, analysis and evaluation'
    ),
    4
  ),
  -- Level 5
  (
    governance_id,
    'How advanced is your continuous improvement program?',
    'Maturity of improvement processes',
    'scale',
    jsonb_build_object(
      'min', 1,
      'max', 5,
      'step', 1,
      'labels', array['Basic', 'Developing', 'Established', 'Advanced', 'Leading']
    ),
    30,
    5,
    true,
    'Provide improvement framework documentation and results',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '10.2',
      'description', 'Continual improvement'
    ),
    5
  );

  -- Risk Management Questions
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
  ) VALUES
  -- Level 1
  (
    risk_id,
    'Do you have a risk assessment process?',
    'Basic risk identification and assessment process',
    'boolean',
    null,
    10,
    1,
    true,
    'Provide risk assessment methodology document',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '6.1',
      'description', 'Actions to address risks and opportunities'
    ),
    1
  ),
  -- Level 2
  (
    risk_id,
    'How often are risk assessments conducted?',
    'Frequency of risk assessment activities',
    'multi_choice',
    jsonb_build_object(
      'options', array['Annually', 'Semi-annually', 'Quarterly', 'Monthly']
    ),
    15,
    2,
    true,
    'Provide risk assessment schedule and completed assessments',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '8.2.3',
      'description', 'Business impact analysis and risk assessment'
    ),
    2
  ),
  -- Level 3
  (
    risk_id,
    'How comprehensive is your risk monitoring?',
    'Effectiveness of risk monitoring processes',
    'scale',
    jsonb_build_object(
      'min', 1,
      'max', 5,
      'step', 1,
      'labels', array['Basic', 'Developing', 'Established', 'Advanced', 'Leading']
    ),
    20,
    3,
    true,
    'Provide risk monitoring procedures and reports',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '6.1.2',
      'description', 'Business continuity risk assessment'
    ),
    3
  );

  -- Business Impact Analysis Questions
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
  ) VALUES
  -- Level 1
  (
    bia_id,
    'Have you identified critical business processes?',
    'Basic identification of critical processes',
    'boolean',
    null,
    10,
    1,
    true,
    'Provide list of critical business processes',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '8.2.2',
      'description', 'Business impact analysis'
    ),
    1
  ),
  -- Level 2
  (
    bia_id,
    'How detailed is your impact analysis?',
    'Depth of impact analysis for critical processes',
    'multi_choice',
    jsonb_build_object(
      'options', array[
        'Basic impact identified',
        'Detailed impact analysis',
        'Comprehensive analysis with dependencies',
        'Advanced analysis with scenarios'
      ]
    ),
    15,
    2,
    true,
    'Provide BIA documentation and analysis results',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '8.2.2',
      'description', 'Business impact analysis methodology'
    ),
    2
  );

  -- Recovery Strategy Questions
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
  ) VALUES
  -- Level 1
  (
    recovery_id,
    'Are recovery strategies documented?',
    'Basic documentation of recovery approaches',
    'boolean',
    null,
    10,
    1,
    true,
    'Provide recovery strategy documentation',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '8.3',
      'description', 'Business continuity strategies and solutions'
    ),
    1
  ),
  -- Level 2
  (
    recovery_id,
    'How often are recovery strategies tested?',
    'Frequency of recovery strategy validation',
    'multi_choice',
    jsonb_build_object(
      'options', array['Annually', 'Semi-annually', 'Quarterly', 'Monthly']
    ),
    15,
    2,
    true,
    'Provide test schedule and results',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '8.5',
      'description', 'Exercising and testing'
    ),
    2
  );

  -- Training and Awareness Questions
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
  ) VALUES
  -- Level 1
  (
    training_id,
    'Is BCDR training provided to employees?',
    'Basic BCDR awareness training',
    'boolean',
    null,
    10,
    1,
    true,
    'Provide training materials and records',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '7.2',
      'description', 'Competence'
    ),
    1
  ),
  -- Level 2
  (
    training_id,
    'How comprehensive is your training program?',
    'Depth and breadth of BCDR training',
    'multi_choice',
    jsonb_build_object(
      'options', array[
        'Basic awareness training',
        'Role-specific training',
        'Advanced technical training',
        'Comprehensive program with certification'
      ]
    ),
    15,
    2,
    true,
    'Provide training program documentation',
    jsonb_build_object(
      'name', 'ISO 22301',
      'clause', '7.2',
      'description', 'Training and awareness program'
    ),
    2
  );

END $$;

-- Enable RLS
ALTER TABLE maturity_assessment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE maturity_assessment_questions ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow read maturity categories"
  ON maturity_assessment_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow read maturity questions"
  ON maturity_assessment_questions
  FOR SELECT
  TO public
  USING (true);