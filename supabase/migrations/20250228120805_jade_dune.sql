-- First, clean up any existing data
DELETE FROM maturity_assessment_responses;
DELETE FROM maturity_assessment_questions;
DELETE FROM maturity_assessment_categories;

-- Insert maturity assessment categories based on BCDR best practices
INSERT INTO maturity_assessment_categories (
  name,
  description,
  weight,
  order_index
) VALUES
('Program Governance', 'Assessment of BCDR program governance and management maturity', 20, 1),
('Risk Management', 'Evaluation of risk assessment and treatment process maturity', 20, 2),
('Business Impact Analysis', 'Assessment of BIA methodology and implementation maturity', 20, 3),
('Recovery Capabilities', 'Evaluation of recovery strategy and implementation maturity', 20, 4),
('Documentation and Procedures', 'Assessment of documentation and procedure maturity', 20, 5);

-- Create function to get category ID
CREATE OR REPLACE FUNCTION get_maturity_category_id(p_name text) 
RETURNS uuid AS $$
DECLARE
  v_category_id uuid;
BEGIN
  SELECT id INTO v_category_id
  FROM maturity_assessment_categories
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
  -- Program Governance Questions
  SELECT get_maturity_category_id('Program Governance') INTO v_category_id;

  -- Question 1: Program Structure
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.1", "description": "Leadership and commitment"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "program_structure_{date}"}'::jsonb;
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["Initial", "Managed", "Defined", "Measured", "Optimizing"]}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your BCDR program structure?',
    'Assess the maturity of program organization, governance, and management framework',
    'scale',
    v_options,
    20,
    1,
    3,
    v_standard_ref,
    true,
    'Provide program charter, governance framework, and organizational structure documentation',
    v_evidence_req
  );

  -- Question 2: Leadership Commitment
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No commitment", "Limited support", "Active support", "Strong commitment", "Full commitment"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.1", "description": "Leadership commitment"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "leadership_commitment_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'What is the level of leadership commitment?',
    'Evaluate executive support and resource allocation for BCDR program',
    'scale',
    v_options,
    20,
    2,
    4,
    v_standard_ref,
    true,
    'Provide evidence of executive sponsorship and resource allocation',
    v_evidence_req
  );

  -- Question 3: Policy Framework
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No framework", "Basic policies", "Defined framework", "Comprehensive framework", "Integrated framework"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.2", "description": "Policy"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "policy_framework_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your policy framework?',
    'Assess the comprehensiveness and integration of BCDR policies',
    'scale',
    v_options,
    20,
    3,
    3,
    v_standard_ref,
    true,
    'Provide policy documentation and framework',
    v_evidence_req
  );

  -- Question 4: Performance Monitoring
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No monitoring", "Basic metrics", "Regular monitoring", "Advanced metrics", "Continuous improvement"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "9.1", "description": "Monitoring, measurement, analysis and evaluation"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "performance_monitoring_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your performance monitoring?',
    'Evaluate the sophistication of program performance measurement',
    'scale',
    v_options,
    20,
    4,
    4,
    v_standard_ref,
    true,
    'Provide performance metrics and monitoring documentation',
    v_evidence_req
  );

  -- Question 5: Continuous Improvement
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No process", "Ad-hoc improvements", "Defined process", "Measured process", "Optimizing process"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "10.2", "description": "Continual improvement"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "continuous_improvement_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your improvement process?',
    'Assess the maturity of continuous improvement practices',
    'scale',
    v_options,
    20,
    5,
    5,
    v_standard_ref,
    true,
    'Provide improvement process documentation and results',
    v_evidence_req
  );

  -- Risk Management Questions
  SELECT get_maturity_category_id('Risk Management') INTO v_category_id;

  -- Question 1: Risk Assessment
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Repeatable", "Defined", "Managed", "Optimizing"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.3", "description": "Risk assessment"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_assessment_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your risk assessment process?',
    'Evaluate the sophistication of risk identification and assessment',
    'scale',
    v_options,
    20,
    1,
    3,
    v_standard_ref,
    true,
    'Provide risk assessment methodology and results',
    v_evidence_req
  );

  -- Question 2: Risk Treatment
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No treatment", "Basic treatment", "Defined process", "Managed process", "Optimized process"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3.3", "description": "Risk treatment"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_treatment_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your risk treatment process?',
    'Assess the effectiveness of risk treatment implementation',
    'scale',
    v_options,
    20,
    2,
    4,
    v_standard_ref,
    true,
    'Provide risk treatment procedures and results',
    v_evidence_req
  );

  -- Question 3: Risk Monitoring
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No monitoring", "Basic monitoring", "Regular monitoring", "Advanced monitoring", "Continuous monitoring"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "9.1", "description": "Risk monitoring"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_monitoring_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your risk monitoring process?',
    'Evaluate the sophistication of risk monitoring and review',
    'scale',
    v_options,
    20,
    3,
    4,
    v_standard_ref,
    true,
    'Provide risk monitoring procedures and reports',
    v_evidence_req
  );

  -- Question 4: Risk Communication
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No communication", "Basic updates", "Regular reporting", "Comprehensive reporting", "Integrated communication"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.4", "description": "Communication"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_communication_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your risk communication process?',
    'Assess the effectiveness of risk communication and reporting',
    'scale',
    v_options,
    20,
    4,
    3,
    v_standard_ref,
    true,
    'Provide risk communication procedures and examples',
    v_evidence_req
  );

  -- Question 5: Risk Integration
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No integration", "Limited integration", "Partial integration", "Significant integration", "Full integration"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "6.1", "description": "Risk integration"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_integration_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How well is risk management integrated with other processes?',
    'Evaluate integration of risk management with business processes',
    'scale',
    v_options,
    20,
    5,
    5,
    v_standard_ref,
    true,
    'Provide evidence of risk management integration',
    v_evidence_req
  );

  -- Business Impact Analysis Questions
  SELECT get_maturity_category_id('Business Impact Analysis') INTO v_category_id;

  -- Question 1: BIA Methodology
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No methodology", "Basic approach", "Defined methodology", "Advanced methodology", "Best practice methodology"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Business impact analysis"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "bia_methodology_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your BIA methodology?',
    'Assess the sophistication of BIA processes and methods',
    'scale',
    v_options,
    20,
    1,
    3,
    v_standard_ref,
    true,
    'Provide BIA methodology documentation',
    v_evidence_req
  );

  -- Question 2: Impact Assessment
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["Basic assessment", "Defined criteria", "Comprehensive assessment", "Advanced analysis", "Leading practice"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Impact assessment"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "impact_assessment_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How sophisticated is your impact assessment?',
    'Evaluate the depth and breadth of impact analysis',
    'scale',
    v_options,
    20,
    2,
    4,
    v_standard_ref,
    true,
    'Provide impact assessment methodology and results',
    v_evidence_req
  );

  -- Question 3: Dependency Mapping
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No mapping", "Basic mapping", "Detailed mapping", "Comprehensive mapping", "Advanced mapping"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Dependencies"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "vsd"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "dependency_mapping_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your dependency mapping?',
    'Assess the sophistication of dependency identification and analysis',
    'scale',
    v_options,
    20,
    3,
    4,
    v_standard_ref,
    true,
    'Provide dependency mapping documentation',
    v_evidence_req
  );

  -- Question 4: Recovery Requirements
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["Basic requirements", "Defined requirements", "Detailed requirements", "Comprehensive requirements", "Advanced requirements"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Recovery requirements"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_requirements_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your recovery requirements analysis?',
    'Evaluate the sophistication of recovery requirement definition',
    'scale',
    v_options,
    20,
    4,
    3,
    v_standard_ref,
    true,
    'Provide recovery requirements documentation',
    v_evidence_req
  );

  -- Question 5: BIA Integration
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No integration", "Limited integration", "Partial integration", "Significant integration", "Full integration"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "BIA integration"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "bia_integration_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How well is BIA integrated with other processes?',
    'Assess integration of BIA with risk management and strategy',
    'scale',
    v_options,
    20,
    5,
    5,
    v_standard_ref,
    true,
    'Provide evidence of BIA integration',
    v_evidence_req
  );

  -- Recovery Capabilities Questions
  SELECT get_maturity_category_id('Recovery Capabilities') INTO v_category_id;

  -- Question 1: Recovery Strategies
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No strategies", "Basic strategies", "Defined strategies", "Comprehensive strategies", "Advanced strategies"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3", "description": "Business continuity strategies"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_strategies_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature are your recovery strategies?',
    'Assess the sophistication of recovery strategy development',
    'scale',
    v_options,
    20,
    1,
    3,
    v_standard_ref,
    true,
    'Provide recovery strategy documentation',
    v_evidence_req
  );

  -- Question 2: Recovery Capabilities
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["Basic capabilities", "Developing capabilities", "Established capabilities", "Advanced capabilities", "Leading capabilities"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3", "description": "Recovery capabilities"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_capabilities_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature are your recovery capabilities?',
    'Evaluate the sophistication of recovery implementation',
    'scale',
    v_options,
    20,
    2,
    4,
    v_standard_ref,
    true,
    'Provide recovery capability documentation',
    v_evidence_req
  );

  -- Question 3: Recovery Testing
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No testing", "Basic testing", "Regular testing", "Comprehensive testing", "Advanced testing"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Testing and exercising"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_testing_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your recovery testing program?',
    'Assess the sophistication of recovery validation',
    'scale',
    v_options,
    20,
    3,
    4,
    v_standard_ref,
    true,
    'Provide recovery testing documentation',
    v_evidence_req
  );

  -- Question 4: Recovery Metrics
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No metrics", "Basic metrics", "Defined metrics", "Advanced metrics", "Leading metrics"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "9.1", "description": "Recovery metrics"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_metrics_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature are your recovery metrics?',
    'Evaluate the sophistication of recovery performance measurement',
    'scale',
    v_options,
    20,
    4,
    4,
    v_standard_ref,
    true,
    'Provide recovery metrics documentation',
    v_evidence_req
  );

  -- Question 5: Recovery Improvement
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No improvement", "Ad-hoc improvement", "Regular improvement", "Systematic improvement", "Continuous improvement"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "10.2", "description": "Continual improvement"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_improvement_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your recovery improvement process?',
    'Assess the sophistication of recovery capability improvement',
    'scale',
    v_options,
    20,
    5,
    5,
    v_standard_ref,
    true,
    'Provide recovery improvement documentation',
    v_evidence_req
  );

  -- Documentation and Procedures Questions
  SELECT get_maturity_category_id('Documentation and Procedures') INTO v_category_id;

  -- Question 1: Documentation Framework
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No framework", "Basic framework", "Defined framework", "Comprehensive framework", "Advanced framework"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.5", "description": "Documented information"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "documentation_framework_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your documentation framework?',
    'Assess the sophistication of documentation management',
    'scale',
    v_options,
    20,
    1,
    3,
    v_standard_ref,
    true,
    'Provide documentation framework evidence',
    v_evidence_req
  );

  -- Question 2: Procedure Quality
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["Basic procedures", "Developing procedures", "Defined procedures", "Comprehensive procedures", "Best practice procedures"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4", "description": "Business continuity procedures"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "procedure_quality_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your procedure quality?',
    'Evaluate the quality and usability of procedures',
    'scale',
    v_options,
    20,
    2,
    4,
    v_standard_ref,
    true,
    'Provide procedure examples and quality standards',
    v_evidence_req
  );

  -- Question 3: Document Control
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No control", "Basic control", "Defined control", "Advanced control", "Optimized control"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.5", "description": "Document control"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "document_control_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your document control?',
    'Assess the sophistication of document management and control',
    'scale',
    v_options,
    20,
    3,
    3,
    v_standard_ref,
    true,
    'Provide document control procedures',
    v_evidence_req
  );

  -- Question 4: Documentation Review
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No review", "Ad-hoc review", "Regular review", "Systematic review", "Continuous review"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.5", "description": "Documentation review"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min files": 1, "max_files": 3, "naming_convention": "documentation_review_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your documentation review process?',
    'Evaluate the sophistication of documentation review and update',
    'scale',
    v_options,
    20,
    4,
    4,
    v_standard_ref,
    true,
    'Provide documentation review procedures and history',
    v_evidence_req
  );

  -- Question 5: Documentation Access
  v_options := '{"min": 1, "max": 5, "step": 1, "labels": ["No controls", "Basic controls", "Defined controls", "Advanced controls", "Optimized controls"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.5", "description": "Documentation access"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "documentation_access_{date}"}'::jsonb;

  INSERT INTO maturity_assessment_questions (
    category_id, question, description, type, options, weight, order_index,
    maturity_level, standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How mature is your documentation access control?',
    'Assess the sophistication of documentation access and security',
    'scale',
    v_options,
    20,
    5,
    4,
    v_standard_ref,
    true,
    'Provide access control procedures and systems',
    v_evidence_req
  );

END $$;

-- Drop helper function
DROP FUNCTION IF EXISTS get_maturity_category_id(text);

-- Verify the data
DO $$
DECLARE
  category_count integer;
  question_count integer;
BEGIN
  SELECT COUNT(*) INTO category_count
  FROM maturity_assessment_categories;

  SELECT COUNT(*) INTO question_count
  FROM maturity_assessment_questions;

  IF category_count != 5 THEN
    RAISE EXCEPTION 'Expected 5 categories, found %', category_count;
  END IF;

  IF question_count != 25 THEN
    RAISE EXCEPTION 'Expected 25 questions, found %', question_count;
  END IF;
END $$;