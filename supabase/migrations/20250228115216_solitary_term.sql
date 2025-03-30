-- First, clean up any existing data
DELETE FROM gap_analysis_responses;
DELETE FROM gap_analysis_questions;
DELETE FROM gap_analysis_categories;

-- Insert gap analysis categories based on BCDR standards
INSERT INTO gap_analysis_categories (
  name,
  description,
  weight,
  order_index
) VALUES
('Program Management', 'Assessment of BCDR program governance and management gaps', 20, 1),
('Risk and Impact Analysis', 'Evaluation of risk assessment and BIA process gaps', 20, 2),
('Strategy and Planning', 'Assessment of recovery and continuity strategy gaps', 20, 3),
('Implementation', 'Evaluation of plan development and implementation gaps', 20, 4),
('Testing and Maintenance', 'Assessment of exercise, testing and maintenance program gaps', 20, 5);

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
  v_standard_ref jsonb;
  v_evidence_req jsonb;
  v_options jsonb;
BEGIN
  -- Program Management Questions
  SELECT get_gap_category_id('Program Management') INTO v_category_id;

  -- Question 1: Program Governance
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.1", "description": "Leadership and commitment"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "governance_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Does the BCDR program have executive sponsorship?',
    'Assess level of executive support and program governance',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide evidence of executive sponsorship and governance structure',
    v_evidence_req
  );

  -- Question 2: Resource Allocation
  v_options := '{"options": ["No resources", "Limited resources", "Adequate resources", "Well-resourced", "Fully resourced"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.1", "description": "Resources"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "resources_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How adequate is program resource allocation?',
    'Evaluate resource allocation against program needs',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide resource allocation documentation',
    v_evidence_req
  );

  -- Question 3: Policy Framework
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "5.2", "description": "Policy"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "policy_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Is there a comprehensive BCDR policy framework?',
    'Assess completeness of policy documentation',
    'boolean',
    NULL,
    20,
    3,
    v_standard_ref,
    true,
    'Provide policy documentation',
    v_evidence_req
  );

  -- Question 4: Program Scope
  v_options := '{"options": ["Undefined", "Partially defined", "Mostly defined", "Well defined", "Comprehensive"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "4.3", "description": "Scope of the BCMS"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "scope_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How well is the program scope defined?',
    'Evaluate clarity and completeness of program scope',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide program scope documentation',
    v_evidence_req
  );

  -- Question 5: Performance Monitoring
  v_options := '{"options": ["No monitoring", "Basic metrics", "Regular monitoring", "Comprehensive metrics", "Advanced analytics"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "9.1", "description": "Monitoring, measurement, analysis and evaluation"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "metrics_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How effectively is program performance monitored?',
    'Assess program performance measurement and monitoring',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide performance monitoring documentation',
    v_evidence_req
  );

  -- Risk and Impact Analysis Questions
  SELECT get_gap_category_id('Risk and Impact Analysis') INTO v_category_id;

  -- Question 1: Risk Assessment Process
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.3", "description": "Risk assessment"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "risk_assessment_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Is there a formal risk assessment process?',
    'Assess completeness of risk assessment methodology',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide risk assessment methodology documentation',
    v_evidence_req
  );

  -- Question 2: BIA Process
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Business impact analysis"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "bia_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Is there a formal BIA process?',
    'Assess completeness of BIA methodology',
    'boolean',
    NULL,
    20,
    2,
    v_standard_ref,
    true,
    'Provide BIA methodology documentation',
    v_evidence_req
  );

  -- Question 3: Dependency Analysis
  v_options := '{"options": ["Not performed", "Basic analysis", "Detailed analysis", "Comprehensive analysis", "Advanced analysis"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Dependencies"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "vsd"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "dependencies_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How thorough is dependency analysis?',
    'Evaluate completeness of dependency identification and analysis',
    'multi_choice',
    v_options,
    20,
    3,
    v_standard_ref,
    true,
    'Provide dependency analysis documentation',
    v_evidence_req
  );

  -- Question 4: Impact Criteria
  v_options := '{"options": ["Not defined", "Basic criteria", "Detailed criteria", "Comprehensive criteria", "Advanced criteria"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.2.2", "description": "Impact criteria"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "impact_criteria_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How well are impact criteria defined?',
    'Assess completeness of impact assessment criteria',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide impact criteria documentation',
    v_evidence_req
  );

  -- Question 5: Analysis Review
  v_options := '{"options": ["Never reviewed", "Ad-hoc review", "Annual review", "Regular review", "Continuous review"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "9.1", "description": "Analysis review"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "analysis_review_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How often are risk and impact analyses reviewed?',
    'Evaluate frequency of risk and impact analysis updates',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide analysis review documentation',
    v_evidence_req
  );

  -- Strategy and Planning Questions
  SELECT get_gap_category_id('Strategy and Planning') INTO v_category_id;

  -- Question 1: Recovery Strategies
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3", "description": "Business continuity strategies and solutions"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "strategies_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Are recovery strategies documented?',
    'Assess documentation of recovery and continuity strategies',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide recovery strategy documentation',
    v_evidence_req
  );

  -- Question 2: Strategy Options
  v_options := '{"options": ["Single option", "Limited options", "Multiple options", "Comprehensive options", "Advanced strategies"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3", "description": "Strategy options"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "strategy_options_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How many recovery strategy options exist?',
    'Evaluate range and flexibility of recovery strategies',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide strategy options documentation',
    v_evidence_req
  );

  -- Question 3: Resource Requirements
  v_options := '{"options": ["Not documented", "Partially documented", "Mostly documented", "Fully documented", "Continuously updated"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3", "description": "Resource requirements"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "resources_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How well are resource requirements documented?',
    'Assess documentation of resources needed for recovery',
    'multi_choice',
    v_options,
    20,
    3,
    v_standard_ref,
    true,
    'Provide resource requirements documentation',
    v_evidence_req
  );

  -- Question 4: Strategy Validation
  v_options := '{"options": ["Not validated", "Partially validated", "Mostly validated", "Fully validated", "Continuously validated"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3", "description": "Strategy validation"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "validation_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How thoroughly are strategies validated?',
    'Evaluate strategy validation and testing',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide strategy validation documentation',
    v_evidence_req
  );

  -- Question 5: Strategy Review
  v_options := '{"options": ["Never reviewed", "Ad-hoc review", "Annual review", "Regular review", "Continuous review"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3", "description": "Strategy review"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "strategy_review_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How often are strategies reviewed?',
    'Assess frequency of strategy review and updates',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide strategy review documentation',
    v_evidence_req
  );

  -- Implementation Questions
  SELECT get_gap_category_id('Implementation') INTO v_category_id;

  -- Question 1: Plan Documentation
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4", "description": "Business continuity procedures"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "procedures_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Are BC/DR procedures documented?',
    'Assess documentation of recovery and continuity procedures',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide procedure documentation',
    v_evidence_req
  );

  -- Question 2: Plan Coverage
  v_options := '{"options": ["< 25% coverage", "25-50% coverage", "51-75% coverage", "76-90% coverage", "> 90% coverage"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4", "description": "Procedure coverage"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "coverage_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'What is the coverage of BC/DR procedures?',
    'Evaluate completeness of procedure documentation',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide procedure inventory and coverage analysis',
    v_evidence_req
  );

  -- Question 3: Plan Quality
  v_options := '{"options": ["Poor quality", "Basic quality", "Good quality", "High quality", "Excellent quality"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4", "description": "Procedure quality"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "quality_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'What is the quality of BC/DR procedures?',
    'Assess quality and usability of procedures',
    'multi_choice',
    v_options,
    20,
    3,
    v_standard_ref,
    true,
    'Provide procedure quality assessment',
    v_evidence_req
  );

  -- Question 4: Plan Access
  v_options := '{"options": ["No access control", "Basic access", "Role-based access", "Managed access", "Advanced access"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4", "description": "Procedure access"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "access_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How is procedure access managed?',
    'Evaluate procedure access control and distribution',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide access control documentation',
    v_evidence_req
  );

  -- Question 5: Plan Integration
  v_options := '{"options": ["No integration", "Limited integration", "Partial integration", "Good integration", "Full integration"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4", "description": "Procedure integration"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "integration_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How well are procedures integrated?',
    'Assess integration with other operational procedures',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide procedure integration documentation',
    v_evidence_req
  );

  -- Testing and Maintenance Questions
  SELECT get_gap_category_id('Testing and Maintenance') INTO v_category_id;

  -- Question 1: Test Program
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Exercising and testing"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "test_program_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'Is there a formal test program?',
    'Assess existence of structured test program',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide test program documentation',
    v_evidence_req
  );

  -- Question 2: Test Coverage
  v_options := '{"options": ["< 25% coverage", "25-50% coverage", "51-75% coverage", "76-90% coverage", "> 90% coverage"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Test coverage"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "test_coverage_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'What is the test coverage?',
    'Evaluate comprehensiveness of testing',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide test coverage analysis',
    v_evidence_req
  );

  -- Question 3: Test Types
  v_options := '{"options": ["Basic tests only", "Limited variety", "Multiple types", "Comprehensive", "Advanced testing"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Test types"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "test_types_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'What types of tests are performed?',
    'Assess variety and complexity of testing',
    'multi_choice',
    v_options,
    20,
    3,
    v_standard_ref,
    true,
    'Provide test type documentation',
    v_evidence_req
  );

  -- Question 4: Test Results
  v_options := '{"options": ["Not documented", "Partially documented", "Mostly documented", "Fully documented", "Comprehensively documented"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Test results"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "test_results_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How well are test results documented?',
    'Evaluate test result documentation and analysis',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide test result documentation',
    v_evidence_req
  );

  -- Question 5: Maintenance Program
  v_options := '{"options": ["No maintenance", "Ad-hoc maintenance", "Regular maintenance", "Structured program", "Comprehensive program"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.5", "description": "Maintenance"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "maintenance_{date}"}'::jsonb;

  INSERT INTO gap_analysis_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_category_id,
    'How effective is the maintenance program?',
    'Assess program maintenance and update processes',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide maintenance program documentation',
    v_evidence_req
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

  IF category_count != 5 THEN
    RAISE EXCEPTION 'Expected 5 categories, found %', category_count;
  END IF;

  IF question_count != 25 THEN
    RAISE EXCEPTION 'Expected 25 questions, found %', question_count;
  END IF;
END $$;