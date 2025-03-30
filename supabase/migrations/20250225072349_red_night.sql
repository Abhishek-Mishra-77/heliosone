-- Insert Gap Analysis Questions for each category

-- ISO 22301 Compliance Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'gap' AND name = 'ISO 22301 Compliance'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'Does your BCMS policy align with ISO 22301:2019 Section 5.2?',
  'Assess policy compliance with ISO 22301 requirements including scope, objectives, and commitment',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["No alignment", "Partial alignment", "Mostly aligned", "Fully aligned", "Exceeds requirements"]}',
  20,
  1,
  '{"name": "ISO 22301:2019", "clause": "5.2 Policy"}',
  true,
  'Provide BCMS policy documentation showing alignment with ISO 22301:2019 requirements'
),
(
  (SELECT id FROM cat),
  'Have you implemented all required documented information per ISO 22301:2019?',
  'Evaluate completeness of required documentation including procedures, plans, and records',
  'multi_choice',
  '{"options": ["None implemented", "Some implemented", "Most implemented", "All implemented", "Exceeds requirements"]}',
  15,
  2,
  '{"name": "ISO 22301:2019", "clause": "7.5 Documented Information"}',
  true,
  'Provide documentation inventory mapped to ISO 22301 requirements'
),
(
  (SELECT id FROM cat),
  'How comprehensive is your business impact analysis (BIA) process?',
  'Assess BIA methodology and implementation against ISO 22301 requirements',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Not implemented", "Basic", "Moderate", "Comprehensive", "Best practice"]}',
  20,
  3,
  '{"name": "ISO 22301:2019", "clause": "8.2.2 Business Impact Analysis"}',
  true,
  'Provide BIA methodology documentation and recent results'
);

-- NIST Framework Alignment Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'gap' AND name = 'NIST Framework Alignment'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'Have you implemented the NIST SP 800-34 planning process?',
  'Evaluate alignment with NIST contingency planning methodology',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Not implemented", "Initial", "Defined", "Managed", "Optimized"]}',
  20,
  1,
  '{"name": "NIST SP 800-34", "clause": "3.1 Contingency Planning Process"}',
  true,
  'Provide contingency planning documentation and process evidence'
),
(
  (SELECT id FROM cat),
  'How well do your recovery strategies align with NIST guidance?',
  'Assess recovery strategy development and implementation',
  'multi_choice',
  '{"options": ["No alignment", "Partial alignment", "Mostly aligned", "Fully aligned", "Exceeds guidance"]}',
  15,
  2,
  '{"name": "NIST SP 800-34", "clause": "3.4 Recovery Strategies"}',
  true,
  'Provide recovery strategy documentation and implementation evidence'
),
(
  (SELECT id FROM cat),
  'What is your level of compliance with NIST testing requirements?',
  'Evaluate test, training, and exercise program against NIST requirements',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Non-compliant", "Partially compliant", "Mostly compliant", "Fully compliant", "Exceeds requirements"]}',
  20,
  3,
  '{"name": "NIST SP 800-34", "clause": "3.5 Plan Testing, Training, and Exercises"}',
  true,
  'Provide test plans, results, and training records'
);

-- Industry Best Practices Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'gap' AND name = 'Industry Best Practices'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'How mature is your crisis management program?',
  'Assess crisis management capabilities against industry best practices',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Initial", "Developing", "Established", "Advanced", "Leading"]}',
  20,
  1,
  '{"name": "DRII Professional Practices", "clause": "Professional Practice 7 - Crisis Management"}',
  true,
  'Provide crisis management plan and exercise documentation'
),
(
  (SELECT id FROM cat),
  'Do you have a comprehensive supply chain resilience program?',
  'Evaluate supply chain continuity management practices',
  'multi_choice',
  '{"options": ["No program", "Basic program", "Moderate program", "Comprehensive program", "Industry-leading program"]}',
  15,
  2,
  '{"name": "ISO 28000", "clause": "Supply Chain Security Management"}',
  true,
  'Provide supply chain resilience program documentation'
),
(
  (SELECT id FROM cat),
  'How well do you manage third-party dependencies?',
  'Assess third-party risk management and continuity requirements',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["No management", "Basic", "Moderate", "Advanced", "Best-in-class"]}',
  20,
  3,
  '{"name": "FFIEC BCM", "clause": "Third-Party Service Providers"}',
  true,
  'Provide third-party management program documentation'
);

-- Regulatory Requirements Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'gap' AND name = 'Regulatory Requirements'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'Have you identified all applicable regulatory requirements?',
  'Assess completeness of regulatory requirement identification and mapping',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["Not started", "In progress", "Mostly complete", "Complete", "Continuously updated"]}',
  20,
  1,
  '{"name": "ISO 22301:2019", "clause": "4.2 Understanding Needs and Expectations"}',
  true,
  'Provide regulatory requirement register and compliance mapping'
),
(
  (SELECT id FROM cat),
  'How well do you maintain compliance documentation?',
  'Evaluate maintenance and currency of compliance evidence',
  'multi_choice',
  '{"options": ["No documentation", "Minimal documentation", "Partial documentation", "Complete documentation", "Enhanced documentation"]}',
  15,
  2,
  '{"name": "NIST SP 800-34", "clause": "2.1 Laws and Regulations"}',
  true,
  'Provide compliance documentation management system evidence'
),
(
  (SELECT id FROM cat),
  'Do you have a process for monitoring regulatory changes?',
  'Assess capabilities for tracking and implementing regulatory updates',
  'scale',
  '{"min": 1, "max": 5, "step": 1, "labels": ["No process", "Ad-hoc process", "Defined process", "Managed process", "Optimized process"]}',
  20,
  3,
  '{"name": "ISO 22301:2019", "clause": "4.1 Understanding the Organization"}',
  true,
  'Provide regulatory change management process documentation'
);