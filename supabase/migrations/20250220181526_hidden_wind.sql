-- Drop existing trigger and function
DROP TRIGGER IF EXISTS department_path_trigger ON departments;
DROP FUNCTION IF EXISTS update_department_path();

-- Create improved path update function with proper path sanitization
CREATE OR REPLACE FUNCTION update_department_path()
RETURNS TRIGGER AS $$
DECLARE
  path_label text;
BEGIN
  -- Sanitize the ID to create a valid ltree label
  -- Replace any non-alphanumeric characters with underscores
  path_label := regexp_replace(NEW.id::text, '[^a-zA-Z0-9]', '_', 'g');
  
  IF NEW.parent_id IS NULL THEN
    -- For root level departments, use the sanitized id
    NEW.path = path_label::ltree;
    NEW.level = 0;
  ELSE
    -- For child departments, concatenate parent path with current sanitized id
    SELECT path || path_label::ltree, level + 1
    INTO NEW.path, NEW.level
    FROM departments
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER department_path_trigger
  BEFORE INSERT OR UPDATE OF parent_id ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_department_path();

-- Update existing departments to fix paths
DO $$
DECLARE
  dept RECORD;
  path_label text;
BEGIN
  -- First update root level departments
  FOR dept IN SELECT * FROM departments WHERE parent_id IS NULL LOOP
    path_label := regexp_replace(dept.id::text, '[^a-zA-Z0-9]', '_', 'g');
    UPDATE departments 
    SET 
      path = path_label::ltree,
      level = 0
    WHERE id = dept.id;
  END LOOP;

  -- Then update child departments level by level
  FOR i IN 1..10 LOOP -- Assuming max 10 levels of hierarchy
    UPDATE departments d
    SET
      path = p.path || regexp_replace(d.id::text, '[^a-zA-Z0-9]', '_', 'g')::ltree,
      level = p.level + 1
    FROM departments p
    WHERE d.parent_id = p.id
    AND d.level IS NULL;
    
    -- Exit if no more updates needed
    IF NOT FOUND THEN
      EXIT;
    END IF;
  END LOOP;
END $$;

-- Create index for path if it doesn't exist
DROP INDEX IF EXISTS departments_path_idx;
CREATE INDEX departments_path_idx ON departments USING gist (path);

-- Add constraint to ensure path is always valid
ALTER TABLE departments ADD CONSTRAINT valid_path CHECK (path IS NOT NULL);