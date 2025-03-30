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

  -- Question 1: Steering Committee
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.1", "description": "Leadership and commitment"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "committee_charter_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
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

  -- Question 2: Committee Meetings
  v_options := '{"options": ["Never", "Annually", "Semi-annually", "Quarterly", "Monthly"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.1", "description": "Management review"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "committee_minutes_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
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

  -- Question 3: BCDR Policy
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.2", "description": "Policy"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "bcdr_policy_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Is there a documented BCDR policy?',
    'Assess the existence of formal BCDR policies',
    'boolean',
    NULL,
    20,
    3,
    v_standard_ref,
    true,
    'Provide BCDR policy documentation',
    v_evidence_req
  );

  -- Question 4: Policy Review
  v_options := '{"options": ["Never", "Every 2+ years", "Annually", "Semi-annually", "Quarterly"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.2", "description": "Policy review"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "policy_review_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How often is the BCDR policy reviewed?',
    'Evaluate policy maintenance and currency',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide policy review history',
    v_evidence_req
  );

  -- Question 5: Roles and Responsibilities
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.3", "description": "Roles and responsibilities"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "raci_matrix_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Are BCDR roles and responsibilities defined?',
    'Assess clarity of roles and accountabilities',
    'boolean',
    NULL,
    20,
    5,
    v_standard_ref,
    true,
    'Provide RACI matrix and role definitions',
    v_evidence_req
  );

  -- Risk Management Questions
  SELECT get_category_id('Risk Management') INTO v_category_id;

  -- Question 1: Risk Assessment Methodology
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.3", "description": "Risk assessment"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_methodology_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
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

  -- Question 2: Risk Assessment Frequency
  v_options := '{"options": ["Never", "Every 2+ years", "Annually", "Semi-annually", "Quarterly"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.3", "description": "Risk assessment frequency"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "risk_assessment_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How often are risk assessments conducted?',
    'Evaluate frequency of risk assessment activities',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide risk assessment schedule and results',
    v_evidence_req
  );

  -- Question 3: Risk Treatment Process
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3.3", "description": "Risk treatment"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_treatment_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Is there a risk treatment process?',
    'Assess the handling of identified risks',
    'boolean',
    NULL,
    20,
    3,
    v_standard_ref,
    true,
    'Provide risk treatment procedures',
    v_evidence_req
  );

  -- Question 4: Risk Treatment Prioritization
  v_options := '{"options": ["No prioritization", "Ad-hoc", "Basic criteria", "Risk matrix", "Advanced analytics"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3.3", "description": "Risk prioritization"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_prioritization_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How are risk treatments prioritized?',
    'Evaluate risk treatment prioritization approach',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide risk prioritization criteria',
    v_evidence_req
  );

  -- Question 5: Risk Treatment Monitoring
  v_options := '{"options": ["No monitoring", "Ad-hoc reviews", "Regular reviews", "KPI tracking", "Continuous monitoring"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "9.1", "description": "Risk monitoring"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "risk_monitoring_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How do you monitor risk treatment effectiveness?',
    'Assess risk treatment monitoring and review',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide risk monitoring reports',
    v_evidence_req
  );

  -- Business Impact Analysis Questions
  SELECT get_category_id('Business Impact Analysis') INTO v_category_id;

  -- Question 1: BIA Methodology
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Business impact analysis"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "bia_methodology_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Do you have a formal BIA methodology?',
    'Assess the existence of structured BIA processes',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide BIA methodology documentation',
    v_evidence_req
  );

  -- Question 2: BIA Frequency
  v_options := '{"options": ["Never", "Every 2+ years", "Annually", "Semi-annually", "Quarterly"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "BIA frequency"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "bia_results_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How often are BIAs conducted?',
    'Evaluate frequency of BIA updates',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide BIA schedule and results',
    v_evidence_req
  );

  -- Question 3: Impact Criteria
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Impact criteria"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "impact_criteria_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Are impact criteria defined?',
    'Assess the definition of impact assessment criteria',
    'boolean',
    NULL,
    20,
    3,
    v_standard_ref,
    true,
    'Provide impact criteria documentation',
    v_evidence_req
  );

  -- Question 4: Dependency Mapping
  v_options := '{"options": ["No mapping", "Basic mapping", "Detailed mapping", "Advanced mapping", "Comprehensive mapping"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Dependency analysis"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "vsd", "jpg", "png"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "dependency_map_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How comprehensive is dependency mapping?',
    'Evaluate the thoroughness of dependency identification',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide dependency mapping documentation',
    v_evidence_req
  );

  -- Question 5: BIA Validation
  v_options := '{"options": ["No validation", "Peer review", "Management review", "Multiple reviews", "Independent validation"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "BIA validation"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "bia_validation_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How are BIA findings validated?',
    'Assess the validation of BIA results',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide BIA validation process documentation',
    v_evidence_req
  );

  -- Incident Response Questions
  SELECT get_category_id('Incident Response') INTO v_category_id;

  -- Question 1: Response Procedures
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4.1", "description": "Incident response"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "incident_response_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Do you have documented incident response procedures?',
    'Assess the existence of incident response procedures',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide incident response procedures',
    v_evidence_req
  );

  -- Question 2: Incident Classification
  v_options := '{"options": ["No system", "Basic system", "3-level system", "4-level system", "5+ level system"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4.2", "description": "Incident classification"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "incident_classification_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'What is your incident classification system?',
    'Evaluate incident severity classification',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide incident classification matrix',
    v_evidence_req
  );

  -- Question 3: Automated Detection
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4.2", "description": "Incident detection"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "jpg", "png"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "incident_detection_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Do you have automated incident detection?',
    'Assess automated detection capabilities',
    'boolean',
    NULL,
    20,
    3,
    v_standard_ref,
    true,
    'Provide detection system documentation',
    v_evidence_req
  );

  -- Question 4: Response Time
  v_options := '{"options": ["No target", "< 15 minutes", "15-30 minutes", "30-60 minutes", "> 60 minutes"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4.3", "description": "Response time"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "response_time_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'What is your target incident response time?',
    'Evaluate response time objectives',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide response time objectives',
    v_evidence_req
  );

  -- Question 5: Incident Tracking
  v_options := '{"options": ["No tracking", "Basic tracking", "ITSM system", "Dedicated tool", "Advanced analytics"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Incident tracking"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "incident_metrics_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How do you track incident resolution?',
    'Assess incident tracking and metrics',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide incident management metrics',
    v_evidence_req
  );

  -- Exercise Program Questions
  SELECT get_category_id('Exercise Program') INTO v_category_id;

  -- Question 1: Exercise Program
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercise program"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "exercise_program_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Do you have a formal exercise program?',
    'Assess exercise program structure',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide exercise program documentation',
    v_evidence_req
  );

  -- Question 2: Exercise Types
  v_options := '{"options": ["Tabletop only", "Walkthrough", "Functional", "Full-scale", "Multiple types"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercise types"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "ppt", "pptx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "exercise_types_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'What types of exercises are conducted?',
    'Evaluate exercise methodology',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide exercise documentation',
    v_evidence_req
  );

  -- Question 3: Exercise Frequency
  v_options := '{"options": ["Never", "Annually", "Semi-annually", "Quarterly", "Monthly"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercise frequency"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "exercise_schedule_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How often are exercises conducted?',
    'Assess exercise frequency',
    'multi_choice',
    v_options,
    20,
    3,
    v_standard_ref,
    true,
    'Provide exercise schedule',
    v_evidence_req
  );

  -- Question 4: Exercise Findings
  v_options := '{"options": ["No tracking", "Basic notes", "Structured reports", "Action tracking", "Integrated system"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercise tracking"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "exercise_findings_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How do you track exercise findings?',
    'Evaluate exercise result tracking',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide exercise reports',
    v_evidence_req
  );

  -- Question 5: Exercise Improvements
  v_options := '{"options": ["No implementation", "Ad-hoc updates", "Formal process", "Change management", "Continuous improvement"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercise improvements"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "exercise_improvements_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How are exercise improvements implemented?',
    'Assess implementation of exercise learnings',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide improvement records',
    v_evidence_req
  );

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