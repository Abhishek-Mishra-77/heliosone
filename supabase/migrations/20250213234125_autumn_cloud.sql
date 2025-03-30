/*
  # Department and Team Structure

  1. New Tables
    - departments
      - Stores department/team/BU information
      - Links to organization
      - Tracks hierarchy (parent-child relationship)
    - department_users
      - Maps users to departments
      - Supports users belonging to multiple departments
    - department_assessments
      - Links assessments to specific departments
      - Enables department-specific scoring

  2. Security
    - RLS policies for department-based access
    - Hierarchical access control
*/

-- Enable ltree extension if not already enabled
CREATE EXTENSION IF NOT EXISTS ltree;

-- Departments table
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations NOT NULL,
  name text NOT NULL,
  code text,
  parent_id uuid REFERENCES departments(id),
  description text,
  type text CHECK (type IN ('department', 'business_unit', 'team', 'division')),
  level integer NOT NULL DEFAULT 0,
  path ltree,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, code)
);

-- Department Users mapping
CREATE TABLE department_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid REFERENCES departments NOT NULL,
  user_id uuid REFERENCES users NOT NULL,
  role text NOT NULL CHECK (role IN ('department_admin', 'assessor', 'viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (department_id, user_id)
);

-- Department Assessments
CREATE TABLE department_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES bcdr_assessments NOT NULL,
  department_id uuid REFERENCES departments NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
  score numeric CHECK (score >= 0 AND score <= 100),
  reviewer_id uuid REFERENCES users,
  review_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (assessment_id, department_id)
);

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_assessments ENABLE ROW LEVEL SECURITY;

-- Department access policies
CREATE POLICY "users_can_view_their_departments" ON departments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM department_users
      WHERE department_users.department_id = departments.id
      AND department_users.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = departments.organization_id
      AND users.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

-- Department users access policies
CREATE POLICY "users_can_view_department_members" ON department_users
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM department_users
      WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

-- Department assessment access policies
CREATE POLICY "users_can_view_department_assessments" ON department_assessments
  FOR SELECT USING (
    department_id IN (
      SELECT department_id FROM department_users
      WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

-- Department assessment creation policy
CREATE POLICY "department_admins_can_create_assessments" ON department_assessments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM department_users
      WHERE department_users.department_id = department_assessments.department_id
      AND department_users.user_id = auth.uid()
      AND department_users.role = 'department_admin'
    ) OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

-- Add triggers for path maintenance
CREATE OR REPLACE FUNCTION update_department_path() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path = text2ltree(NEW.id::text);
    NEW.level = 0;
  ELSE
    SELECT path || text2ltree(NEW.id::text), level + 1
    INTO NEW.path, NEW.level
    FROM departments
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER department_path_trigger
  BEFORE INSERT OR UPDATE OF parent_id ON departments
  FOR EACH ROW EXECUTE FUNCTION update_department_path();

-- Add indexes for performance
CREATE INDEX departments_path_idx ON departments USING gist (path);
CREATE INDEX departments_parent_id_idx ON departments(parent_id);
CREATE INDEX department_users_user_id_idx ON department_users(user_id);
CREATE INDEX department_assessments_department_id_idx ON department_assessments(department_id);