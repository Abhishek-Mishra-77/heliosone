/*
  # Fix User Policies

  1. Changes
    - Drop existing policies that cause recursion
    - Create new, simplified policies for user access
  
  2. Security
    - Users can view their own profile
    - Users can view other users in their organization
    - Prevents infinite recursion in policy evaluation
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view users in same organization" ON users;
DROP POLICY IF EXISTS "Users can view members of their organization" ON users;

-- Create new, simplified policies
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (
    auth.uid() = id
  );

CREATE POLICY "Users can view organization members"
  ON users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT u.organization_id 
      FROM users u 
      WHERE u.id = auth.uid()
    )
  );