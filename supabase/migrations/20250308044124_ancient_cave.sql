/*
  # Add Program Governance Questions

  1. New Questions
    - Add comprehensive set of questions for Program Governance category
    - Questions aligned with ISO 22301, NIST, and industry best practices
    - Questions designed to assess maturity levels 1-5

  2. Changes
    - Questions cover key governance areas:
      - Leadership commitment
      - Policy and standards
      - Roles and responsibilities
      - Program oversight
      - Resource allocation
      - Continuous improvement
*/

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
  question,
  description,
  type,
  options::jsonb,
  weight,
  maturity_level,
  evidence_required,
  evidence_description,
  standard_reference::jsonb,
  order_index
FROM (
  VALUES
    (
      'Is there executive sponsorship for the BCDR program?',
      'Level of executive commitment and support',
      'boolean',
      null,
      10,
      1,
      true,
      'Provide evidence of executive sponsorship (e.g., charter, policy sign-off)',
      '{"name": "ISO 22301", "clause": "5.1", "description": "Leadership and commitment"}',
      1
    ),
    (
      'Is there a formal BCDR policy?',
      'Existence and scope of BCDR policy',
      'boolean',
      null,
      10,
      1,
      true,
      'Provide current BCDR policy document',
      '{"name": "ISO 22301", "clause": "5.2", "description": "Management policy"}',
      2
    ),
    (
      'How often is the BCDR policy reviewed?',
      'Frequency of policy review and updates',
      'multi_choice',
      '{"options": ["Never", "Ad-hoc", "Annually", "Semi-annually", "Quarterly"]}',
      15,
      2,
      true,
      'Provide policy review records and change history',
      '{"name": "ISO 22301", "clause": "9.3", "description": "Management review"}',
      3
    ),
    (
      'Are BCDR roles and responsibilities defined?',
      'Clear definition of program roles',
      'scale',
      '{"min": 1, "max": 5, "step": 1, "labels": ["Undefined", "Basic", "Defined", "Detailed", "Comprehensive"]}',
      15,
      2,
      true,
      'Provide RACI matrix or role definitions',
      '{"name": "NIST SP 800-34", "clause": "3.1", "description": "Resource requirements"}',
      4
    ),
    (
      'Is there a formal BCDR steering committee?',
      'Existence of governance committee',
      'boolean',
      null,
      15,
      3,
      true,
      'Provide committee charter and meeting minutes',
      '{"name": "ISO 22301", "clause": "5.3", "description": "Organizational roles, responsibilities"}',
      5
    ),
    (
      'How often does the steering committee meet?',
      'Frequency of governance meetings',
      'multi_choice',
      '{"options": ["Never", "Annually", "Quarterly", "Monthly", "Bi-weekly"]}',
      10,
      3,
      true,
      'Provide meeting schedule and attendance records',
      '{"name": "BCI GPG", "clause": "1.4", "description": "Program governance"}',
      6
    ),
    (
      'How is program performance measured?',
      'Metrics and KPIs for program assessment',
      'multi_choice',
      '{"options": ["No metrics", "Basic metrics", "Regular reporting", "KPI dashboard", "Automated metrics"]}',
      15,
      3,
      true,
      'Provide program metrics and reports',
      '{"name": "ISO 22301", "clause": "9.1", "description": "Monitoring, measurement, analysis"}',
      7
    ),
    (
      'Is there dedicated budget for BCDR?',
      'Resource allocation for program',
      'multi_choice',
      '{"options": ["No budget", "Ad-hoc funding", "Annual budget", "Multi-year budget", "Risk-based funding"]}',
      15,
      4,
      true,
      'Provide budget allocation documentation',
      '{"name": "ISO 22301", "clause": "7.1", "description": "Resources"}',
      8
    ),
    (
      'How mature is the continuous improvement process?',
      'Program improvement methodology',
      'scale',
      '{"min": 1, "max": 5, "step": 1, "labels": ["None", "Ad-hoc", "Defined", "Measured", "Optimizing"]}',
      15,
      4,
      true,
      'Provide improvement process documentation',
      '{"name": "ISO 22301", "clause": "10.1", "description": "Continual improvement"}',
      9
    ),
    (
      'How is program compliance monitored?',
      'Compliance and audit processes',
      'multi_choice',
      '{"options": ["No monitoring", "Self-assessments", "Internal audit", "External audit", "Continuous monitoring"]}',
      15,
      5,
      true,
      'Provide compliance monitoring evidence',
      '{"name": "ISO 22301", "clause": "9.2", "description": "Internal audit"}',
      10
    ),
    (
      'How integrated is BCDR with enterprise risk?',
      'Integration with enterprise risk management',
      'scale',
      '{"min": 1, "max": 5, "step": 1, "labels": ["Isolated", "Aware", "Coordinated", "Integrated", "Unified"]}',
      15,
      5,
      true,
      'Provide evidence of risk integration',
      '{"name": "ISO 22301", "clause": "6.1", "description": "Actions to address risks and opportunities"}',
      11
    ),
    (
      'How is program strategy aligned with business?',
      'Strategic alignment and value delivery',
      'scale',
      '{"min": 1, "max": 5, "step": 1, "labels": ["None", "Basic", "Aligned", "Integrated", "Driving"]}',
      15,
      5,
      true,
      'Provide strategic alignment documentation',
      '{"name": "ISO 22301", "clause": "4.1", "description": "Understanding the organization"}',
      12
    )
) as data (
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
CROSS JOIN (
  SELECT id FROM maturity_assessment_categories WHERE name = 'Program Governance'
) as cat;