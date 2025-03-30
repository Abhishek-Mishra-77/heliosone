-- First, let's delete any existing processes
DELETE FROM business_processes;

-- Verify the organization_id column is NOT NULL
ALTER TABLE business_processes 
ALTER COLUMN organization_id SET NOT NULL;

-- Add a trigger to automatically set organization_id
CREATE OR REPLACE FUNCTION set_business_process_org_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If organization_id is not set, get it from the user's profile
  IF NEW.organization_id IS NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM users
    WHERE id = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_business_process_org_id_trigger ON business_processes;
CREATE TRIGGER set_business_process_org_id_trigger
  BEFORE INSERT ON business_processes
  FOR EACH ROW
  EXECUTE FUNCTION set_business_process_org_id();

-- Create function to verify organization access
CREATE OR REPLACE FUNCTION verify_organization_access(org_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.organization_id = org_id
  ) OR EXISTS (
    SELECT 1 FROM platform_admins
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_organization_access(uuid) TO authenticated;