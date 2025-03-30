/*
  # Create user invitations table

  1. New Tables
    - `user_invitations`
      - `id` (uuid, primary key)
      - `email` (text, not null)
      - `role` (text, not null)
      - `organization_id` (uuid, references organizations)
      - `full_name` (text)
      - `status` (text, not null)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `accepted_at` (timestamptz)

  2. Security
    - Enable RLS on `user_invitations` table
    - Add policies for platform admins and organization admins
*/

-- Create user invitations table
CREATE TABLE user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'bcdr_manager', 'admin', 'department_head', 'user')),
  organization_id uuid REFERENCES organizations,
  full_name text,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  UNIQUE(email, organization_id, status)
);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Platform admin policy
CREATE POLICY "platform_admins_full_access" ON user_invitations
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Organization admin policy for viewing invitations
CREATE POLICY "org_admins_view_invitations" ON user_invitations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE organization_id = user_invitations.organization_id 
      AND role IN ('admin', 'bcdr_manager')
    )
  );

-- Organization admin policy for creating invitations
CREATE POLICY "org_admins_create_invitations" ON user_invitations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users 
      WHERE organization_id = user_invitations.organization_id 
      AND role IN ('admin', 'bcdr_manager')
    )
  );

-- Add trigger to automatically expire invitations
CREATE OR REPLACE FUNCTION check_invitation_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() AND NEW.status = 'pending' THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invitation_expiry_check
  BEFORE INSERT OR UPDATE ON user_invitations
  FOR EACH ROW
  EXECUTE FUNCTION check_invitation_expiry();