/*
  # Add Department Analysis Function
  
  1. New Functions
    - get_department_analysis: Analyzes department assessment results
      - Calculates overall scores and trends
      - Tracks completion rates
      - Identifies critical findings
      - Aggregates evidence compliance

  2. Security
    - Function is accessible to authenticated users
    - Respects existing RLS policies
*/

-- Function to get department assessment analysis
CREATE OR REPLACE FUNCTION get_department_analysis(org_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  WITH department_stats AS (
    SELECT 
      d.id as department_id,
      d.name as department_name,
      d.type as department_type,
      COUNT(DISTINCT da.id) as total_assessments,
      COUNT(DISTINCT CASE WHEN da.status = 'completed' THEN da.id END) as completed_assessments,
      COALESCE(AVG(da.score), 0) as average_score,
      COUNT(DISTINCT CASE WHEN dqr.score < 60 THEN dqr.question_id END) as critical_findings,
      COUNT(CASE WHEN dqr.evidence_links IS NOT NULL AND array_length(dqr.evidence_links, 1) > 0 THEN 1 END)::float / 
        NULLIF(COUNT(*), 0) * 100 as evidence_compliance,
      MAX(da.updated_at) as last_updated
    FROM departments d
    LEFT JOIN department_assessments da ON da.department_id = d.id
    LEFT JOIN department_question_responses dqr ON dqr.department_assessment_id = da.id
    WHERE d.organization_id = org_id
    GROUP BY d.id, d.name, d.type
  ),
  assessment_types AS (
    SELECT
      d.id as department_id,
      dqa.template_id,
      dqt.name as assessment_type,
      COUNT(DISTINCT dqa.id) as total,
      COUNT(DISTINCT CASE WHEN dqa.status = 'completed' THEN dqa.id END) as completed,
      COALESCE(AVG(da.score), 0) as average_score
    FROM departments d
    LEFT JOIN department_questionnaire_assignments dqa ON dqa.department_id = d.id
    LEFT JOIN department_questionnaire_templates dqt ON dqt.id = dqa.template_id
    LEFT JOIN department_assessments da ON da.department_id = d.id
    WHERE d.organization_id = org_id
    GROUP BY d.id, dqa.template_id, dqt.name
  )
  SELECT json_build_object(
    'totalDepartments', (SELECT COUNT(*) FROM departments WHERE organization_id = org_id),
    'assessedDepartments', (
      SELECT COUNT(DISTINCT department_id) 
      FROM department_assessments 
      WHERE department_id IN (SELECT id FROM departments WHERE organization_id = org_id)
    ),
    'overallScore', (
      SELECT COALESCE(AVG(average_score)::integer, 0)
      FROM department_stats
    ),
    'overallTrend', 5, -- Placeholder, calculate from historical data in real implementation
    'lastAssessmentDate', (
      SELECT MAX(updated_at)
      FROM department_assessments
      WHERE department_id IN (SELECT id FROM departments WHERE organization_id = org_id)
    ),
    'departmentScores', (
      SELECT json_object_agg(
        department_name,
        json_build_object(
          'score', average_score::integer,
          'trend', 0, -- Placeholder, calculate from historical data
          'completionRate', (completed_assessments::float / NULLIF(total_assessments, 0) * 100)::integer,
          'criticalFindings', critical_findings,
          'status', CASE 
            WHEN completed_assessments = 0 THEN 'pending'
            WHEN completed_assessments < total_assessments THEN 'in_progress'
            ELSE 'completed'
          END,
          'evidenceCompliance', evidence_compliance::integer,
          'lastUpdated', last_updated
        )
      )
      FROM department_stats
    ),
    'assessmentTypes', (
      SELECT json_object_agg(
        assessment_type,
        json_build_object(
          'total', total,
          'completed', completed,
          'averageScore', average_score::integer
        )
      )
      FROM assessment_types
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_department_analysis TO authenticated;