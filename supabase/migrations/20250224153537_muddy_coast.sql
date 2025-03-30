-- Create a table to track special platform admin exceptions
CREATE TABLE platform_admin_exceptions (
  id uuid PRIMARY KEY REFERENCES platform_admins(id),
  email text NOT NULL UNIQUE,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE platform_admin_exceptions ENABLE ROW LEVEL SECURITY;

-- Only platform admins can view exceptions
CREATE POLICY "platform_admins_can_view_exceptions"
  ON platform_admin_exceptions
  FOR SELECT
  USING (
    auth.uid() IN (SELECT id FROM platform_admins)
  );

-- Add your current admin account as an exception
INSERT INTO platform_admin_exceptions (id, email, reason, created_by)
SELECT 
  pa.id,
  pa.email,
  'Initial platform administrator account',
  'System Migration'
FROM platform_admins pa
WHERE pa.email NOT LIKE '%@helios.com'
ON CONFLICT DO NOTHING;

-- Create a function to check if an email is allowed for platform admin
CREATE OR REPLACE FUNCTION is_valid_platform_admin_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    -- Either the email ends with @helios.com
    email LIKE '%@helios.com'
    OR
    -- Or it's in the exceptions table
    EXISTS (
      SELECT 1 FROM platform_admin_exceptions
      WHERE platform_admin_exceptions.email = is_valid_platform_admin_email.email
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_valid_platform_admin_email(text) TO authenticated;

-- Add trigger to enforce email domain restriction for new platform admins
CREATE OR REPLACE FUNCTION enforce_platform_admin_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT is_valid_platform_admin_email(NEW.email) THEN
    RAISE EXCEPTION 'Platform admin email must be @helios.com or have an approved exception';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER enforce_platform_admin_email_trigger
  BEFORE INSERT OR UPDATE ON platform_admins
  FOR EACH ROW
  EXECUTE FUNCTION enforce_platform_admin_email();

-- Create view for platform admin management
CREATE OR REPLACE VIEW platform_admin_details AS
SELECT 
  pa.id,
  pa.email,
  pa.full_name,
  pa.created_at,
  pae.reason as exception_reason,
  CASE 
    WHEN pa.email LIKE '%@helios.com' THEN false
    ELSE true
  END as is_exception
FROM platform_admins pa
LEFT JOIN platform_admin_exceptions pae ON pae.id = pa.id;

-- Grant access to the view
GRANT SELECT ON platform_admin_details TO authenticated;