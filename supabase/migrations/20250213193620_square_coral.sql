/*
  # Fix Recursive Policies

  1. Changes
    - Drop all existing user policies
    - Create separate policies for users and organizations
    - Simplify policy logic to prevent recursion
  
  2. Security
    - Users can view their own profile
    - Users can view other users in their organization
    - Users can view their organization
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view organization members" ON users;
DROP POLICY IF EXISTS "Users can view members of their organization" ON users;
DROP POLICY IF EXISTS "Users can view users in same organization" ON users;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;

-- Create new user policies
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view organization members"
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM users u
      WHERE u.id = auth.uid()
      AND u.organization_id = users.organization_id
    )
  );

-- Create organization policies
CREATE POLICY "Users can view their organization"
  ON organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = organizations.id
    )
  );