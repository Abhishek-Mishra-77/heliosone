/*
  # Initial Helios BCDR Platform Schema

  1. New Tables
    - `organizations` - Multi-tenant organization data
      - `id` (uuid, primary key)
      - `name` (text)
      - `industry` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `users` - User profiles with role-based access
      - `id` (uuid, primary key, links to auth.users)
      - `organization_id` (uuid, foreign key)
      - `role` (text) - BCDR Manager, Admin, Department Head, User
      - `full_name` (text)
      - `department` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bcdr_assessments` - Resiliency assessments
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key)
      - `created_by` (uuid, foreign key)
      - `status` (text)
      - `score` (numeric)
      - `assessment_date` (timestamp)
      - `next_review_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `assessment_responses` - Detailed assessment answers
      - `id` (uuid, primary key)
      - `assessment_id` (uuid, foreign key)
      - `question_id` (uuid)
      - `response` (jsonb)
      - `score` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Policies for organization-based isolation
    - Role-based access control policies
*/

-- Organizations table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Users table extending auth.users
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  organization_id uuid REFERENCES organizations,
  role text NOT NULL CHECK (role IN ('super_admin', 'bcdr_manager', 'admin', 'department_head', 'user')),
  full_name text,
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- BCDR Assessments table
CREATE TABLE bcdr_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations NOT NULL,
  created_by uuid REFERENCES users NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  score numeric CHECK (score >= 0 AND score <= 100),
  assessment_date timestamptz NOT NULL DEFAULT now(),
  next_review_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bcdr_assessments ENABLE ROW LEVEL SECURITY;

-- Assessment Responses table
CREATE TABLE assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES bcdr_assessments NOT NULL,
  question_id uuid NOT NULL,
  response jsonb NOT NULL,
  score numeric CHECK (score >= 0 AND score <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Organizations policies
CREATE POLICY "Users can view their organization"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- Users policies
CREATE POLICY "Users can view members of their organization"
  ON users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

-- BCDR Assessments policies
CREATE POLICY "Users can view assessments of their organization"
  ON bcdr_assessments
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE users.id = auth.uid()
    )
  );

CREATE POLICY "BCDR Managers and Admins can create assessments"
  ON bcdr_assessments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM users 
      WHERE users.id = auth.uid() 
      AND organization_id = bcdr_assessments.organization_id
      AND role IN ('super_admin', 'bcdr_manager', 'admin')
    )
  );

-- Assessment Responses policies
CREATE POLICY "Users can view responses of their organization's assessments"
  ON assessment_responses
  FOR SELECT
  USING (
    assessment_id IN (
      SELECT id 
      FROM bcdr_assessments 
      WHERE organization_id IN (
        SELECT organization_id 
        FROM users 
        WHERE users.id = auth.uid()
      )
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bcdr_assessments_updated_at
  BEFORE UPDATE ON bcdr_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_assessment_responses_updated_at
  BEFORE UPDATE ON assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();