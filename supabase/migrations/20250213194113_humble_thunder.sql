/*
  # Fix recursive RLS policies

  1. Changes
    - Remove recursive policies that were causing infinite loops
    - Simplify user and organization policies
    - Add direct auth.uid() checks where possible
    - Remove unnecessary joins and subqueries

  2. Security
    - Maintain security by ensuring users can only access their own data
    - Ensure organization-level access control
*/

-- Drop existing policies
DROP POLICY IF EXISTS "View own profile" ON users;
DROP POLICY IF EXISTS "View organization members" ON users;
DROP POLICY IF EXISTS "View own organization" ON organizations;
DROP POLICY IF EXISTS "Users can view assessments" ON bcdr_assessments;
DROP POLICY IF EXISTS "Managers can create assessments" ON bcdr_assessments;
DROP POLICY IF EXISTS "Users can view assessment responses" ON assessment_responses;

-- Simple user policies
CREATE POLICY "users_read_own"
  ON users
  FOR SELECT
  USING (
    id = auth.uid() OR
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Simple organization policies
CREATE POLICY "organizations_read_own"
  ON organizations
  FOR SELECT
  USING (
    id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Simple assessment policies
CREATE POLICY "assessments_read_own_org"
  ON bcdr_assessments
  FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "assessments_insert_managers"
  ON bcdr_assessments
  FOR INSERT
  WITH CHECK (
    organization_id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super_admin', 'bcdr_manager', 'admin')
    )
  );

-- Simple response policies
CREATE POLICY "responses_read_own_org"
  ON assessment_responses
  FOR SELECT
  USING (
    assessment_id IN (
      SELECT id 
      FROM bcdr_assessments 
      WHERE organization_id = (
        SELECT organization_id 
        FROM users 
        WHERE id = auth.uid()
      )
    )
  );