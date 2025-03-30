-- Add assessment type and department_id to bcdr_assessments if not already added
ALTER TABLE bcdr_assessments
ADD COLUMN IF NOT EXISTS assessment_type text CHECK (assessment_type IN ('maturity', 'gap', 'business_impact')),
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES departments(id);

-- Create index for performance if not exists
CREATE INDEX IF NOT EXISTS bcdr_assessments_department_id_idx ON bcdr_assessments(department_id);

-- Create or replace the function to get assessment summary
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
    d.type as department_type
  FROM bcdr_assessments a
  LEFT JOIN departments d ON d.id = a.department_id
  WHERE EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth_uid
    AND u.organization_id = a.organization_id
  )
  ORDER BY a.assessment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_assessment_summary TO authenticated;

-- Create a function to get assessment statistics
CREATE OR REPLACE FUNCTION get_assessment_stats(org_id uuid)
RETURNS TABLE (
  total_assessments bigint,
  completed_assessments bigint,
  average_score numeric,
  critical_findings bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_assessments,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_assessments,
    ROUND(AVG(score) FILTER (WHERE status = 'completed'), 2) as average_score,
    COUNT(*) FILTER (WHERE score < 60) as critical_findings
  FROM bcdr_assessments
  WHERE organization_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_assessment_stats TO authenticated;