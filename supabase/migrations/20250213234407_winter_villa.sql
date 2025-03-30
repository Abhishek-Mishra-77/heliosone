/*
  # Department Structure Migration

  1. New Tables (if not exist)
    - departments
    - department_users
    - department_assessments

  2. Security
    - Enable RLS
    - Add policies for access control

  3. Performance
    - Add indexes for common queries
    - Add path maintenance triggers
*/

-- Enable ltree extension if not already enabled
CREATE EXTENSION IF NOT EXISTS ltree;

-- Only create tables if they don't exist
DO $$ 
BEGIN
  -- Departments table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'departments') THEN
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

    -- Enable RLS
    ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

    -- Create indexes
    CREATE INDEX departments_path_idx ON departments USING gist (path);
    CREATE INDEX departments_parent_id_idx ON departments(parent_id);
  END IF;

  -- Department Users mapping
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'department_users') THEN
    CREATE TABLE department_users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      department_id uuid REFERENCES departments NOT NULL,
      user_id uuid REFERENCES users NOT NULL,
      role text NOT NULL CHECK (role IN ('department_admin', 'assessor', 'viewer')),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE (department_id, user_id)
    );

    -- Enable RLS
    ALTER TABLE department_users ENABLE ROW LEVEL SECURITY;

    -- Create index
    CREATE INDEX department_users_user_id_idx ON department_users(user_id);
  END IF;

  -- Department Assessments
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'department_assessments') THEN
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
    ALTER TABLE department_assessments ENABLE ROW LEVEL SECURITY;

    -- Create index
    CREATE INDEX department_assessments_department_id_idx ON department_assessments(department_id);
  END IF;
END $$;

-- Create or replace the path maintenance function
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

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS department_path_trigger ON departments;
CREATE TRIGGER department_path_trigger
  BEFORE INSERT OR UPDATE OF parent_id ON departments
  FOR EACH ROW EXECUTE FUNCTION update_department_path();

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Departments policies
  DROP POLICY IF EXISTS "users_can_view_their_departments" ON departments;
  DROP POLICY IF EXISTS "users_can_view_department_members" ON department_users;
  DROP POLICY IF EXISTS "users_can_view_department_assessments" ON department_assessments;
  DROP POLICY IF EXISTS "department_admins_can_create_assessments" ON department_assessments;
END $$;

-- Create new policies
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