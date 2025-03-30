/*
  # Add publishing support for department questionnaires

  1. Changes
    - Add published status to questionnaire templates
    - Add published_at timestamp
    - Add published_by user reference
    - Add department assignments table for published questionnaires
*/

-- Add publishing fields to templates
ALTER TABLE department_questionnaire_templates
ADD COLUMN published boolean NOT NULL DEFAULT false,
ADD COLUMN published_at timestamptz,
ADD COLUMN published_by uuid REFERENCES users;

-- Create department questionnaire assignments
CREATE TABLE department_questionnaire_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES department_questionnaire_templates NOT NULL,
  department_id uuid REFERENCES departments NOT NULL,
  assigned_by uuid REFERENCES users NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')),
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (template_id, department_id)
);

-- Enable RLS
ALTER TABLE department_questionnaire_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "allow_view_assignments"
  ON department_questionnaire_assignments
  FOR SELECT
  USING (
    -- Department members can view their assignments
    EXISTS (
      SELECT 1 FROM department_users du
      WHERE du.department_id = department_questionnaire_assignments.department_id
      AND du.user_id = auth.uid()
    ) OR
    -- Admins can view all assignments
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

CREATE POLICY "allow_admins_manage_assignments"
  ON department_questionnaire_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

-- Create indexes
CREATE INDEX department_questionnaire_assignments_template_id_idx 
  ON department_questionnaire_assignments(template_id);
CREATE INDEX department_questionnaire_assignments_department_id_idx 
  ON department_questionnaire_assignments(department_id);

-- Add update trigger
CREATE TRIGGER update_department_questionnaire_assignments_updated_at
  BEFORE UPDATE ON department_questionnaire_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();