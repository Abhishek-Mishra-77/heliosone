/*
  # Remove Self-Assessment Maturity Questions

  1. Changes
    - Remove questions that ask customers to self-assess their maturity level
    - Keep only objective assessment questions
    - Clean up any orphaned responses

  2. Security
    - No changes to RLS policies
*/

DO $$ 
BEGIN
  -- First, delete any responses to self-assessment questions
  DELETE FROM maturity_assessment_responses
  WHERE question_id IN (
    SELECT id 
    FROM maturity_assessment_questions
    WHERE question ILIKE '%maturity level%'
    OR question ILIKE '%rate your%'
    OR question ILIKE '%assess your%'
    OR question ILIKE '%how mature%'
    OR description ILIKE '%self-assessment%'
  );

  -- Then delete the self-assessment questions
  DELETE FROM maturity_assessment_questions
  WHERE question ILIKE '%maturity level%'
  OR question ILIKE '%rate your%'
  OR question ILIKE '%assess your%'
  OR question ILIKE '%how mature%'
  OR description ILIKE '%self-assessment%';

  -- Update order_index for remaining questions in each category
  UPDATE maturity_assessment_questions q
  SET order_index = new_order.new_index
  FROM (
    SELECT 
      id,
      category_id,
      ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY maturity_level, order_index) - 1 as new_index
    FROM maturity_assessment_questions
  ) new_order
  WHERE q.id = new_order.id;
END $$;