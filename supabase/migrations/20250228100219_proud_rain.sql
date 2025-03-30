-- First, clean up any existing data
DELETE FROM gap_analysis_responses;
DELETE FROM gap_analysis_questions;
DELETE FROM gap_analysis_categories;

-- Insert gap analysis categories based on industry standards
INSERT INTO gap_analysis_categories (
  name,
  description,
  weight,
  order_index
) VALUES
('ISO 22301 Compliance', 'Assessment of compliance with ISO 22301:2019 requirements', 25, 1),
('NIST Framework Alignment', 'Evaluation of alignment with NIST SP 800-34 framework', 25, 2),
('Industry Best Practices', 'Assessment against industry best practices and standards', 25, 3),
('Regulatory Requirements', 'Evaluation of regulatory compliance and obligations', 25, 4);

-- Create function to get category ID
CREATE OR REPLACE FUNCTION get_gap_category_id(p_name text) 
RETURNS uuid AS $$
DECLARE
  v_category_id uuid;
BEGIN
  SELECT id INTO v_category_id
  FROM gap_analysis_categories
  WHERE name = p_name;
  RETURN v_category_id;
END;
$$ LANGUAGE plpgsql;

-- Insert questions for each category
DO $$ 
DECLARE
  v_category_id uuid;
BEGIN
  -- ISO 22301 Compliance Questions
  v_category_id := get_gap_category_id('ISO 22301 Compliance');

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, conditional_logic,
    evidence_requirements
  ) VALUES
  (
    v_category_id,
    'Does your BCMS policy align with ISO 22301:2019 Section 5.2?',
    'Assessment of policy compliance with ISO 22301 requirements including scope, objectives, and commitment',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["No alignment", "Partial alignment", "Mostly aligned", "Fully aligned", "Exceeds requirements"]}',
    20,
    1,
    '{"name": "ISO 22301:2019", "clause": "5.2 Policy", "description": "BCMS policy requirements"}',
    true,
    'Provide BCMS policy documentation showing alignment with ISO 22301:2019 requirements',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "bcms_policy_{date}"}'
  ),
  (
    v_category_id,
    'Have you implemented all required documented information per ISO 22301:2019?',
    'Assessment of documentation completeness against ISO 22301 requirements',
    'multi_choice',
    '{"options": ["None implemented", "Some implemented", "Most implemented", "All implemented", "Exceeds requirements"]}',
    20,
    2,
    '{"name": "ISO 22301:2019", "clause": "7.5 Documented Information", "description": "Documentation requirements"}',
    true,
    'Provide documentation inventory mapped to ISO 22301 requirements',
    NULL,
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "documentation_inventory_{date}"}'
  ),
  (
    v_category_id,
    'How comprehensive is your risk assessment process?',
    'Evaluation of risk assessment methodology against ISO 22301 requirements',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Not implemented", "Basic", "Moderate", "Comprehensive", "Best practice"]}',
    20,
    3,
    '{"name": "ISO 22301:2019", "clause": "8.2.3 Risk Assessment", "description": "Risk assessment requirements"}',
    true,
    'Provide risk assessment methodology and recent results',
    NULL,
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "risk_assessment_{date}"}'
  ),
  (
    v_category_id,
    'How well do your BIA processes align with ISO 22301?',
    'Assessment of BIA methodology and implementation against ISO requirements',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["No alignment", "Basic alignment", "Moderate alignment", "Strong alignment", "Full alignment"]}',
    20,
    4,
    '{"name": "ISO 22301:2019", "clause": "8.2.2 Business Impact Analysis", "description": "BIA requirements"}',
    true,
    'Provide BIA methodology and recent results',
    NULL,
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "bia_methodology_{date}"}'
  ),
  (
    v_category_id,
    'How mature is your performance evaluation process?',
    'Assessment of monitoring, measurement, analysis and evaluation practices',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Not implemented", "Basic", "Established", "Advanced", "Leading"]}',
    20,
    5,
    '{"name": "ISO 22301:2019", "clause": "9.1 Monitoring, Measurement, Analysis and Evaluation", "description": "Performance evaluation requirements"}',
    true,
    'Provide performance evaluation documentation and metrics',
    NULL,
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "performance_evaluation_{date}"}'
  );

  -- NIST Framework Alignment Questions
  v_category_id := get_gap_category_id('NIST Framework Alignment');

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, conditional_logic,
    evidence_requirements
  ) VALUES
  (
    v_category_id,
    'Have you implemented the NIST SP 800-34 planning process?',
    'Assessment of alignment with NIST contingency planning methodology',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Not implemented", "Initial", "Defined", "Managed", "Optimized"]}',
    20,
    1,
    '{"name": "NIST SP 800-34", "clause": "3.1 Contingency Planning Process", "description": "Planning process requirements"}',
    true,
    'Provide contingency planning documentation and process evidence',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "nist_planning_{date}"}'
  ),
  (
    v_category_id,
    'How well do your recovery strategies align with NIST guidance?',
    'Evaluation of recovery strategy development and implementation',
    'multi_choice',
    '{"options": ["No alignment", "Partial alignment", "Mostly aligned", "Fully aligned", "Exceeds guidance"]}',
    20,
    2,
    '{"name": "NIST SP 800-34", "clause": "3.4 Recovery Strategies", "description": "Recovery strategy requirements"}',
    true,
    'Provide recovery strategy documentation and implementation evidence',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_strategy_{date}"}'
  ),
  (
    v_category_id,
    'What is your level of compliance with NIST testing requirements?',
    'Assessment of test, training, and exercise program against NIST requirements',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Non-compliant", "Partially compliant", "Mostly compliant", "Fully compliant", "Exceeds requirements"]}',
    20,
    3,
    '{"name": "NIST SP 800-34", "clause": "3.5 Plan Testing, Training, and Exercises", "description": "Testing requirements"}',
    true,
    'Provide test plans, results, and training records',
    NULL,
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "test_results_{date}"}'
  ),
  (
    v_category_id,
    'How comprehensive is your BIA methodology compared to NIST guidance?',
    'Evaluation of BIA process against NIST SP 800-34 requirements',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Basic", "Developing", "Established", "Advanced", "Leading"]}',
    20,
    4,
    '{"name": "NIST SP 800-34", "clause": "3.2 Business Impact Analysis", "description": "BIA methodology requirements"}',
    true,
    'Provide BIA methodology documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "bia_methodology_{date}"}'
  ),
  (
    v_category_id,
    'How well do you maintain plan documentation?',
    'Assessment of plan maintenance and update processes',
    'multi_choice',
    '{"options": ["No maintenance", "Ad-hoc updates", "Regular reviews", "Comprehensive program", "Continuous maintenance"]}',
    20,
    5,
    '{"name": "NIST SP 800-34", "clause": "3.6 Plan Maintenance", "description": "Plan maintenance requirements"}',
    true,
    'Provide plan maintenance documentation and update history',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "plan_maintenance_{date}"}'
  );

  -- Industry Best Practices Questions
  v_category_id := get_gap_category_id('Industry Best Practices');

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, conditional_logic,
    evidence_requirements
  ) VALUES
  (
    v_category_id,
    'How mature is your crisis management program?',
    'Assessment of crisis management capabilities against industry best practices',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Initial", "Developing", "Established", "Advanced", "Leading"]}',
    20,
    1,
    '{"name": "DRII Professional Practices", "clause": "Professional Practice 7 - Crisis Management", "description": "Crisis management requirements"}',
    true,
    'Provide crisis management plan and exercise documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "crisis_management_{date}"}'
  ),
  (
    v_category_id,
    'Do you have a comprehensive supply chain resilience program?',
    'Evaluation of supply chain continuity management practices',
    'multi_choice',
    '{"options": ["No program", "Basic program", "Moderate program", "Comprehensive program", "Industry-leading program"]}',
    20,
    2,
    '{"name": "ISO 28000", "clause": "Supply Chain Security Management", "description": "Supply chain requirements"}',
    true,
    'Provide supply chain resilience program documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "supply_chain_{date}"}'
  ),
  (
    v_category_id,
    'How well do you manage third-party dependencies?',
    'Assessment of third-party risk management and continuity requirements',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["No management", "Basic", "Moderate", "Advanced", "Best-in-class"]}',
    20,
    3,
    '{"name": "FFIEC BCM", "clause": "Third-Party Service Providers", "description": "Third-party management requirements"}',
    true,
    'Provide third-party management program documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "third_party_{date}"}'
  ),
  (
    v_category_id,
    'How comprehensive is your incident management program?',
    'Evaluation of incident management practices against industry standards',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Basic", "Developing", "Established", "Advanced", "Leading"]}',
    20,
    4,
    '{"name": "ITIL", "clause": "Incident Management", "description": "Incident management best practices"}',
    true,
    'Provide incident management documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "incident_management_{date}"}'
  ),
  (
    v_category_id,
    'How mature is your change management process?',
    'Assessment of change management practices and controls',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Repeatable", "Defined", "Managed", "Optimized"]}',
    20,
    5,
    '{"name": "ITIL", "clause": "Change Management", "description": "Change management best practices"}',
    true,
    'Provide change management process documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "change_management_{date}"}'
  );

  -- Regulatory Requirements Questions
  v_category_id := get_gap_category_id('Regulatory Requirements');

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, conditional_logic,
    evidence_requirements
  ) VALUES
  (
    v_category_id,
    'Have you identified all applicable regulatory requirements?',
    'Assessment of regulatory requirement identification and mapping',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Not started", "In progress", "Mostly complete", "Complete", "Continuously updated"]}',
    20,
    1,
    '{"name": "ISO 22301:2019", "clause": "4.2 Understanding Needs and Expectations", "description": "Regulatory requirements"}',
    true,
    'Provide regulatory requirement register and compliance mapping',
    NULL,
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "regulatory_requirements_{date}"}'
  ),
  (
    v_category_id,
    'How well do you maintain compliance documentation?',
    'Evaluation of compliance evidence maintenance and currency',
    'multi_choice',
    '{"options": ["No documentation", "Minimal documentation", "Partial documentation", "Complete documentation", "Enhanced documentation"]}',
    20,
    2,
    '{"name": "NIST SP 800-34", "clause": "2.1 Laws and Regulations", "description": "Compliance documentation"}',
    true,
    'Provide compliance documentation management system evidence',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "compliance_documentation_{date}"}'
  ),
  (
    v_category_id,
    'Do you have a process for monitoring regulatory changes?',
    'Assessment of regulatory change monitoring capabilities',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["No process", "Ad-hoc process", "Defined process", "Managed process", "Optimized process"]}',
    20,
    3,
    '{"name": "ISO 22301:2019", "clause": "4.1 Understanding the Organization", "description": "Regulatory monitoring"}',
    true,
    'Provide regulatory change management process documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "regulatory_monitoring_{date}"}'
  ),
  (
    v_category_id,
    'How do you assess the impact of regulatory changes?',
    'Evaluation of regulatory change impact assessment process',
    'multi_choice',
    '{"options": ["No assessment", "Basic assessment", "Structured analysis", "Comprehensive review", "Advanced analytics"]}',
    20,
    4,
    '{"name": "ISO 22301:2019", "clause": "4.1", "description": "Impact assessment"}',
    true,
    'Provide regulatory impact assessment documentation',
    NULL,
    '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "regulatory_impact_{date}"}'
  ),
  (
    v_category_id,
    'How effectively do you implement regulatory changes?',
    'Assessment of regulatory change implementation process',
    'scale',
    '{"min": 1, "max": 5, "step": 1, "labels": ["Ad-hoc", "Basic", "Managed", "Effective", "Optimized"]}',
    20,
    5,
    '{"name": "ISO 22301:2019", "clause": "4.1", "description": "Change implementation"}',
    true,
    'Provide regulatory change implementation evidence',
    NULL,
    '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "regulatory_implementation_{date}"}'
  );

END $$;

-- Drop helper function
DROP FUNCTION IF EXISTS get_gap_category_id(text);

-- Verify the data
DO $$
DECLARE
  category_count integer;
  question_count integer;
BEGIN
  SELECT COUNT(*) INTO category_count
  FROM gap_analysis_categories;

  SELECT COUNT(*) INTO question_count
  FROM gap_analysis_questions;

  IF category_count != 4 THEN
    RAISE EXCEPTION 'Expected 4 categories, found %', category_count;
  END IF;

  IF question_count < 15 THEN
    RAISE EXCEPTION 'Expected at least 15 questions, found %', question_count;
  END IF;
END $$;