-- Delete all resiliency scoring data and related records
DELETE FROM assessment_responses
WHERE question_id IN (
  SELECT id FROM assessment_questions
  WHERE category_id IN (
    SELECT id FROM assessment_categories 
    WHERE assessment_type = 'resiliency'
  )
);

DELETE FROM assessment_questions
WHERE category_id IN (
  SELECT id FROM assessment_categories 
  WHERE assessment_type = 'resiliency'
);

DELETE FROM assessment_categories 
WHERE assessment_type = 'resiliency';

-- Delete any resiliency assessments
DELETE FROM bcdr_assessments
WHERE assessment_type = 'resiliency';