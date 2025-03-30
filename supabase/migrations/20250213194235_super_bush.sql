/*
  # Add Super Admin Support
  
  1. Changes
    - Make organization_id nullable in users table
    - Update RLS policies to handle super admins
    - Add policies for super admin access
    
  2. Security
    - Super admins can access all data
    - Regular users still restricted to their organization
*/

-- Make organization_id nullable
ALTER TABLE users 
  ALTER COLUMN organization_id DROP NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "organizations_read_own" ON organizations;
DROP POLICY IF EXISTS "assessments_read_own_org" ON bcdr_assessments;
DROP POLICY IF EXISTS "assessments_insert_managers" ON bcdr_assessments;
DROP POLICY IF EXISTS "responses_read_own_org" ON assessment_responses;

-- Updated user policies
CREATE POLICY "users_access"
  ON users
  FOR SELECT
  USING (
    -- Super admins can see all users
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    ) OR
    -- Regular users can only see users in their org
    (
      id = auth.uid() OR
      organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Updated organization policies
CREATE POLICY "organizations_access"
  ON organizations
  FOR SELECT
  USING (
    -- Super admins can see all organizations
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    ) OR
    -- Regular users can only see their organization
    id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Updated assessment policies
CREATE POLICY "assessments_access"
  ON bcdr_assessments
  FOR SELECT
  USING (
    -- Super admins can see all assessments
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    ) OR
    -- Regular users can only see their org's assessments
    organization_id = (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Updated response policies
CREATE POLICY "responses_access"
  ON assessment_responses
  FOR SELECT
  USING (
    -- Super admins can see all responses
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
    ) OR
    -- Regular users can only see their org's responses
    assessment_id IN (
      SELECT id FROM bcdr_assessments
      WHERE organization_id = (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );