-- Drop trigger first to remove dependency
DROP TRIGGER IF EXISTS auto_assign_questionnaires_trigger ON departments CASCADE;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS auto_assign_questionnaires() CASCADE;

-- Create improved auto-assign function that properly handles the assigned_by field
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
    auth.uid(), -- Use the current user as the assigner
    'pending',
    (CURRENT_DATE + INTERVAL '30 days')::timestamptz
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER auto_assign_questionnaires_trigger
  AFTER INSERT OR UPDATE OF department_type ON departments
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_questionnaires();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION auto_assign_questionnaires() TO authenticated;

-- Add policy for assignments to ensure proper access
DROP POLICY IF EXISTS "allow_view_assignments" ON department_questionnaire_assignments;
DROP POLICY IF EXISTS "allow_manage_assignments" ON department_questionnaire_assignments;

CREATE POLICY "allow_view_assignments"
  ON department_questionnaire_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM departments d
      WHERE d.id = department_questionnaire_assignments.department_id
      AND d.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_manage_assignments"
  ON department_questionnaire_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM departments d
      JOIN users u ON u.organization_id = d.organization_id
      WHERE d.id = department_questionnaire_assignments.department_id
      AND u.id = auth.uid()
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM departments d
      JOIN users u ON u.organization_id = d.organization_id
      WHERE d.id = department_questionnaire_assignments.department_id
      AND u.id = auth.uid()
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );