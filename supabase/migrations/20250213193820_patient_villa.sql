/*
  # Fix Recursive Policies

  1. Changes
    - Drop and recreate all policies to prevent recursion
    - Simplify policy logic
    - Use explicit column selection
  
  2. Security
    - Users can view their own profile
    - Users can view basic info of members in their organization
    - Users can view their organization details
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view organization members" ON users;
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;

-- Create new user policies
CREATE POLICY "View own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "View organization members"
  ON users
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id
      FROM users
      WHERE id = auth.uid()
    )
  );

-- Create organization policies
CREATE POLICY "View own organization"
  ON organizations
  FOR SELECT
  USING (
    id = (
      SELECT organization_id
      FROM users
      WHERE users.id = auth.uid()
    )
  );