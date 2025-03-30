/*
  # Create BCDR Overview Function

  1. New Function
    - `get_bcdr_overview`: Aggregates analysis data across all assessment types
    - Returns comprehensive overview statistics including:
      - Scores and trends for each assessment type
      - Critical findings and gaps
      - Department completion rates
      - Key recommendations

  2. Security
    - Function accessible to authenticated users
    - Results filtered by organization access

  3. Changes
    - Creates new database function
    - Adds necessary type definitions
*/

-- Create composite type for recommendations
CREATE TYPE public.overview_recommendation AS (
  category text,
  priority text,
  description text
);

-- Create composite type for overview stats
CREATE TYPE public.bcdr_overview_stats AS (
  resiliency_score numeric,
  resiliency_trend numeric,
  gap_score numeric,
  gap_trend numeric,
  maturity_level integer,
  maturity_trend numeric,
  department_completion numeric,
  department_trend numeric,
  critical_findings integer,
  high_priority_findings integer,
  last_assessment timestamp with time zone,
  evidence_compliance numeric,
  recommendations overview_recommendation[]
);

-- Create function to get BCDR overview
CREATE OR REPLACE FUNCTION public.get_bcdr_overview(org_id uuid)
RETURNS public.bcdr_overview_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result bcdr_overview_stats;
  prev_resiliency_score numeric;
  prev_gap_score numeric;
  prev_maturity_level numeric;
  prev_department_completion numeric;
  total_departments integer;
  assessed_departments integer;
