-- Add more comprehensive department questionnaire templates

-- Operations Department Template
WITH ops_template AS (
  INSERT INTO department_questionnaire_templates (name, description, department_type)
  VALUES (
    'Operations Department Assessment',
    'Comprehensive assessment for operational resilience and business process management',
    'department'
  )
  RETURNING id
)
INSERT INTO department_questionnaire_sections (template_id, name, description, weight, order_index)
SELECT 
  ops_template.id,
  name,
  description,
  weight,
  order_index
FROM (
  VALUES 
    ('Business Process Management', 'Assessment of process documentation and controls', 25, 1),
    ('Supply Chain Resilience', 'Evaluation of supply chain continuity measures', 25, 2),
    ('Quality Control', 'Analysis of quality management systems', 25, 3),
    ('Resource Management', 'Assessment of resource allocation and optimization', 25, 4)
) AS sections(name, description, weight, order_index)
CROSS JOIN ops_template;

-- Legal & Compliance Template
WITH legal_template AS (
  INSERT INTO department_questionnaire_templates (name, description, department_type)
  VALUES (
    'Legal & Compliance Assessment',
    'Comprehensive assessment of regulatory compliance and legal risk management',
    'department'
  )
  RETURNING id
)
INSERT INTO department_questionnaire_sections (template_id, name, description, weight, order_index)
SELECT 
  legal_template.id,
  name,
  description,
  weight,
  order_index
FROM (
  VALUES 
    ('Regulatory Compliance', 'Assessment of compliance with applicable regulations', 30, 1),
    ('Contract Management', 'Evaluation of contract lifecycle management', 25, 2),
    ('Legal Risk Assessment', 'Analysis of legal risks and mitigation measures', 25, 3),
    ('Data Privacy & Protection', 'Assessment of data protection compliance', 20, 4)
) AS sections(name, description, weight, order_index)
CROSS JOIN legal_template;

-- Human Resources Template
WITH hr_template AS (
  INSERT INTO department_questionnaire_templates (name, description, department_type)
  VALUES (
    'Human Resources Assessment',
    'Comprehensive assessment of HR resilience and personnel management',
    'department'
  )
  RETURNING id
)
INSERT INTO department_questionnaire_sections (template_id, name, description, weight, order_index)
SELECT 
  hr_template.id,
  name,
  description,
  weight,
  order_index
FROM (
  VALUES 
    ('Personnel Safety & Wellbeing', 'Assessment of employee safety measures', 30, 1),
    ('Crisis Communication', 'Evaluation of emergency communication procedures', 25, 2),
    ('Remote Work Capabilities', 'Analysis of remote work infrastructure', 25, 3),
    ('Critical Staff Succession', 'Assessment of succession planning', 20, 4)
) AS sections(name, description, weight, order_index)
CROSS JOIN hr_template;

-- Facilities Management Template
WITH facilities_template AS (
  INSERT INTO department_questionnaire_templates (name, description, department_type)
  VALUES (
    'Facilities Management Assessment',
    'Comprehensive assessment of facility operations and physical security',
    'department'
  )
  RETURNING id
)
INSERT INTO department_questionnaire_sections (template_id, name, description, weight, order_index)
SELECT 
  facilities_template.id,
  name,
  description,
  weight,
  order_index
FROM (
  VALUES 
    ('Physical Security', 'Assessment of physical security controls', 30, 1),
    ('Environmental Controls', 'Evaluation of environmental monitoring systems', 25, 2),
    ('Utilities Management', 'Analysis of utility redundancy and backup systems', 25, 3),
    ('Access Control', 'Assessment of facility access management', 20, 4)
) AS sections(name, description, weight, order_index)
CROSS JOIN facilities_template;

-- Customer Service Template
WITH cs_template AS (
  INSERT INTO department_questionnaire_templates (name, description, department_type)
  VALUES (
    'Customer Service Assessment',
    'Comprehensive assessment of service continuity and customer support',
    'department'
  )
  RETURNING id
)
INSERT INTO department_questionnaire_sections (template_id, name, description, weight, order_index)
SELECT 
  cs_template.id,
  name,
  description,
  weight,
  order_index
FROM (
  VALUES 
    ('Service Continuity', 'Assessment of service delivery resilience', 30, 1),
    ('Communication Channels', 'Evaluation of customer communication systems', 25, 2),
    ('Alternative Service Delivery', 'Analysis of backup service channels', 25, 3),
    ('SLA Management', 'Assessment of service level agreement compliance', 20, 4)
) AS sections(name, description, weight, order_index)
CROSS JOIN cs_template;

-- Add questions for each section
INSERT INTO department_questions (
  section_id,
  question,
  description,
  type,
  options,
  weight,
  order_index,
  maturity_level,
  evidence_required,
  evidence_description
)
SELECT
  s.id as section_id,
  q.question,
  q.description,
  q.type,
  q.options,
  q.weight,
  q.order_index,
  q.maturity_level,
  q.evidence_required,
  q.evidence_description
FROM department_questionnaire_sections s
CROSS JOIN LATERAL (
  VALUES
    (
      'Do you have documented procedures?',
      'Assessment of procedure documentation',
      'boolean',
      NULL,
      20,
      1,
      3,
      true,
      'Please provide procedure documentation'
    ),
    (
      'How often are procedures reviewed?',
      'Frequency of procedure reviews',
      'multi_choice',
      '{"options": ["Monthly", "Quarterly", "Annually", "Never"]}'::jsonb,
      20,
      2,
      3,
      true,
      'Provide review records'
    ),
    (
      'What is your current maturity level?',
      'Self-assessment of process maturity',
      'scale',
      '{"min": 1, "max": 5, "step": 1, "unit": "level"}'::jsonb,
      20,
      3,
      3,
      false,
      NULL
    ),
    (
      'When was the last assessment?',
      'Date of most recent assessment',
      'date',
      NULL,
      20,
      4,
      3,
      true,
      'Provide assessment results'
    ),
    (
      'Do you have contingency plans?',
      'Assessment of backup procedures',
      'boolean',
      NULL,
      20,
      5,
      3,
      true,
      'Provide contingency plans'
    )
) as q(
  question,
  description,
  type,
  options,
  weight,
  order_index,
  maturity_level,
  evidence_required,
  evidence_description
);