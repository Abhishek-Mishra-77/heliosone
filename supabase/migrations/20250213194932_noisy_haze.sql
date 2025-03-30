/*
  # Set up Helios Admin Structure
  
  1. Changes
    - Create a separate table for Helios platform admins
    - Set up proper RLS policies for platform-level access
    - Create initial super admin user
    
  2. Security
    - Strict RLS policies for platform admin access
    - Separate concerns between platform and organization management
*/

-- Create a table for platform (Helios) admins
CREATE TABLE platform_admins (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text NOT NULL UNIQUE,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy for platform admins
CREATE POLICY "platform_admins_can_read"
  ON platform_admins
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Insert the initial super admin
INSERT INTO platform_admins (id, email, full_name)
VALUES (
  '6ab7261d-1fad-4a20-9b2f-e593916af8c7',  -- Replace with your actual auth.user id
  'admin@helios.com',
  'Helios Admin'
) ON CONFLICT (id) DO NOTHING;

-- Update users table policies
CREATE POLICY "platform_admins_full_access"
  ON users
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Update organizations table policies
CREATE POLICY "platform_admins_full_access"
  ON organizations
  FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM platform_admins)
  );