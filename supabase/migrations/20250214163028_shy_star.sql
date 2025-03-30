-- Drop existing type check constraint if it exists
ALTER TABLE bcdr_assessments 
DROP CONSTRAINT IF EXISTS bcdr_assessments_assessment_type_check;

-- Add assessment_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bcdr_assessments' 
    AND column_name = 'assessment_type'
  ) THEN
    ALTER TABLE bcdr_assessments 
    ADD COLUMN assessment_type text;
  END IF;
END $$;

-- Add check constraint
ALTER TABLE bcdr_assessments 
ADD CONSTRAINT bcdr_assessments_assessment_type_check 
CHECK (assessment_type IN ('maturity', 'gap', 'business_impact'));

-- Update existing rows to have a default type
UPDATE bcdr_assessments 
SET assessment_type = 'maturity' 
WHERE assessment_type IS NULL;

-- Make the column required
ALTER TABLE bcdr_assessments 
ALTER COLUMN assessment_type SET NOT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_bcdr_assessments_type 
ON bcdr_assessments(assessment_type);

-- Update the get_assessment_summary function to use assessment_type
CREATE OR REPLACE FUNCTION get_assessment_summary(auth_uid uuid)
RETURNS TABLE (
  id uuid,
  organization_id uuid,
  type text,
  score numeric,
  status text,
  assessment_date timestamptz,
  department_id uuid,
  department_name text,
  department_type text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.organization_id,
    a.assessment_type as type,
    a.score,
    a.status,
    a.assessment_date,
    a.department_id,
    d.name as department_name,
    d.department_type
  FROM bcdr_assessments a
  LEFT JOIN departments d ON d.id = a.department_id
  WHERE EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth_uid
    AND (
      u.organization_id = a.organization_id
      OR
      EXISTS (
        SELECT 1 FROM platform_admins pa
        WHERE pa.id = auth_uid
      )
    )
  )
  ORDER BY a.assessment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_assessment_summary(uuid) TO authenticated;