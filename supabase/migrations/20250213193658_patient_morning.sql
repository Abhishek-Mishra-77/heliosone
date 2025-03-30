/*
  # Fix Assessment Policies

  1. Changes
    - Drop existing assessment policies
    - Create simplified policies for BCDR assessments and responses
    - Use EXISTS clauses for better performance
  
  2. Security
    - Users can view assessments for their organization
    - BCDR Managers and Admins can create assessments
    - Users can view responses for assessments they have access to
*/

-- Drop existing assessment policies
DROP POLICY IF EXISTS "Users can view assessments of their organization" ON bcdr_assessments;
DROP POLICY IF EXISTS "BCDR Managers and Admins can create assessments" ON bcdr_assessments;
DROP POLICY IF EXISTS "Users can view responses of their organization's assessments" ON assessment_responses;

-- Create new assessment policies
CREATE POLICY "Users can view assessments"
  ON bcdr_assessments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = bcdr_assessments.organization_id
    )
  );

CREATE POLICY "Managers can create assessments"
  ON bcdr_assessments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = bcdr_assessments.organization_id
      AND users.role IN ('super_admin', 'bcdr_manager', 'admin')
    )
  );

-- Create new response policies
CREATE POLICY "Users can view assessment responses"
  ON assessment_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM bcdr_assessments a
      JOIN users u ON u.organization_id = a.organization_id
      WHERE u.id = auth.uid()
      AND a.id = assessment_responses.assessment_id
    )
  );