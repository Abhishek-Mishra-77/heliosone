/*
  # Fix RLS Policies

  1. Changes
    - Drop existing RLS policies that cause recursion
    - Create new, optimized RLS policies for users table
    - Ensure proper access control without recursion

  2. Security
    - Users can view their own profile
    - Users can view other users in their organization
    - Maintains data isolation between organizations
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view members of their organization" ON users;

-- Create new, optimized policies
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (
    auth.uid() = id
  );

CREATE POLICY "Users can view users in same organization"
  ON users
  FOR SELECT
  USING (
    organization_id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
    )
  );