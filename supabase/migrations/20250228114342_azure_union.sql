-- First, get the category IDs
DO $$ 
DECLARE
  v_plan_dev_id uuid;
  v_training_id uuid;
  v_recovery_id uuid;
  v_standard_ref jsonb;
  v_evidence_req jsonb;
  v_options jsonb;
BEGIN
  -- Get category IDs
  SELECT id INTO v_plan_dev_id FROM resiliency_categories WHERE name = 'Plan Development';
  SELECT id INTO v_training_id FROM resiliency_categories WHERE name = 'Training and Awareness';
  SELECT id INTO v_recovery_id FROM resiliency_categories WHERE name = 'Recovery Strategy';

  -- Plan Development Questions
  -- Question 1: Plan Templates
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Plan templates and standardization"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "plan_template_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_plan_dev_id,
    'Do you have standardized plan templates?',
    'Assess the standardization of BC/DR plan documentation',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide BC/DR plan templates and documentation standards',
    v_evidence_req
  );

  -- Question 2: Plan Review Frequency
  v_options := '{"options": ["Never", "Every 2+ years", "Annually", "Semi-annually", "Quarterly"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Plan maintenance"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "plan_review_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_plan_dev_id,
    'How often are BC/DR plans reviewed?',
    'Evaluate the frequency of plan reviews and updates',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide plan review schedule and history',
    v_evidence_req
  );

  -- Question 3: Plan Distribution
  v_options := '{"options": ["No distribution", "Email only", "Shared drive", "Document system", "Automated distribution"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Plan distribution"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "plan_distribution_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_plan_dev_id,
    'How are BC/DR plans distributed?',
    'Assess the plan distribution and access management process',
    'multi_choice',
    v_options,
    20,
    3,
    v_standard_ref,
    true,
    'Provide plan distribution procedures and access controls',
    v_evidence_req
  );

  -- Question 4: Version Control
  v_options := '{"options": ["No version control", "Basic control", "Document management", "Change management", "Automated system"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Document control"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "version_control_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_plan_dev_id,
    'How do you manage plan versions?',
    'Evaluate version control and document management practices',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide version control procedures and examples',
    v_evidence_req
  );

  -- Question 5: Plan Integration
  v_options := '{"options": ["No integration", "Limited", "Partial", "Extensive", "Full integration"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.4.4", "description": "Plan integration"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "vsd"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "plan_integration_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_plan_dev_id,
    'How well are plans integrated with other procedures?',
    'Assess integration with incident management and other operational procedures',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide documentation showing plan integration',
    v_evidence_req
  );

  -- Training and Awareness Questions
  -- Question 1: Training Program
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.2", "description": "Training program"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "training_program_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_training_id,
    'Do you have a formal BCDR training program?',
    'Assess the structure and comprehensiveness of the training program',
    'boolean',
    NULL,
    20,
    1,
    v_standard_ref,
    true,
    'Provide training program documentation',
    v_evidence_req
  );

  -- Question 2: Training Methods
  v_options := '{"options": ["Self-study only", "Classroom only", "Online only", "Mixed methods", "Comprehensive approach"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.2", "description": "Training delivery"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "ppt", "pptx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "training_materials_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_training_id,
    'What training delivery methods are used?',
    'Evaluate the variety and effectiveness of training delivery methods',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide examples of training materials and delivery methods',
    v_evidence_req
  );

  -- Question 3: Training Frequency
  v_options := '{"options": ["One-time only", "Upon request", "Annually", "Semi-annually", "Quarterly"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.2", "description": "Training frequency"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 2, "naming_convention": "training_schedule_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_training_id,
    'How often is BCDR training conducted?',
    'Assess the frequency and regularity of training activities',
    'multi_choice',
    v_options,
    20,
    3,
    v_standard_ref,
    true,
    'Provide training schedule and completion records',
    v_evidence_req
  );

  -- Question 4: Training Coverage
  v_options := '{"options": ["< 25% staff", "25-50% staff", "51-75% staff", "76-90% staff", "> 90% staff"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.2", "description": "Training coverage"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "training_coverage_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_training_id,
    'What percentage of staff receive BCDR training?',
    'Evaluate the reach and coverage of training program',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide training completion statistics',
    v_evidence_req
  );

  -- Question 5: Training Effectiveness
  v_options := '{"options": ["No measurement", "Feedback forms", "Knowledge tests", "Performance metrics", "Multiple methods"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "7.2", "description": "Training effectiveness"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "training_effectiveness_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_training_id,
    'How do you measure training effectiveness?',
    'Assess methods for evaluating training impact and retention',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide training effectiveness metrics and analysis',
    v_evidence_req
  );

  -- Recovery Strategy Questions
  -- Question 1: Strategy Documentation
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3.2", "description": "Recovery strategies"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_strategy_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_recovery_id,
    'Are recovery strategies formally documented?',
    'Assess the documentation of recovery strategies and options',
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
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3.2", "description": "Strategy options"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "vsd"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "recovery_options_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_recovery_id,
    'How many recovery strategy options exist?',
    'Evaluate the range and flexibility of recovery strategies',
    'multi_choice',
    v_options,
    20,
    2,
    v_standard_ref,
    true,
    'Provide documentation of recovery strategy options',
    v_evidence_req
  );

  -- Question 3: Strategy Testing
  v_options := '{"options": ["Never tested", "Partially tested", "Regularly tested", "Fully validated", "Continuously validated"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3.2", "description": "Strategy validation"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 5, "naming_convention": "strategy_testing_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_recovery_id,
    'How thoroughly are recovery strategies tested?',
    'Assess the validation of recovery strategy effectiveness',
    'multi_choice',
    v_options,
    20,
    3,
    v_standard_ref,
    true,
    'Provide strategy testing results and validation evidence',
    v_evidence_req
  );

  -- Question 4: Resource Requirements
  v_options := '{"options": ["Not documented", "Partially documented", "Mostly documented", "Fully documented", "Continuously updated"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3.2", "description": "Resource requirements"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "resource_requirements_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_recovery_id,
    'How well are recovery resource requirements documented?',
    'Evaluate documentation of resources needed for recovery',
    'multi_choice',
    v_options,
    20,
    4,
    v_standard_ref,
    true,
    'Provide resource requirement documentation',
    v_evidence_req
  );

  -- Question 5: Strategy Review
  v_options := '{"options": ["Never reviewed", "Ad-hoc review", "Annual review", "Regular review", "Continuous review"]}'::jsonb;
  v_standard_ref := '{"name": "ISO 22301:2019", "clause": "8.3.2", "description": "Strategy review"}'::jsonb;
  v_evidence_req := '{"required_files": ["pdf", "doc", "docx", "xls", "xlsx"], "max_size_mb": 10, "min_files": 1, "max_files": 3, "naming_convention": "strategy_review_{date}"}'::jsonb;

  INSERT INTO resiliency_questions (
    category_id, question, description, type, options, weight, order_index,
    standard_reference, evidence_required, evidence_description, evidence_requirements
  ) VALUES (
    v_recovery_id,
    'How often are recovery strategies reviewed?',
    'Assess the frequency of strategy review and updates',
    'multi_choice',
    v_options,
    20,
    5,
    v_standard_ref,
    true,
    'Provide strategy review history and documentation',
    v_evidence_req
  );

END $$;

-- Verify the data
DO $$
DECLARE
  plan_count integer;
  training_count integer;
  recovery_count integer;
BEGIN
  SELECT COUNT(*) INTO plan_count
  FROM resiliency_questions q
  JOIN resiliency_categories c ON c.id = q.category_id
  WHERE c.name = 'Plan Development';

  SELECT COUNT(*) INTO training_count
  FROM resiliency_questions q
  JOIN resiliency_categories c ON c.id = q.category_id
  WHERE c.name = 'Training and Awareness';

  SELECT COUNT(*) INTO recovery_count
  FROM resiliency_questions q
  JOIN resiliency_categories c ON c.id = q.category_id
  WHERE c.name = 'Recovery Strategy';

  RAISE NOTICE 'Found % Plan Development questions', plan_count;
  RAISE NOTICE 'Found % Training and Awareness questions', training_count;
  RAISE NOTICE 'Found % Recovery Strategy questions', recovery_count;

  IF plan_count != 5 OR training_count != 5 OR recovery_count != 5 THEN
    RAISE EXCEPTION 'Expected 5 questions in each category';
  END IF;
END $$;