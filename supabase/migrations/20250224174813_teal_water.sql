-- First, let's clean up any incorrect assignments more thoroughly
DO $$
DECLARE
  dept_type text;
  template_type text;
BEGIN
  -- 1. Expire all assignments for departments where the user is not assigned
  UPDATE department_questionnaire_assignments dqa
  SET status = 'expired'
  WHERE EXISTS (
    SELECT 1 FROM departments d
    WHERE d.id = dqa.department_id
    AND NOT EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = d.id
      AND du.user_id = 'b06059d8-5613-4a38-a136-62533999193c'
    )
  );

  -- 2. For each department, get its type and expire assignments with mismatched templates
  FOR dept_type, template_type IN
    SELECT d.department_type, t.department_type
    FROM department_questionnaire_assignments dqa
    JOIN departments d ON d.id = dqa.department_id
    JOIN department_questionnaire_templates t ON t.id = dqa.template_id
    WHERE dqa.status != 'expired'
  LOOP
    IF dept_type != template_type THEN
      UPDATE department_questionnaire_assignments dqa
      SET status = 'expired'
      WHERE EXISTS (
        SELECT 1 FROM departments d
        JOIN department_questionnaire_templates t ON t.id = dqa.template_id
        WHERE d.id = dqa.department_id
        AND d.department_type != t.department_type
      );
    END IF;
  END LOOP;

  -- 3. For each department/template combination, keep only the most recent active assignment
  WITH ranked_assignments AS (
    SELECT 
      id,
      department_id,
      template_id,
      ROW_NUMBER() OVER (
        PARTITION BY department_id, template_id 
        ORDER BY created_at DESC
      ) as rn
    FROM department_questionnaire_assignments
    WHERE status != 'expired'
  )
  UPDATE department_questionnaire_assignments dqa
  SET status = 'expired'
  WHERE id IN (
    SELECT id FROM ranked_assignments
    WHERE rn > 1
  );
END $$;

-- Drop existing function and create a more robust version
DROP FUNCTION IF EXISTS get_user_questionnaire_assignments(uuid);

CREATE OR REPLACE FUNCTION get_user_questionnaire_assignments(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  template_id uuid,
  department_id uuid,
  status text,
  due_date timestamptz,
  completed_at timestamptz,
  template jsonb,
  department jsonb
) AS $$
BEGIN
  RETURN QUERY
  WITH user_departments AS (
    -- Get only departments where the user is actively assigned
    SELECT DISTINCT du.department_id, d.department_type
    FROM department_users du
    JOIN departments d ON d.id = du.department_id
    WHERE du.user_id = p_user_id
  ),
  valid_assignments AS (
    -- Get only valid assignments (matching department type and template type)
    SELECT DISTINCT ON (dqa.department_id, dqa.template_id)
      dqa.id,
      dqa.template_id,
      dqa.department_id,
      dqa.status,
      dqa.due_date,
      dqa.completed_at
    FROM department_questionnaire_assignments dqa
    JOIN departments d ON d.id = dqa.department_id
    JOIN department_questionnaire_templates dqt ON dqt.id = dqa.template_id
    WHERE d.department_type = dqt.department_type
    AND dqa.status != 'expired'
    -- Only get assignments for departments the user is assigned to
    AND EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = dqa.department_id
      AND du.user_id = p_user_id
    )
    ORDER BY dqa.department_id, dqa.template_id, dqa.created_at DESC
  )
  SELECT 
    va.id,
    va.template_id,
    va.department_id,
    va.status,
    va.due_date,
    va.completed_at,
    jsonb_build_object(
      'name', dqt.name,
      'description', dqt.description,
      'department_type', dqt.department_type
    ) as template,
    jsonb_build_object(
      'name', d.name,
      'type', d.department_type
    ) as department
  FROM valid_assignments va
  JOIN departments d ON d.id = va.department_id
  JOIN department_questionnaire_templates dqt ON dqt.id = va.template_id
  -- Only include assignments for departments the user is assigned to
  JOIN user_departments ud ON ud.department_id = va.department_id
  ORDER BY va.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the auto-assign function with stricter validation
DROP FUNCTION IF EXISTS auto_assign_questionnaires() CASCADE;

CREATE OR REPLACE FUNCTION auto_assign_questionnaires()
RETURNS TRIGGER AS $$
DECLARE
  template RECORD;
BEGIN
  -- Only create assignments for templates that match the department type
  FOR template IN
    SELECT t.id, t.department_type
    FROM department_questionnaire_templates t
    WHERE t.department_type = NEW.department_type
    AND t.is_active = true
  LOOP
    -- Check if an active assignment already exists
    IF NOT EXISTS (
      SELECT 1 
      FROM department_questionnaire_assignments a
      WHERE a.department_id = NEW.id
      AND a.template_id = template.id
      AND a.status != 'expired'
    ) THEN
      -- Create new assignment
      INSERT INTO department_questionnaire_assignments (
        template_id,
        department_id,
        assigned_by,
        status,
        due_date
      ) VALUES (
        template.id,
        NEW.id,
        auth.uid(),
        'pending',
        CURRENT_TIMESTAMP + INTERVAL '30 days'
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the auto-assign trigger
DROP TRIGGER IF EXISTS auto_assign_questionnaires_trigger ON departments;
CREATE TRIGGER auto_assign_questionnaires_trigger
  AFTER INSERT OR UPDATE OF department_type ON departments
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_questionnaires();

-- Drop existing index if it exists
DROP INDEX IF EXISTS idx_unique_active_assignments;

-- Create a new unique index for active assignments
CREATE UNIQUE INDEX idx_active_assignments_unique 
ON department_questionnaire_assignments (department_id, template_id) 
WHERE status != 'expired';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_questionnaire_assignments(uuid) TO authenticated;