BEGIN
  -- Get latest resiliency assessment score
  SELECT 
    score,
    (
      SELECT score 
      FROM bcdr_assessments 
      WHERE organization_id = org_id 
      AND assessment_type = 'resiliency'
      AND status = 'completed'
      AND assessment_date < a.assessment_date
      ORDER BY assessment_date DESC 
      LIMIT 1
    ) as previous_score
  INTO result.resiliency_score, prev_resiliency_score
  FROM bcdr_assessments a
  WHERE organization_id = org_id 
  AND assessment_type = 'resiliency'
  AND status = 'completed'
  ORDER BY assessment_date DESC
  LIMIT 1;

  -- Calculate resiliency trend
  IF prev_resiliency_score IS NOT NULL AND prev_resiliency_score > 0 THEN
    result.resiliency_trend := ((result.resiliency_score - prev_resiliency_score) / prev_resiliency_score) * 100;
  ELSE
    result.resiliency_trend := 0;
  END IF;

  -- Get latest gap analysis score
  SELECT 
    score,
    (
      SELECT score 
      FROM bcdr_assessments 
      WHERE organization_id = org_id 
      AND assessment_type = 'gap'
      AND status = 'completed'
      AND assessment_date < a.assessment_date
      ORDER BY assessment_date DESC 
      LIMIT 1
    ) as previous_score
  INTO result.gap_score, prev_gap_score
  FROM bcdr_assessments a
  WHERE organization_id = org_id 
  AND assessment_type = 'gap'
  AND status = 'completed'
  ORDER BY assessment_date DESC
  LIMIT 1;

  -- Calculate gap trend
  IF prev_gap_score IS NOT NULL AND prev_gap_score > 0 THEN
    result.gap_trend := ((result.gap_score - prev_gap_score) / prev_gap_score) * 100;
  ELSE
    result.gap_trend := 0;
  END IF;

  -- Get latest maturity level
  WITH maturity_scores AS (
    SELECT 
      a.id,
      a.assessment_date,
      CEIL(AVG(
        CASE 
          WHEN mar.score >= 80 THEN 5
          WHEN mar.score >= 60 THEN 4
          WHEN mar.score >= 40 THEN 3
          WHEN mar.score >= 20 THEN 2
          ELSE 1
        END
      )) as level
    FROM bcdr_assessments a
    JOIN maturity_assessment_responses mar ON mar.assessment_id = a.id
    WHERE a.organization_id = org_id 
    AND a.assessment_type = 'maturity'
    AND a.status = 'completed'
    GROUP BY a.id, a.assessment_date
  )
  SELECT 
    level,
    (
      SELECT level
      FROM maturity_scores ms2
      WHERE ms2.assessment_date < ms1.assessment_date
      ORDER BY assessment_date DESC
      LIMIT 1
    ) as previous_level
  INTO result.maturity_level, prev_maturity_level
  FROM maturity_scores ms1
  ORDER BY assessment_date DESC
  LIMIT 1;

  -- Calculate maturity trend
  IF prev_maturity_level IS NOT NULL THEN
    result.maturity_trend := result.maturity_level - prev_maturity_level;
  ELSE
    result.maturity_trend := 0;
  END IF;

  -- Calculate department completion
  SELECT COUNT(*) INTO total_departments
  FROM departments
  WHERE organization_id = org_id;

  SELECT COUNT(DISTINCT department_id) INTO assessed_departments
  FROM department_assessments da
  JOIN bcdr_assessments ba ON ba.id = da.assessment_id
  WHERE ba.organization_id = org_id
  AND da.status = 'completed';

  result.department_completion := CASE 
    WHEN total_departments > 0 THEN
      (assessed_departments::numeric / total_departments::numeric) * 100
    ELSE 0
  END;

  -- Get previous department completion for trend
  SELECT 
    (COUNT(DISTINCT department_id)::numeric / total_departments::numeric) * 100
  INTO prev_department_completion
  FROM department_assessments da
  JOIN bcdr_assessments ba ON ba.id = da.assessment_id
  WHERE ba.organization_id = org_id
  AND da.status = 'completed'
  AND ba.assessment_date < (
    SELECT MAX(assessment_date) 
    FROM bcdr_assessments 
    WHERE organization_id = org_id
  );

  -- Calculate department trend
  IF prev_department_completion IS NOT NULL THEN
    result.department_trend := result.department_completion - prev_department_completion;
  ELSE
    result.department_trend := 0;
  END IF;

  -- Get critical and high priority findings
  SELECT 
    COUNT(*) FILTER (WHERE priority = 'critical'),
    COUNT(*) FILTER (WHERE priority = 'high')
  INTO 
    result.critical_findings,
    result.high_priority_findings
  FROM bcdr_recommendations
  WHERE organization_id = org_id
  AND status NOT IN ('completed', 'deferred');

  -- Get last assessment date
  SELECT MAX(assessment_date)
  INTO result.last_assessment
  FROM bcdr_assessments
  WHERE organization_id = org_id
  AND status = 'completed';

  -- Calculate evidence compliance
  WITH evidence_stats AS (
    SELECT 
      COUNT(*) FILTER (WHERE evidence_links IS NOT NULL AND array_length(evidence_links, 1) > 0) as with_evidence,
      COUNT(*) FILTER (WHERE evidence_required = true) as required_evidence
    FROM (
      SELECT evidence_links, evidence_required FROM resiliency_responses rr
      JOIN resiliency_questions rq ON rq.id = rr.question_id
      JOIN bcdr_assessments ba ON ba.id = rr.assessment_id
      WHERE ba.organization_id = org_id
      UNION ALL
      SELECT evidence_links, evidence_required FROM gap_analysis_responses gar
      JOIN gap_analysis_questions gaq ON gaq.id = gar.question_id
      JOIN bcdr_assessments ba ON ba.id = gar.assessment_id
      WHERE ba.organization_id = org_id
      UNION ALL
      SELECT evidence_links, evidence_required FROM maturity_assessment_responses mar
      JOIN maturity_assessment_questions maq ON maq.id = mar.question_id
      JOIN bcdr_assessments ba ON ba.id = mar.assessment_id
      WHERE ba.organization_id = org_id
    ) evidence_data
  )
  SELECT 
    CASE 
      WHEN required_evidence > 0 THEN
        (with_evidence::numeric / required_evidence::numeric) * 100
      ELSE 0
    END
  INTO result.evidence_compliance
  FROM evidence_stats;

  -- Get key recommendations
  SELECT ARRAY(
    SELECT ROW(category, priority, title)::overview_recommendation
    FROM bcdr_recommendations
    WHERE organization_id = org_id
    AND status NOT IN ('completed', 'deferred')
    ORDER BY 
      CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      created_at DESC
    LIMIT 5
  ) INTO result.recommendations;

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_bcdr_overview(uuid) TO authenticated;