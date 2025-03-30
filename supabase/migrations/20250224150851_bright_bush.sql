-- Drop all existing user-related policies
DROP POLICY IF EXISTS "basic_user_access" ON users;
DROP POLICY IF EXISTS "users_access" ON users;
DROP POLICY IF EXISTS "allow_read_users" ON users;
DROP POLICY IF EXISTS "users_read_own" ON users;
DROP POLICY IF EXISTS "View own profile" ON users;
DROP POLICY IF EXISTS "View organization members" ON users;
DROP POLICY IF EXISTS "allow_view_own_profile" ON users;
DROP POLICY IF EXISTS "allow_view_organization_users" ON users;
DROP POLICY IF EXISTS "platform_admins_full_access" ON users;

-- Create a cache table for organization memberships
CREATE TABLE IF NOT EXISTS user_organization_cache (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  organization_id uuid REFERENCES organizations,
  created_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_organization_cache_org_id 
ON user_organization_cache(organization_id);

-- Create function to maintain the cache
CREATE OR REPLACE FUNCTION sync_user_organization_cache()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO user_organization_cache (user_id, organization_id)
    VALUES (NEW.id, NEW.organization_id)
    ON CONFLICT (user_id) 
    DO UPDATE SET organization_id = EXCLUDED.organization_id;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM user_organization_cache WHERE user_id = OLD.id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to maintain the cache
DROP TRIGGER IF EXISTS sync_user_organization_cache_trigger ON users;
CREATE TRIGGER sync_user_organization_cache_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_organization_cache();

-- Populate the cache table
INSERT INTO user_organization_cache (user_id, organization_id)
SELECT id, organization_id FROM users
ON CONFLICT (user_id) DO UPDATE 
SET organization_id = EXCLUDED.organization_id;

-- Create a simple policy using the cache table
CREATE POLICY "user_access_policy"
  ON users
  FOR SELECT
  USING (
    -- Users can see their own profile
    id = auth.uid()
    OR
    -- Platform admins can see all users
    EXISTS (
      SELECT 1 FROM platform_admins 
      WHERE id = auth.uid()
    )
    OR
    -- Users can see others in their organization using the cache
    EXISTS (
      SELECT 1 FROM user_organization_cache uoc
      WHERE uoc.user_id = auth.uid()
      AND uoc.organization_id = (
        SELECT organization_id 
        FROM user_organization_cache 
        WHERE user_id = users.id
      )
    )
  );

-- Create function to get user organization safely
CREATE OR REPLACE FUNCTION get_user_organization(user_id uuid)
RETURNS uuid AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM user_organization_cache 
    WHERE user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT ON user_organization_cache TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_organization(uuid) TO authenticated;