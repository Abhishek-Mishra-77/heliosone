-- Insert Resiliency Scoring Questions for each category

-- Incident Response Readiness Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'resiliency' AND name = 'Incident Response Readiness'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index, 
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'What is your mean time to detect (MTTD) for critical incidents?',
  'Assess the average time taken to detect critical incidents',
  'multi_choice',
  '{"options": ["< 15 minutes", "15-30 minutes", "30-60 minutes", "> 60 minutes"]}',
  20,
  1,
  '{"name": "NIST SP 800-34", "clause": "3.2.1 Detection and Analysis"}',
  true,
  'Provide incident detection metrics and monitoring dashboard screenshots'
),
(
  (SELECT id FROM cat),
  'Do you have automated incident detection systems?',
  'Evaluate the presence and effectiveness of automated detection capabilities',
  'boolean',
  NULL,
  15,
  2,
  '{"name": "ISO 22301", "clause": "8.4.3 Detection and Monitoring"}',
  true,
  'Provide documentation of automated detection systems'
),
(
  (SELECT id FROM cat),
  'What is your mean time to respond (MTTR) for critical incidents?',
  'Assess the average time taken to respond to and resolve critical incidents',
  'multi_choice',
  '{"options": ["< 30 minutes", "30-60 minutes", "1-2 hours", "> 2 hours"]}',
  20,
  3,
  '{"name": "NIST SP 800-34", "clause": "3.2.2 Incident Response"}',
  true,
  'Provide incident response metrics and reports'
);

-- Recovery Capabilities Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'resiliency' AND name = 'Recovery Capabilities'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'Are recovery procedures documented and regularly tested?',
  'Assess the documentation and testing of recovery procedures',
  'boolean',
  NULL,
  20,
  1,
  '{"name": "ISO 22301", "clause": "8.4.4 Recovery Procedures"}',
  true,
  'Provide recovery procedure documentation and test results'
),
(
  (SELECT id FROM cat),
  'What level of recovery automation do you have?',
  'Evaluate the extent of automated recovery capabilities',
  'multi_choice',
  '{"options": ["No automation", "Partial automation", "Mostly automated", "Fully automated"]}',
  15,
  2,
  '{"name": "NIST SP 800-34", "clause": "4.1 Recovery Operations"}',
  true,
  'Provide documentation of automated recovery systems'
),
(
  (SELECT id FROM cat),
  'How frequently are recovery tests conducted?',
  'Assess the frequency of recovery testing',
  'multi_choice',
  '{"options": ["Monthly", "Quarterly", "Bi-annually", "Annually", "Never"]}',
  20,
  3,
  '{"name": "ISO 22301", "clause": "8.5 Testing and Exercising"}',
  true,
  'Provide recovery test schedule and results'
);

-- Communication Readiness Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'resiliency' AND name = 'Communication Readiness'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'Do you have a documented crisis communication plan?',
  'Assess the existence and completeness of crisis communication procedures',
  'boolean',
  NULL,
  20,
  1,
  '{"name": "ISO 22301", "clause": "8.4.2 Crisis Communication"}',
  true,
  'Provide crisis communication plan documentation'
),
(
  (SELECT id FROM cat),
  'How often are communication procedures tested?',
  'Evaluate the frequency of communication procedure testing',
  'multi_choice',
  '{"options": ["Monthly", "Quarterly", "Bi-annually", "Annually", "Never"]}',
  15,
  2,
  '{"name": "NIST SP 800-34", "clause": "3.5.3 Communication Testing"}',
  true,
  'Provide communication test results and schedule'
),
(
  (SELECT id FROM cat),
  'What percentage of stakeholders are covered by your communication plan?',
  'Assess the comprehensiveness of stakeholder communication coverage',
  'scale',
  '{"min": 0, "max": 100, "step": 10, "unit": "%"}',
  20,
  3,
  '{"name": "ISO 22301", "clause": "8.4.2.2 Stakeholder Communication"}',
  true,
  'Provide stakeholder communication matrix'
);

-- Technical Resilience Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'resiliency' AND name = 'Technical Resilience'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'What is your infrastructure redundancy level?',
  'Assess the level of redundancy in critical infrastructure components',
  'multi_choice',
  '{"options": ["No redundancy", "Partial redundancy", "Full redundancy", "N+1 redundancy", "N+2 redundancy"]}',
  20,
  1,
  '{"name": "NIST SP 800-34", "clause": "4.1.1 System Redundancy"}',
  true,
  'Provide infrastructure redundancy documentation'
),
(
  (SELECT id FROM cat),
  'Do you have automated failover capabilities?',
  'Evaluate the presence and effectiveness of automated failover systems',
  'boolean',
  NULL,
  15,
  2,
  '{"name": "ISO 22301", "clause": "8.4.4 Technical Recovery"}',
  true,
  'Provide failover system documentation and test results'
),
(
  (SELECT id FROM cat),
  'What is your current system availability percentage?',
  'Assess the overall system availability',
  'scale',
  '{"min": 90, "max": 100, "step": 0.1, "unit": "%"}',
  20,
  3,
  '{"name": "NIST SP 800-34", "clause": "4.1.2 System Availability"}',
  true,
  'Provide system availability metrics and reports'
);

-- Data Protection Questions
WITH cat AS (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'resiliency' AND name = 'Data Protection'
)
INSERT INTO assessment_questions (
  category_id, question, description, type, options, weight, order_index,
  standard_reference, evidence_required, evidence_description
) VALUES
(
  (SELECT id FROM cat),
  'What is your current backup frequency?',
  'Assess how often critical data is backed up',
  'multi_choice',
  '{"options": ["Real-time", "Hourly", "Daily", "Weekly"]}',
  20,
  1,
  '{"name": "NIST SP 800-34", "clause": "3.4.2 Data Backup"}',
  true,
  'Provide backup schedule and configuration documentation'
),
(
  (SELECT id FROM cat),
  'Do you have offsite backup storage?',
  'Evaluate the geographical distribution of backup storage',
  'boolean',
  NULL,
  15,
  2,
  '{"name": "ISO 22301", "clause": "8.4.4 Data Protection"}',
  true,
  'Provide offsite backup location documentation'
),
(
  (SELECT id FROM cat),
  'How frequently are backup restoration tests performed?',
  'Assess the frequency of backup restoration testing',
  'multi_choice',
  '{"options": ["Monthly", "Quarterly", "Bi-annually", "Annually", "Never"]}',
  20,
  3,
  '{"name": "NIST SP 800-34", "clause": "3.5.2 Backup Testing"}',
  true,
  'Provide backup restoration test results'
);