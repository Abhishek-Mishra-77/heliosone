-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_assessment_summary(uuid);
DROP FUNCTION IF EXISTS get_assessment_stats(uuid);

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
    d.department_type
  FROM bcdr_assessments a
  LEFT JOIN departments d ON d.id = a.department_id
  WHERE EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth_uid
    AND (
      -- User can see assessments from their organization
      u.organization_id = a.organization_id
      OR
      -- Platform admins can see all assessments
      EXISTS (
        SELECT 1 FROM platform_admins pa
        WHERE pa.id = auth_uid
      )
    )
  )
  ORDER BY a.assessment_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get assessment statistics
CREATE OR REPLACE FUNCTION get_assessment_stats(org_id uuid)
RETURNS TABLE (
  total_assessments bigint,
  completed_assessments bigint,
  average_score numeric,
  critical_findings bigint,
  trend_percentage numeric
) AS $$
DECLARE
  prev_period_score numeric;
  current_period_score numeric;
BEGIN
  -- Get current period stats (last 30 days)
  SELECT AVG(score)
  INTO current_period_score
  FROM bcdr_assessments
  WHERE organization_id = org_id
  AND status = 'completed'
  AND assessment_date >= NOW() - INTERVAL '30 days';

  -- Get previous period stats (30-60 days ago)
  SELECT AVG(score)
  INTO prev_period_score
  FROM bcdr_assessments
  WHERE organization_id = org_id
  AND status = 'completed'
  AND assessment_date >= NOW() - INTERVAL '60 days'
  AND assessment_date < NOW() - INTERVAL '30 days';

  RETURN QUERY
  SELECT 
    COUNT(*) as total_assessments,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_assessments,
    ROUND(AVG(score) FILTER (WHERE status = 'completed'), 2) as average_score,
    COUNT(*) FILTER (WHERE score < 60) as critical_findings,
    CASE 
      WHEN prev_period_score > 0 THEN
        ROUND(((current_period_score - prev_period_score) / prev_period_score) * 100, 2)
      ELSE
        0
    END as trend_percentage
  FROM bcdr_assessments
  WHERE organization_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_assessment_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_assessment_stats(uuid) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bcdr_assessments_org_date 
  ON bcdr_assessments(organization_id, assessment_date);

CREATE INDEX IF NOT EXISTS idx_bcdr_assessments_status_score 
  ON bcdr_assessments(status, score);

-- Create a view for assessment trends
CREATE OR REPLACE VIEW assessment_trends AS
WITH weekly_stats AS (
  SELECT
    date_trunc('week', assessment_date) as week,
    organization_id,
    COUNT(*) as total_assessments,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_assessments,
    ROUND(AVG(score) FILTER (WHERE status = 'completed'), 2) as average_score,
    COUNT(*) FILTER (WHERE score < 60) as critical_findings
  FROM bcdr_assessments
  WHERE assessment_date >= NOW() - INTERVAL '12 weeks'
  GROUP BY date_trunc('week', assessment_date), organization_id
)
SELECT 
  week,
  organization_id,
  total_assessments,
  completed_assessments,
  average_score,
  critical_findings,
  LAG(average_score) OVER (PARTITION BY organization_id ORDER BY week) as prev_week_score,
  CASE 
    WHEN LAG(average_score) OVER (PARTITION BY organization_id ORDER BY week) IS NOT NULL THEN
      ROUND(
        ((average_score - LAG(average_score) OVER (PARTITION BY organization_id ORDER BY week)) / 
        LAG(average_score) OVER (PARTITION BY organization_id ORDER BY week)) * 100, 
        2
      )
    ELSE
      0
  END as week_over_week_change
FROM weekly_stats
ORDER BY week DESC;

-- Create a function to get department-level assessment stats
CREATE OR REPLACE FUNCTION get_department_assessment_stats(org_id uuid)
RETURNS TABLE (
  department_id uuid,
  department_name text,
  total_assessments bigint,
  completed_assessments bigint,
  average_score numeric,
  critical_findings bigint,
  last_assessment_date timestamptz,
  trend_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH department_stats AS (
    SELECT 
      d.id as dept_id,
      d.name as dept_name,
      COUNT(a.id) as total,
      COUNT(a.id) FILTER (WHERE a.status = 'completed') as completed,
      ROUND(AVG(a.score) FILTER (WHERE a.status = 'completed'), 2) as avg_score,
      COUNT(a.id) FILTER (WHERE a.score < 60) as critical,
      MAX(a.assessment_date) as last_date,
      ROUND(
        (
          AVG(a.score) FILTER (
            WHERE a.status = 'completed' 
            AND a.assessment_date >= NOW() - INTERVAL '30 days'
          ) -
          AVG(a.score) FILTER (
            WHERE a.status = 'completed'
            AND a.assessment_date >= NOW() - INTERVAL '60 days'
            AND a.assessment_date < NOW() - INTERVAL '30 days'
          )
        ) / NULLIF(
          AVG(a.score) FILTER (
            WHERE a.status = 'completed'
            AND a.assessment_date >= NOW() - INTERVAL '60 days'
            AND a.assessment_date < NOW() - INTERVAL '30 days'
          ),
          0
        ) * 100,
        2
      ) as trend
    FROM departments d
    LEFT JOIN bcdr_assessments a ON a.department_id = d.id
    WHERE d.organization_id = org_id
    GROUP BY d.id, d.name
  )
  SELECT 
    dept_id,
    dept_name,
    total,
    completed,
    avg_score,
    critical,
    last_date,
    COALESCE(trend, 0)
  FROM department_stats
  ORDER BY avg_score DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_department_assessment_stats(uuid) TO authenticated;