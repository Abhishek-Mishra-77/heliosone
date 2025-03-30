/*
  # Fix Department Question Responses Relationships

  1. Changes
    - Add missing foreign key relationship between department_question_responses and department_questions
    - Add missing indexes for performance optimization
    - Handle existing constraints safely

  2. Security
    - Maintain existing RLS policies
*/

-- Safely check and create foreign key relationship for question_id
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'department_question_responses_question_id_fkey'
  ) THEN
    ALTER TABLE department_question_responses
    ADD CONSTRAINT department_question_responses_question_id_fkey 
    FOREIGN KEY (question_id) REFERENCES department_questions(id);
  END IF;
END $$;

-- Add indexes for better query performance if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_dept_question_responses_question_id'
  ) THEN
    CREATE INDEX idx_dept_question_responses_question_id 
    ON department_question_responses(question_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_dept_question_responses_assessment_id'
  ) THEN
    CREATE INDEX idx_dept_question_responses_assessment_id
    ON department_question_responses(department_assessment_id);
  END IF;
END $$;