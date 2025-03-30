/*
  # Remove Duplicate Risk Management Category

  1. Changes
    - Remove duplicate Risk Management category that has no questions
    - No impact on existing questions or data

  2. Security
    - No changes to RLS policies
*/

DO $$ 
DECLARE
  duplicate_risk_id uuid;
BEGIN
  -- Get the ID of the duplicate Risk Management category (the one with no questions)
  SELECT id INTO duplicate_risk_id
  FROM maturity_assessment_categories mac
  WHERE name = 'Risk Management'
  AND (
    SELECT COUNT(*) 
    FROM maturity_assessment_questions 
    WHERE category_id = mac.id
  ) = 1;

  -- Delete the category if found
  IF duplicate_risk_id IS NOT NULL THEN
    DELETE FROM maturity_assessment_categories
    WHERE id = duplicate_risk_id;

    -- Update order_index for remaining categories
    UPDATE maturity_assessment_categories
    SET order_index = new_order.new_index
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY order_index) - 1 as new_index
      FROM maturity_assessment_categories
    ) new_order
    WHERE maturity_assessment_categories.id = new_order.id;
  END IF;
END $$;