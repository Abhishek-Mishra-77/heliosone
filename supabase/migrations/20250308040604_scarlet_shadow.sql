/*
  # Update Maturity Assessment Categories

  1. Changes
    - Remove duplicate Business Impact Analysis category
    - Remove Recovery Capabilities category with single question
    - Update remaining categories' order_index values

  2. Security
    - No changes to RLS policies
*/

-- First, find and store the IDs of categories to be removed
DO $$ 
DECLARE
  duplicate_bia_id uuid;
  recovery_capabilities_id uuid;
BEGIN
  -- Get the ID of the duplicate BIA category (the one with no or fewer questions)
  SELECT id INTO duplicate_bia_id
  FROM maturity_assessment_categories mac
  WHERE name = 'Business Impact Analysis'
  AND (
    SELECT COUNT(*) 
    FROM maturity_assessment_questions 
    WHERE category_id = mac.id
  ) = 0;

  -- Get the ID of the Recovery Capabilities category
  SELECT id INTO recovery_capabilities_id
  FROM maturity_assessment_categories
  WHERE name = 'Recovery Strategy';

  -- Delete questions from these categories first (if any exist)
  DELETE FROM maturity_assessment_questions
  WHERE category_id IN (duplicate_bia_id, recovery_capabilities_id);

  -- Delete the categories
  DELETE FROM maturity_assessment_categories
  WHERE id IN (duplicate_bia_id, recovery_capabilities_id);

  -- Update order_index for remaining categories
  UPDATE maturity_assessment_categories
  SET order_index = new_order.new_index
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY order_index) - 1 as new_index
    FROM maturity_assessment_categories
  ) new_order
  WHERE maturity_assessment_categories.id = new_order.id;
END $$;