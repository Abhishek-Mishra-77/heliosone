/*
  # Create Initial Admin User Data
  
  1. New Data
    - Creates organization 'Helios Admin'
    - Links admin user to organization with super_admin role
  
  2. Security
    - Uses existing RLS policies
    - Data inserted through SQL maintains security
  3. Changes
    - Added check for auth.users existence before inserting user record
    - Added DO block for safer execution
*/

DO $$
DECLARE
    auth_user_id uuid;
    org_id uuid := 'f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454';
BEGIN
    -- Get the auth user id
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = 'admin@helios.com'
    LIMIT 1;

    -- Only proceed if we found the auth user
    IF auth_user_id IS NOT NULL THEN
        -- Insert the organization if it doesn't exist
        INSERT INTO organizations (id, name, industry)
        VALUES (
            org_id,
            'Helios Admin',
            'Technology'
        )
        ON CONFLICT (id) DO NOTHING;

        -- Insert the user record
        INSERT INTO users (id, organization_id, role, full_name)
        VALUES (
            auth_user_id,
            org_id,
            'super_admin',
            'Helios Admin'
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;