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

  PERFORM insert_resiliency_question(
    v_category_id,
    'How often is the BCDR policy reviewed?',
    'Evaluate policy maintenance and currency',
    'multi_choice',
    '{"options": ["Never", "Every 2+ years", "Annually", "Semi-annually", "Quarterly"]}',
    20,
    4,
    '{"name": "ISO 22301:2019", "clause": "5.2", "description": "Policy review"}',
    true,
    'Provide policy review history',
    '{"dependsOn": "Is there a documented BCDR policy?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "policy_review_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'Are BCDR roles and responsibilities defined?',
    'Assess clarity of roles and accountabilities',
    'boolean',
    NULL,
    20,
    5,
    '{"name": "ISO 22301:2019", "clause": "5.3", "description": "Roles and responsibilities"}',
    true,
    'Provide RACI matrix and role definitions',
    NULL,
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "raci_matrix_{date}"}'
  );

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

  PERFORM insert_resiliency_question(
    v_category_id,
    'How often are risk assessments conducted?',
    'Evaluate frequency of risk assessment activities',
    'multi_choice',
    '{"options": ["Never", "Every 2+ years", "Annually", "Semi-annually", "Quarterly"]}',
    20,
    2,
    '{"name": "ISO 22301:2019", "clause": "8.2.3", "description": "Risk assessment frequency"}',
    true,
    'Provide risk assessment schedule and results',
    '{"dependsOn": "Do you have a formal risk assessment methodology?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "risk_assessment_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'Is there a risk treatment process?',
    'Assess the handling of identified risks',
    'boolean',
    NULL,
    20,
    3,
    '{"name": "ISO 22301:2019", "clause": "8.3.3", "description": "Risk treatment"}',
    true,
    'Provide risk treatment procedures',
    '{"dependsOn": "Do you have a formal risk assessment methodology?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_treatment_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How are risk treatments prioritized?',
    'Evaluate risk treatment prioritization approach',
    'multi_choice',
    '{"options": ["No prioritization", "Ad-hoc", "Basic criteria", "Risk matrix", "Advanced analytics"]}',
    20,
    4,
    '{"name": "ISO 22301:2019", "clause": "8.3.3", "description": "Risk prioritization"}',
    true,
    'Provide risk prioritization criteria',
    '{"dependsOn": "Is there a risk treatment process?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_prioritization_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How do you monitor risk treatment effectiveness?',
    'Assess risk treatment monitoring and review',
    'multi_choice',
    '{"options": ["No monitoring", "Ad-hoc reviews", "Regular reviews", "KPI tracking", "Continuous monitoring"]}',
    20,
    5,
    '{"name": "ISO 22301:2019", "clause": "9.1", "description": "Risk monitoring"}',
    true,
    'Provide risk monitoring reports',
    '{"dependsOn": "Is there a risk treatment process?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "risk_monitoring_{date}"}'
  );

  -- Business Impact Analysis Questions
  v_category_id := get_resiliency_category_id('Business Impact Analysis');

  PERFORM insert_resiliency_question(
    v_category_id,
    'Do you have a formal BIA methodology?',
    'Assess the existence of structured BIA processes',
    'boolean',
    NULL,
    20,
    1,
    '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Business impact analysis"}',
    true,
    'Provide BIA methodology documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "bia_methodology_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How often are BIAs conducted?',
    'Evaluate frequency of BIA updates',
    'multi_choice',
    '{"options": ["Never", "Every 2+ years", "Annually", "Semi-annually", "Quarterly"]}',
    20,
    2,
    '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "BIA frequency"}',
    true,
    'Provide BIA schedule and results',
    '{"dependsOn": "Do you have a formal BIA methodology?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "bia_results_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'Are impact criteria defined?',
    'Assess the definition of impact assessment criteria',
    'boolean',
    NULL,
    20,
    3,
    '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Impact criteria"}',
    true,
    'Provide impact criteria documentation',
    '{"dependsOn": "Do you have a formal BIA methodology?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "impact_criteria_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How comprehensive is dependency mapping?',
    'Evaluate the thoroughness of dependency identification',
    'multi_choice',
    '{"options": ["No mapping", "Basic mapping", "Detailed mapping", "Advanced mapping", "Comprehensive mapping"]}',
    20,
    4,
    '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Dependency analysis"}',
    true,
    'Provide dependency mapping documentation',
    '{"dependsOn": "Do you have a formal BIA methodology?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "vsd", "jpg", "png"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "dependency_map_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How are BIA findings validated?',
    'Assess the validation of BIA results',
    'multi_choice',
    '{"options": ["No validation", "Peer review", "Management review", "Multiple reviews", "Independent validation"]}',
    20,
    5,
    '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "BIA validation"}',
    true,
    'Provide BIA validation process documentation',
    '{"dependsOn": "Do you have a formal BIA methodology?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "bia_validation_{date}"}'
  );

  -- Incident Response Questions
  v_category_id := get_resiliency_category_id('Incident Response');

  PERFORM insert_resiliency_question(
    v_category_id,
    'Do you have documented incident response procedures?',
    'Assess the existence of incident response procedures',
    'boolean',
    NULL,
    20,
    1,
    '{"name": "ISO 22301:2019", "clause": "8.4.1", "description": "Incident response"}',
    true,
    'Provide incident response procedures',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "incident_response_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'What is your incident classification system?',
    'Evaluate incident severity classification',
    'multi_choice',
    '{"options": ["No system", "Basic system", "3-level system", "4-level system", "5+ level system"]}',
    20,
    2,
    '{"name": "ISO 22301:2019", "clause": "8.4.2", "description": "Incident classification"}',
    true,
    'Provide incident classification matrix',
    '{"dependsOn": "Do you have documented incident response procedures?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "incident_classification_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'Do you have automated incident detection?',
    'Assess automated detection capabilities',
    'boolean',
    NULL,
    20,
    3,
    '{"name": "ISO 22301:2019", "clause": "8.4.2", "description": "Incident detection"}',
    true,
    'Provide detection system documentation',
    '{"dependsOn": "Do you have documented incident response procedures?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "jpg", "png"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "incident_detection_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'What is your target incident response time?',
    'Evaluate response time objectives',
    'multi_choice',
    '{"options": ["No target", "< 15 minutes", "15-30 minutes", "30-60 minutes", "> 60 minutes"]}',
    20,
    4,
    '{"name": "ISO 22301:2019", "clause": "8.4.3", "description": "Response time"}',
    true,
    'Provide response time objectives',
    '{"dependsOn": "Do you have documented incident response procedures?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "response_time_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How do you track incident resolution?',
    'Assess incident tracking and metrics',
    'multi_choice',
    '{"options": ["No tracking", "Basic tracking", "ITSM system", "Dedicated tool", "Advanced analytics"]}',
    20,
    5,
    '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Incident tracking"}',
    true,
    'Provide incident management metrics',
    '{"dependsOn": "Do you have documented incident response procedures?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "incident_metrics_{date}"}'
  );

  -- Recovery Strategy Questions
  v_category_id := get_resiliency_category_id('Recovery Strategy');

  PERFORM insert_resiliency_question(
    v_category_id,
    'Are recovery strategies documented?',
    'Assess documentation of recovery strategies',
    'boolean',
    NULL,
    20,
    1,
    '{"name": "ISO 22301:2019", "clause": "8.3.2", "description": "Recovery strategies"}',
    true,
    'Provide recovery strategy documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_strategy_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How often are recovery strategies reviewed?',
    'Evaluate strategy review frequency',
    'multi_choice',
    '{"options": ["Never", "Every 2+ years", "Annually", "Semi-annually", "Quarterly"]}',
    20,
    2,
    '{"name": "ISO 22301:2019", "clause": "8.3.2", "description": "Strategy review"}',
    true,
    'Provide strategy review history',
    '{"dependsOn": "Are recovery strategies documented?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "strategy_review_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'Do you have alternate recovery sites?',
    'Assess availability of recovery locations',
    'boolean',
    NULL,
    20,
    3,
    '{"name": "ISO 22301:2019", "clause": "8.3.2", "description": "Recovery locations"}',
    true,
    'Provide recovery site documentation',
    '{"dependsOn": "Are recovery strategies documented?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "jpg", "png"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "recovery_site_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'What level of recovery automation exists?',
    'Evaluate recovery automation capabilities',
    'multi_choice',
    '{"options": ["No automation", "Basic automation", "Partial automation", "Extensive automation", "Full automation"]}',
    20,
    4,
    '{"name": "ISO 22301:2019", "clause": "8.3.2", "description": "Recovery automation"}',
    true,
    'Provide automation documentation',
    '{"dependsOn": "Are recovery strategies documented?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "vsd"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_automation_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How do you validate recovery capabilities?',
    'Assess recovery validation methods',
    'multi_choice',
    '{"options": ["No validation", "Basic testing", "Functional testing", "Full-scale testing", "Continuous validation"]}',
    20,
    5,
    '{"name": "ISO 22301:2019", "clause": "8.3.2", "description": "Recovery validation"}',
    true,
    'Provide validation results',
    '{"dependsOn": "Are recovery strategies documented?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "recovery_validation_{date}"}'
  );

  -- Plan Development Questions
  v_category_id := get_resiliency_category_id('Plan Development');

  PERFORM insert_resiliency_question(
    v_category_id,
    'Do you have standardized plan templates?',
    'Assess plan standardization',
    'boolean',
    NULL,
    20,
    1,
    '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Plan templates"}',
    true,
    'Provide plan templates',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "plan_template_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How often are plans reviewed?',
    'Evaluate plan review frequency',
    'multi_choice',
    '{"options": ["Never", "Every 2+ years", "Annually", "Semi-annually", "Quarterly"]}',
    20,
    2,
    '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Plan review"}',
    true,
    'Provide plan review schedule',
    '{"dependsOn": "Do you have standardized plan templates?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "plan_review_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How do you manage plan versions?',
    'Assess version control practices',
    'multi_choice',
    '{"options": ["No version control", "Basic control", "Document management", "Change management", "Automated system"]}',
    20,
    3,
    '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Version control"}',
    true,
    'Provide version control procedures',
    '{"dependsOn": "Do you have standardized plan templates?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "version_control_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How are plan updates distributed?',
    'Evaluate plan distribution process',
    'multi_choice',
    '{"options": ["No distribution", "Email only", "Shared drive", "Document system", "Automated distribution"]}',
    20,
    4,
    '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Plan distribution"}',
    true,
    'Provide distribution procedures',
    '{"dependsOn": "Do you have standardized plan templates?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "plan_distribution_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How do you track plan acknowledgment?',
    'Assess plan receipt confirmation',
    'multi_choice',
    '{"options": ["No tracking", "Email confirmation", "Sign-off sheets", "Electronic tracking", "Automated system"]}',
    20,
    5,
    '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Plan acknowledgment"}',
    true,
    'Provide acknowledgment records',
    '{"dependsOn": "Do you have standardized plan templates?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "plan_acknowledgment_{date}"}'
  );

  -- Training and Awareness Questions
  v_category_id := get_resiliency_category_id('Training and Awareness');

  PERFORM insert_resiliency_question(
    v_category_id,
    'Do you have a formal training program?',
    'Assess training program structure',
    'boolean',
    NULL,
    20,
    1,
    '{"name": "ISO 22301:2019", "clause": "7.2", "description": "Training program"}',
    true,
    'Provide training program documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "training_program_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How often is training conducted?',
    'Evaluate training frequency',
    'multi_choice',
    '{"options": ["Never", "Annually", "Semi-annually", "Quarterly", "Monthly"]}',
    20,
    2,
    '{"name": "ISO 22301:2019", "clause": "7.2", "description": "Training frequency"}',
    true,
    'Provide training schedule',
    '{"dependsOn": "Do you have a formal training program?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "training_schedule_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'What training methods are used?',
    'Assess training delivery methods',
    'multi_choice',
    '{"options": ["Self-study", "Classroom", "Online", "Hands-on", "Multiple methods"]}',
    20,
    3,
    '{"name": "ISO 22301:2019", "clause": "7.2", "description": "Training methods"}',
    true,
    'Provide training materials',
    '{"dependsOn": "Do you have a formal training program?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "ppt", "pptx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "training_materials_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How do you track training completion?',
    'Evaluate training completion monitoring',
    'multi_choice',
    '{"options": ["No tracking", "Spreadsheets", "LMS", "Integrated system", "Advanced analytics"]}',
    20,
    4,
    '{"name": "ISO 22301:2019", "clause": "7.2", "description": "Training tracking"}',
    true,
    'Provide completion records',
    '{"dependsOn": "Do you have a formal training program?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "training_completion_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How do you measure training effectiveness?',
    'Assess training impact measurement',
    'multi_choice',
    '{"options": ["No measurement", "Feedback forms", "Tests", "Performance metrics", "Multiple methods"]}',
    20,
    5,
    '{"name": "ISO 22301:2019", "clause": "7.2", "description": "Training effectiveness"}',
    true,
    'Provide effectiveness metrics',
    '{"dependsOn": "How do you track training completion?", "condition": "equals", "value": "LMS"}',
    '{"required_files": ["pdf", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "training_effectiveness_{date}"}'
  );

  -- Exercise Program Questions
  v_category_id := get_resiliency_category_id('Exercise Program');

  PERFORM insert_resiliency_question(
    v_category_id,
    'Do you have a formal exercise program?',
    'Assess exercise program structure',
    'boolean',
    NULL,
    20,
    1,
    '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercise program"}',
    true,
    'Provide exercise program documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "exercise_program_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'What types of exercises are conducted?',
    'Evaluate exercise methodology',
    'multi_choice',
    '{"options": ["Tabletop only", "Walkthrough", "Functional", "Full-scale", "Multiple types"]}',
    20,
    2,
    '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercise types"}',
    true,
    'Provide exercise documentation',
    '{"dependsOn": "Do you have a formal exercise program?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "ppt", "pptx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "exercise_types_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How often are exercises conducted?',
    'Assess exercise frequency',
    'multi_choice',
    '{"options": ["Never", "Annually", "Semi-annually", "Quarterly", "Monthly"]}',
    20,
    3,
    '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercise frequency"}',
    true,
    'Provide exercise schedule',
    '{"dependsOn": "Do you have a formal exercise program?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "exercise_schedule_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How do you track exercise findings?',
    'Evaluate exercise result tracking',
    'multi_choice',
    '{"options": ["No tracking", "Basic notes", "Structured reports", "Action tracking", "Integrated system"]}',
    20,
    4,
    '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercise tracking"}',
    true,
    'Provide exercise reports',
    '{"dependsOn": "Do you have a formal exercise program?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "exercise_findings_{date}"}'
  );

  PERFORM insert_resiliency_question(
    v_category_id,
    'How are exercise improvements implemented?',
    'Assess implementation of exercise learnings',
    'multi_choice',
    '{"options": ["No implementation", "Ad-hoc updates", "Formal process", "Change management", "Continuous improvement"]}',
    20,
    5,
    '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercise improvements"}',
    true,
    'Provide improvement records',
    '{"dependsOn": "Do you have a formal exercise program?", "condition": "equals", "value": true}',
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "exercise_improvements_{date}"}'
  );

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