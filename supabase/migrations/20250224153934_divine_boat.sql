-- Create a type for the import result
CREATE TYPE user_import_result AS (
  success boolean,
  email text,
  message text
);

-- Create a function to validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email text)
RETURNS boolean AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Create a function to validate user data
CREATE OR REPLACE FUNCTION validate_user_data(
  email text,
  role text,
  full_name text
)
RETURNS user_import_result AS $$
DECLARE
  result user_import_result;
BEGIN
  result.email := email;
  
  -- Validate email format
  IF NOT is_valid_email(email) THEN
    result.success := false;
    result.message := 'Invalid email format';
    RETURN result;
  END IF;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM users WHERE users.email = validate_user_data.email) THEN
    result.success := false;
    result.message := 'User already exists';
    RETURN result;
  END IF;

  -- Validate role
  IF role NOT IN ('admin', 'user') THEN
    result.success := false;
    result.message := 'Invalid role. Must be "admin" or "user"';
    RETURN result;
  END IF;

  -- Validate full name
  IF full_name IS NULL OR length(trim(full_name)) = 0 THEN
    result.success := false;
    result.message := 'Full name is required';
    RETURN result;
  END IF;

  result.success := true;
  result.message := 'Validation successful';
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create the main import function
CREATE OR REPLACE FUNCTION import_organization_users(
  org_id uuid,
  user_data json[]
)
RETURNS SETOF user_import_result
SECURITY DEFINER
AS $$
DECLARE
  user_record json;
  validation_result user_import_result;
  new_user_id uuid;
  result user_import_result;
BEGIN
  -- Verify the caller has permission to add users to this organization
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND organization_id = org_id
    AND role = 'admin'
  ) AND NOT EXISTS (
    SELECT 1 FROM platform_admins
    WHERE id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  -- Process each user record
  FOR user_record IN SELECT * FROM json_array_elements(array_to_json(user_data))
  LOOP
    -- Initialize result
    result.email := user_record->>'email';
    
    -- Validate user data
    validation_result := validate_user_data(
      user_record->>'email',
      user_record->>'role',
      user_record->>'full_name'
    );
    
    IF NOT validation_result.success THEN
      RETURN NEXT validation_result;
      CONTINUE;
    END IF;

    -- Create user
    BEGIN
      -- Generate UUID for new user
      new_user_id := gen_random_uuid();
      
      -- Create user profile
      INSERT INTO users (
        id,
        email,
        full_name,
        role,
        organization_id
      ) VALUES (
        new_user_id,
        user_record->>'email',
        user_record->>'full_name',
        user_record->>'role',
        org_id
      );

      result.success := true;
      result.message := 'User created successfully';
      RETURN NEXT result;

    EXCEPTION WHEN OTHERS THEN
      result.success := false;
      result.message := 'Error: ' || SQLERRM;
      RETURN NEXT result;
      CONTINUE;
    END;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_valid_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_user_data(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION import_organization_users(uuid, json[]) TO authenticated;