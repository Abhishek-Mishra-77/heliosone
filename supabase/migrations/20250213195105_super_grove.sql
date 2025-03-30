/*
  # Update Platform Admin Policies
  
  1. Changes
    - Add full CRUD policies for platform admins
    - Ensure platform admins can manage all aspects of the system
    
  2. Security
    - Platform admins have full access to all tables
    - Maintain existing RLS for regular users
*/

-- Add full CRUD policies for platform admins on bcdr_assessments
CREATE POLICY "platform_admins_full_access_assessments"
  ON bcdr_assessments
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Add full CRUD policies for platform admins on assessment_responses
CREATE POLICY "platform_admins_full_access_responses"
  ON assessment_responses
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM platform_admins)
  );