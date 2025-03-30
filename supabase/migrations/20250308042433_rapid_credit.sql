/*
  # Add Recovery and Documentation Questions

  1. New Questions
    - Add comprehensive questions for Recovery Capabilities category
    - Add comprehensive questions for Documentation and Procedures category
    - Questions aligned with ISO 22301, NIST, and BCI Good Practice Guidelines
    - Questions designed to assess maturity levels 1-5

  2. Security
    - No changes to RLS policies (using existing)
*/

-- Add Recovery Capabilities questions
WITH recovery_category AS (
  SELECT id FROM maturity_assessment_categories WHERE name = 'Recovery Capabilities'
)
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
VALUES
  (
    (SELECT id FROM recovery_category),
    'Are recovery time objectives (RTOs) defined?',
    'Basic definition of recovery time requirements',
    'boolean',
    NULL,
    10,
    1,
    true,
    'Provide documented RTOs for critical processes',
    '{"name": "ISO 22301", "clause": "8.2.3", "description": "Establish time-based recovery requirements"}'::jsonb,
    1
  ),
  (
    (SELECT id FROM recovery_category),
    'How are recovery priorities determined?',
    'Process for determining recovery sequence',
    'multi_choice',
    '{"options": ["Ad-hoc decisions", "Based on BIA", "Documented criteria", "Risk-based framework", "Automated prioritization"]}'::jsonb,
    15,
    2,
    true,
    'Provide recovery prioritization methodology',
    '{"name": "NIST SP 800-34", "clause": "3.4", "description": "System recovery priorities"}'::jsonb,
    2
  ),
  (
    (SELECT id FROM recovery_category),
    'Are alternate recovery sites established?',
    'Availability of backup facilities or sites',
    'multi_choice',
    '{"options": ["None", "Cold site", "Warm site", "Hot site", "Active-Active"]}'::jsonb,
    20,
    3,
    true,
    'Provide alternate site documentation and capabilities',
    '{"name": "ISO 22301", "clause": "8.3.3", "description": "Protection and mitigation measures"}'::jsonb,
    3
  ),
  (
    (SELECT id FROM recovery_category),
    'How often are recovery capabilities tested?',
    'Frequency and scope of recovery testing',
    'multi_choice',
    '{"options": ["Never", "Annually", "Semi-annually", "Quarterly", "Monthly or more"]}'::jsonb,
    15,
    3,
    true,
    'Provide recovery test schedule and results',
    '{"name": "BCI GPG", "clause": "6.4", "description": "Validation of recovery capabilities"}'::jsonb,
    4
  ),
  (
    (SELECT id FROM recovery_category),
    'What is the scope of recovery automation?',
    'Level of automated recovery procedures',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Manual", "Basic scripts", "Partial automation", "Mostly automated", "Fully automated"]}'::jsonb,
    20,
    4,
    true,
    'Provide recovery automation documentation',
    '{"name": "NIST SP 800-34", "clause": "4.1", "description": "Recovery operations"}'::jsonb,
    5
  );

-- Add Documentation and Procedures questions
WITH docs_category AS (
  SELECT id FROM maturity_assessment_categories WHERE name = 'Documentation and Procedures'
)
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
VALUES
  (
    (SELECT id FROM docs_category),
    'Are BCDR procedures documented?',
    'Basic documentation of recovery procedures',
    'boolean',
    NULL,
    10,
    1,
    true,
    'Provide BCDR procedure documentation',
    '{"name": "ISO 22301", "clause": "8.4.1", "description": "Documented procedures"}'::jsonb,
    1
  ),
  (
    (SELECT id FROM docs_category),
    'How detailed are your recovery procedures?',
    'Level of detail in recovery documentation',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Basic", "General steps", "Detailed", "Comprehensive", "Exhaustive"]}'::jsonb,
    15,
    2,
    true,
    'Provide sample recovery procedures',
    '{"name": "NIST SP 800-34", "clause": "4.1", "description": "Recovery procedures"}'::jsonb,
    2
  ),
  (
    (SELECT id FROM docs_category),
    'How are documents controlled and versioned?',
    'Document control and version management',
    'multi_choice',
    '{"options": ["No control", "Basic versioning", "Change control", "Workflow approval", "Automated system"]}'::jsonb,
    15,
    3,
    true,
    'Provide document control procedures',
    '{"name": "ISO 22301", "clause": "7.5", "description": "Documented information"}'::jsonb,
    3
  ),
  (
    (SELECT id FROM docs_category),
    'What is your document review frequency?',
    'Regular review and updates of documentation',
    'multi_choice',
    '{"options": ["Ad-hoc", "Annually", "Semi-annually", "Quarterly", "Monthly"]}'::jsonb,
    15,
    3,
    true,
    'Provide document review schedule and records',
    '{"name": "BCI GPG", "clause": "4.5", "description": "Document maintenance"}'::jsonb,
    4
  ),
  (
    (SELECT id FROM docs_category),
    'How accessible are BCDR documents?',
    'Availability and accessibility of documentation',
    'multi_choice',
    '{"options": ["Paper only", "Shared drive", "Intranet", "Mobile access", "24/7 secure portal"]}'::jsonb,
    15,
    4,
    true,
    'Demonstrate document access methods',
    '{"name": "ISO 22301", "clause": "7.5.3", "description": "Control of documented information"}'::jsonb,
    5
  ),
  (
    (SELECT id FROM docs_category),
    'Are procedures regularly tested?',
    'Validation of documented procedures',
    'multi_choice',
    '{"options": ["Never", "During incidents", "Annual review", "Regular exercises", "Continuous validation"]}'::jsonb,
    15,
    4,
    true,
    'Provide procedure testing records',
    '{"name": "NIST SP 800-34", "clause": "4.2", "description": "Plan testing, training, and exercises"}'::jsonb,
    6
  );