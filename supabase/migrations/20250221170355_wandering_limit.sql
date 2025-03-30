-- Add unassigned users tracking
CREATE TABLE IF NOT EXISTS unassigned_users (
  id uuid PRIMARY KEY REFERENCES users(id),
  organization_id uuid REFERENCES organizations(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE unassigned_users ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS unassigned_users_organization_id_idx ON unassigned_users(organization_id);

-- Add RLS policies
CREATE POLICY "allow_view_unassigned_users"
  ON unassigned_users
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

CREATE POLICY "allow_manage_unassigned_users"
  ON unassigned_users
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    ) OR
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Create trigger function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Add new users to unassigned_users if they're not platform admins
  IF NOT EXISTS (SELECT 1 FROM platform_admins WHERE id = NEW.id) THEN
    INSERT INTO unassigned_users (id, organization_id)
    VALUES (NEW.id, NEW.organization_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to handle department assignments
CREATE OR REPLACE FUNCTION handle_department_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove user from unassigned_users when assigned to a department
  DELETE FROM unassigned_users WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to handle department removals
CREATE OR REPLACE FUNCTION handle_department_removal()
RETURNS TRIGGER AS $$
BEGIN
  -- If this was their last department assignment, add them back to unassigned_users
  IF NOT EXISTS (
    SELECT 1 FROM department_users 
    WHERE user_id = OLD.user_id 
    AND department_id != OLD.department_id
  ) THEN
    INSERT INTO unassigned_users (id, organization_id)
    SELECT id, organization_id
    FROM users
    WHERE id = OLD.user_id
    AND NOT EXISTS (SELECT 1 FROM platform_admins WHERE id = OLD.user_id);
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER handle_new_user_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER handle_department_assignment_trigger
  AFTER INSERT ON department_users
  FOR EACH ROW
  EXECUTE FUNCTION handle_department_assignment();

CREATE TRIGGER handle_department_removal_trigger
  AFTER DELETE ON department_users
  FOR EACH ROW
  EXECUTE FUNCTION handle_department_removal();

-- Create function to get unassigned users for an organization
CREATE OR REPLACE FUNCTION get_unassigned_users(org_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  role text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.email,
    u.role,
    u.created_at
  FROM users u
  JOIN unassigned_users uu ON uu.id = u.id
  WHERE u.organization_id = org_id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_unassigned_users(uuid) TO authenticated;

-- Add any existing unassigned users to the table
INSERT INTO unassigned_users (id, organization_id)
SELECT u.id, u.organization_id
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM department_users du WHERE du.user_id = u.id
)
AND NOT EXISTS (
  SELECT 1 FROM platform_admins pa WHERE pa.id = u.id
)
ON CONFLICT DO NOTHING;