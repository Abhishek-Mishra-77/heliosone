/*
  # Add automatic questionnaire assignment

  1. Changes
    - Add department_type to departments table
    - Add trigger to automatically assign questionnaires
    - Remove manual publishing fields
*/

-- Add department_type to departments
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS department_type text CHECK (department_type IN ('department', 'business_unit', 'team', 'division'));

-- Remove publishing fields from templates
ALTER TABLE department_questionnaire_templates
DROP COLUMN IF EXISTS published,
DROP COLUMN IF EXISTS published_at,
DROP COLUMN IF EXISTS published_by;

-- Create function to automatically assign questionnaires
CREATE OR REPLACE FUNCTION auto_assign_questionnaires()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new department is created or department_type is updated
  -- Find matching questionnaire templates and create assignments
  INSERT INTO department_questionnaire_assignments (
    template_id,
    department_id,
    assigned_by,
    status,
    due_date
  )
  SELECT 
    t.id,
    NEW.id,
    (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1), -- Default to super admin
    'pending',
    (CURRENT_DATE + INTERVAL '30 days')::timestamptz -- Default 30 day deadline
  FROM department_questionnaire_templates t
  WHERE t.department_type = NEW.department_type
  AND t.is_active = true
  AND NOT EXISTS (
    -- Avoid duplicate assignments
    SELECT 1 FROM department_questionnaire_assignments a
    WHERE a.template_id = t.id
    AND a.department_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic assignment
DROP TRIGGER IF EXISTS auto_assign_questionnaires_trigger ON departments;
CREATE TRIGGER auto_assign_questionnaires_trigger
  AFTER INSERT OR UPDATE OF department_type ON departments
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_questionnaires();