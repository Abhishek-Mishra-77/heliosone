-- Insert Maturity Assessment Questions for each category

-- Program Governance Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'maturity' AND name = 'Program Governance'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'How mature is your BCDR program governance structure?',
  'Assess the maturity of program oversight, steering committee, and governance framework',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Initial", "Managed", "Defined", "Quantitatively Managed", "Optimizing"]}',
  20,
  1,
  '{"name": "ISO 22301:2019", "clause": "5.1 Leadership and Commitment"}',
  true,
  'Provide governance structure documentation, steering committee charter, and meeting minutes'
),
(
  (SELECT id FROM cat),
  'How comprehensive is your BCDR policy framework?',
  'Evaluate the completeness and effectiveness of BCDR policies and standards',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Basic", "Comprehensive", "Integrated", "Optimized"]}',
  15,
  2,
  '{"name": "ISO 22301:2019", "clause": "5.2 Policy"}',
  true,
  'Provide BCDR policy documentation and review history'
),
(
  (SELECT id FROM cat),
  'How effective is your resource allocation process?',
  'Assess the maturity of resource management and allocation for BCDR',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Reactive", "Planned", "Managed", "Measured", "Optimized"]}',
  15,
  3,
  '{"name": "ISO 22301:2019", "clause": "7.1 Resources"}',
  true,
  'Provide resource allocation documentation and budget planning'
);

-- Risk Management Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'maturity' AND name = 'Risk Management'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'How mature is your risk assessment methodology?',
  'Evaluate the sophistication of risk identification and assessment processes',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Repeatable", "Defined", "Managed", "Optimized"]}',
  20,
  1,
  '{"name": "ISO 22301:2019", "clause": "8.2.3 Risk Assessment"}',
  true,
  'Provide risk assessment methodology documentation and recent assessments'
),
(
  (SELECT id FROM cat),
  'How effective is your risk monitoring program?',
  'Assess the maturity of continuous risk monitoring and review processes',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Initial", "Developing", "Established", "Advanced", "Leading"]}',
  15,
  2,
  '{"name": "ISO 22301:2019", "clause": "9.1 Monitoring, Measurement, Analysis and Evaluation"}',
  true,
  'Provide risk monitoring procedures and reports'
),
(
  (SELECT id FROM cat),
  'How well are risk treatments implemented and tracked?',
  'Evaluate the effectiveness of risk treatment implementation and monitoring',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Basic", "Managed", "Measured", "Optimized"]}',
  15,
  3,
  '{"name": "ISO 22301:2019", "clause": "8.3.3 Risk Treatment"}',
  true,
  'Provide risk treatment plans and progress tracking'
);

-- Business Impact Analysis Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'maturity' AND name = 'Business Impact Analysis'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'How mature is your BIA methodology?',
  'Assess the sophistication and effectiveness of BIA processes',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Initial", "Developing", "Established", "Advanced", "Leading"]}',
  20,
  1,
  '{"name": "ISO 22301:2019", "clause": "8.2.2 Business Impact Analysis"}',
  true,
  'Provide BIA methodology documentation and recent analyses'
),
(
  (SELECT id FROM cat),
  'How comprehensive is your impact criteria framework?',
  'Evaluate the maturity of impact assessment criteria and thresholds',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Basic", "Developing", "Defined", "Comprehensive", "Optimized"]}',
  15,
  2,
  '{"name": "ISO 22301:2019", "clause": "8.2.2.2 Impact Criteria"}',
  true,
  'Provide impact assessment criteria documentation'
),
(
  (SELECT id FROM cat),
  'How well are dependencies mapped and analyzed?',
  'Assess the maturity of dependency mapping and analysis processes',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Basic", "Managed", "Advanced", "Optimized"]}',
  15,
  3,
  '{"name": "ISO 22301:2019", "clause": "8.2.2.3 Dependencies"}',
  true,
  'Provide dependency mapping documentation and analysis'
);

-- Training and Awareness Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'maturity' AND name = 'Training and Awareness'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'How mature is your BCDR training program?',
  'Assess the comprehensiveness and effectiveness of training initiatives',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Initial", "Developing", "Established", "Advanced", "Leading"]}',
  20,
  1,
  '{"name": "ISO 22301:2019", "clause": "7.2 Competence"}',
  true,
  'Provide training program documentation and completion records'
),
(
  (SELECT id FROM cat),
  'How effective is your awareness program?',
  'Evaluate the maturity of BCDR awareness initiatives',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Basic", "Developing", "Established", "Advanced", "Leading"]}',
  15,
  2,
  '{"name": "ISO 22301:2019", "clause": "7.3 Awareness"}',
  true,
  'Provide awareness program materials and metrics'
),
(
  (SELECT id FROM cat),
  'How well do you measure training effectiveness?',
  'Assess the maturity of training evaluation and improvement processes',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Basic", "Managed", "Measured", "Optimized"]}',
  15,
  3,
  '{"name": "ISO 22301:2019", "clause": "7.2.3 Evaluation of Training"}',
  true,
  'Provide training effectiveness metrics and improvement plans'
);

-- Continuous Improvement Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'maturity' AND name = 'Continuous Improvement'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'How mature is your improvement process?',
  'Assess the maturity of continuous improvement initiatives',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Initial", "Repeatable", "Defined", "Managed", "Optimizing"]}',
  20,
  1,
  '{"name": "ISO 22301:2019", "clause": "10.2 Continual Improvement"}',
  true,
  'Provide improvement process documentation and results'
),
(
  (SELECT id FROM cat),
  'How effective is your corrective action process?',
  'Evaluate the maturity of corrective action management',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Basic", "Managed", "Measured", "Optimized"]}',
  15,
  2,
  '{"name": "ISO 22301:2019", "clause": "10.1 Nonconformity and Corrective Action"}',
  true,
  'Provide corrective action tracking and resolution evidence'
),
(
  (SELECT id FROM cat),
  'How well do you incorporate lessons learned?',
  'Assess the maturity of lessons learned integration',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Basic", "Managed", "Integrated", "Optimized"]}',
  15,
  3,
  '{"name": "ISO 22301:2019", "clause": "10.2.2 Continual Improvement"}',
  true,
  'Provide lessons learned documentation and implementation evidence'
);