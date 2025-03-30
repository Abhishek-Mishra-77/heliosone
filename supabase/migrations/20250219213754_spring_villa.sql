-- Drop existing trigger and function
DROP TRIGGER IF EXISTS department_path_trigger ON departments;
DROP FUNCTION IF EXISTS update_department_path();

-- Create improved path update function
CREATE OR REPLACE FUNCTION update_department_path()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    -- For root level departments, use the id directly
    NEW.path = NEW.id::text::ltree;
    NEW.level = 0;
  ELSE
    -- For child departments, concatenate parent path with current id
    SELECT path || NEW.id::text::ltree, level + 1
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
  new_path ltree;
  new_level integer;
BEGIN
  -- First update root level departments
  UPDATE departments 
  SET 
    path = id::text::ltree,
    level = 0
  WHERE parent_id IS NULL;

  -- Then update child departments level by level
  FOR i IN 1..10 LOOP -- Assuming max 10 levels of hierarchy
    UPDATE departments d
    SET
      path = p.path || d.id::text::ltree,
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
CREATE INDEX IF NOT EXISTS departments_path_idx ON departments USING gist (path);