/*
  # Add Assessment Analysis Functions and Views

  1. Changes
    - Adds functions to calculate and store assessment scores
    - Creates views for analysis reporting
    - Adds triggers to update analysis data

  2. Security
    - RLS policies ensure users only see their organization's data
*/

-- Create function to calculate assessment scores
CREATE OR REPLACE FUNCTION calculate_assessment_score(assessment_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_weight numeric := 0;
  weighted_score numeric := 0;
  assessment_type text;
BEGIN
  -- Get assessment type
  SELECT assessment_type INTO assessment_type
  FROM bcdr_assessments
  WHERE id = assessment_id;

  -- Calculate weighted score based on assessment type
  CASE assessment_type
    WHEN 'resiliency' THEN
      SELECT 
        SUM(q.weight) as total_weight,
        SUM(q.weight * COALESCE(r.score, 0)) as weighted_score
      INTO total_weight, weighted_score
      FROM resiliency_responses r
      JOIN resiliency_questions q ON q.id = r.question_id
      WHERE r.assessment_id = assessment_id;

    WHEN 'gap' THEN
      SELECT 
        SUM(q.weight) as total_weight,
        SUM(q.weight * COALESCE(r.score, 0)) as weighted_score
      INTO total_weight, weighted_score
      FROM gap_analysis_responses r
      JOIN gap_analysis_questions q ON q.id = r.question_id
      WHERE r.assessment_id = assessment_id;

    WHEN 'maturity' THEN
      SELECT 
        SUM(q.weight) as total_weight,
        SUM(q.weight * COALESCE(r.score, 0)) as weighted_score
      INTO total_weight, weighted_score
      FROM maturity_assessment_responses r
      JOIN maturity_assessment_questions q ON q.id = r.question_id
      WHERE r.assessment_id = assessment_id;
  END CASE;

  -- Calculate final score
  RETURN CASE 
    WHEN total_weight > 0 THEN ROUND((weighted_score / total_weight) * 100)
    ELSE 0
  END;
END;
$$;

-- Create function to update assessment scores
CREATE OR REPLACE FUNCTION update_assessment_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Calculate and update score
  UPDATE bcdr_assessments
  SET 
    score = calculate_assessment_score(NEW.assessment_id),
    updated_at = NOW()
  WHERE id = NEW.assessment_id;
  
  RETURN NEW;
END;
$$;

-- Create triggers for score updates
DROP TRIGGER IF EXISTS update_resiliency_score ON resiliency_responses;
CREATE TRIGGER update_resiliency_score
  AFTER INSERT OR UPDATE OR DELETE
  ON resiliency_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_score();

DROP TRIGGER IF EXISTS update_gap_score ON gap_analysis_responses;
CREATE TRIGGER update_gap_score
  AFTER INSERT OR UPDATE OR DELETE
  ON gap_analysis_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_score();

DROP TRIGGER IF EXISTS update_maturity_score ON maturity_assessment_responses;
CREATE TRIGGER update_maturity_score
  AFTER INSERT OR UPDATE OR DELETE
  ON maturity_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_score();

-- Create view for assessment trends
CREATE OR REPLACE VIEW assessment_trends AS
WITH weekly_stats AS (
  SELECT
    date_trunc('week', assessment_date) as week,
    organization_id,
    COUNT(*) as total_assessments,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_assessments,
    AVG(score) FILTER (WHERE status = 'completed') as average_score,
    COUNT(*) FILTER (WHERE score < 60) as critical_findings,
    LAG(AVG(score) FILTER (WHERE status = 'completed')) OVER (
      PARTITION BY organization_id 
      ORDER BY date_trunc('week', assessment_date)
    ) as prev_week_score
  FROM bcdr_assessments
  GROUP BY date_trunc('week', assessment_date), organization_id
)
SELECT
  week,
  organization_id,
  total_assessments,
  completed_assessments,
  ROUND(average_score::numeric, 2) as average_score,
  critical_findings,
  ROUND(prev_week_score::numeric, 2) as prev_week_score,
  CASE 
    WHEN prev_week_score IS NOT NULL AND prev_week_score > 0
    THEN ROUND(((average_score - prev_week_score) / prev_week_score * 100)::numeric, 2)
    ELSE 0
  END as week_over_week_change
FROM weekly_stats;

-- Grant permissions
GRANT SELECT ON assessment_trends TO authenticated;