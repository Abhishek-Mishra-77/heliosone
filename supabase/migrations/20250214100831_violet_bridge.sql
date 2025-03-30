/*
  # Add Department Questions with Updated Type Constraint

  1. Schema Changes
    - Add maturity_level column
    - Add options jsonb column
    - Add evidence_description column
    - Update type check constraint to allow multi_choice

  2. Data Changes
    - Insert questions for IT Department template sections
    - Include options for multi_choice and scale questions
*/

-- First modify the type check constraint and add required columns
ALTER TABLE department_questions 
DROP CONSTRAINT IF EXISTS department_questions_type_check;

ALTER TABLE department_questions 
ADD COLUMN IF NOT EXISTS maturity_level integer CHECK (maturity_level BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS options jsonb,
ADD COLUMN IF NOT EXISTS evidence_description text;

ALTER TABLE department_questions
ADD CONSTRAINT department_questions_type_check 
CHECK (type IN ('boolean', 'scale', 'text', 'date', 'multi_choice'));

DO $$
DECLARE
  it_template_id uuid;
  tech_recovery_section_id uuid;
  data_protection_section_id uuid;
  system_resilience_section_id uuid;
  cyber_security_section_id uuid;
BEGIN
  -- Get IT template ID
  SELECT id INTO it_template_id
  FROM department_questionnaire_templates
  WHERE name = 'IT Department Assessment'
  LIMIT 1;

  IF it_template_id IS NULL THEN
    RAISE EXCEPTION 'IT Department Assessment template not found';
  END IF;

  -- Get section IDs
  SELECT id INTO tech_recovery_section_id
  FROM department_questionnaire_sections
  WHERE template_id = it_template_id AND name = 'Technical Recovery'
  LIMIT 1;

  SELECT id INTO data_protection_section_id
  FROM department_questionnaire_sections
  WHERE template_id = it_template_id AND name = 'Data Protection'
  LIMIT 1;

  SELECT id INTO system_resilience_section_id
  FROM department_questionnaire_sections
  WHERE template_id = it_template_id AND name = 'System Resilience'
  LIMIT 1;

  SELECT id INTO cyber_security_section_id
  FROM department_questionnaire_sections
  WHERE template_id = it_template_id AND name = 'Cyber Security'
  LIMIT 1;

  -- Verify all sections were found
  IF tech_recovery_section_id IS NULL OR 
     data_protection_section_id IS NULL OR 
     system_resilience_section_id IS NULL OR 
     cyber_security_section_id IS NULL THEN
    RAISE EXCEPTION 'One or more sections not found';
  END IF;

  -- Insert Technical Recovery questions
  INSERT INTO department_questions (
    section_id, question, description, type, options, weight, order_index, 
    maturity_level, evidence_required, evidence_description
  )
  VALUES
    (
      tech_recovery_section_id,
      'Do you have documented recovery procedures?',
      'Assess the availability and completeness of recovery documentation',
      'boolean',
      NULL,
      20,
      1,
      3,
      true,
      'Please provide recovery procedure documentation'
    ),
    (
      tech_recovery_section_id,
      'What is your current Recovery Time Objective (RTO)?',
      'Specify the target time for system recovery',
      'scale',
      '{"min": 0, "max": 24, "step": 1, "unit": "hours"}'::jsonb,
      30,
      2,
      3,
      false,
      NULL
    ),
    (
      tech_recovery_section_id,
      'How frequently are recovery tests conducted?',
      'Indicate the frequency of recovery testing',
      'multi_choice',
      '{"options": ["Monthly", "Quarterly", "Bi-annually", "Annually", "Never"]}'::jsonb,
      25,
      3,
      4,
      true,
      'Provide test results from the last recovery test'
    );

  -- Insert Data Protection questions
  INSERT INTO department_questions (
    section_id, question, description, type, options, weight, order_index,
    maturity_level, evidence_required, evidence_description
  )
  VALUES
    (
      data_protection_section_id,
      'What is your current backup frequency?',
      'Specify how often backups are performed',
      'multi_choice',
      '{"options": ["Hourly", "Daily", "Weekly", "Monthly"]}'::jsonb,
      30,
      1,
      3,
      false,
      NULL
    ),
    (
      data_protection_section_id,
      'Are backups stored in multiple locations?',
      'Assess geographical distribution of backup storage',
      'boolean',
      NULL,
      25,
      2,
      4,
      true,
      'Provide backup location documentation'
    ),
    (
      data_protection_section_id,
      'When was the last successful backup restore test?',
      'Date of most recent backup restoration test',
      'date',
      NULL,
      20,
      3,
      3,
      true,
      'Provide backup restoration test results'
    );

  -- Insert System Resilience questions
  INSERT INTO department_questions (
    section_id, question, description, type, options, weight, order_index,
    maturity_level, evidence_required, evidence_description
  )
  VALUES
    (
      system_resilience_section_id,
      'Do you have redundant infrastructure components?',
      'Assess redundancy of critical system components',
      'multi_choice',
      '{"options": ["All critical systems", "Most systems", "Some systems", "No redundancy"]}'::jsonb,
      35,
      1,
      4,
      true,
      'Provide system architecture diagram'
    ),
    (
      system_resilience_section_id,
      'What is your current system availability percentage?',
      'Specify system uptime percentage',
      'scale',
      '{"min": 90, "max": 100, "step": 0.1, "unit": "%"}'::jsonb,
      30,
      2,
      3,
      true,
      'Provide availability monitoring reports'
    ),
    (
      system_resilience_section_id,
      'Do you have automated failover capabilities?',
      'Assess automatic failover implementation',
      'boolean',
      NULL,
      25,
      3,
      4,
      true,
      'Provide failover test documentation'
    );

  -- Insert Cyber Security questions
  INSERT INTO department_questions (
    section_id, question, description, type, options, weight, order_index,
    maturity_level, evidence_required, evidence_description
  )
  VALUES
    (
      cyber_security_section_id,
      'Do you have an incident response plan?',
      'Assess cybersecurity incident response readiness',
      'boolean',
      NULL,
      30,
      1,
      3,
      true,
      'Provide incident response plan documentation'
    ),
    (
      cyber_security_section_id,
      'How often are security assessments conducted?',
      'Frequency of security vulnerability assessments',
      'multi_choice',
      '{"options": ["Monthly", "Quarterly", "Bi-annually", "Annually", "Never"]}'::jsonb,
      25,
      2,
      4,
      true,
      'Provide latest security assessment report'
    ),
    (
      cyber_security_section_id,
      'What is your current security maturity level?',
      'Self-assessment of security program maturity',
      'scale',
      '{"min": 1, "max": 5, "step": 1, "unit": "level"}'::jsonb,
      20,
      3,
      3,
      false,
      NULL
    );
END $$;