/*
  # Update Consolidation Phase Schema

  This migration safely creates or updates the consolidation phase schema by:
  1. Checking for existing tables before creation
  2. Using IF NOT EXISTS clauses
  3. Safely dropping and recreating policies
  4. Adding indexes for performance
*/

DO $$ 
BEGIN
  -- Only create tables if they don't exist
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'consolidation_phases') THEN
    -- Consolidation Phases
    CREATE TABLE consolidation_phases (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      assessment_id uuid REFERENCES bcdr_assessments NOT NULL,
      organization_id uuid REFERENCES organizations NOT NULL,
      status text NOT NULL CHECK (status IN ('draft', 'in_progress', 'review', 'approved', 'completed')),
      start_date timestamptz NOT NULL DEFAULT now(),
      target_completion_date timestamptz,
      actual_completion_date timestamptz,
      owner_id uuid REFERENCES users NOT NULL,
      approver_id uuid REFERENCES users,
      summary text,
      methodology text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE (assessment_id)
    );

    ALTER TABLE consolidation_phases ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'consolidation_findings') THEN
    -- Consolidation Findings
    CREATE TABLE consolidation_findings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      consolidation_id uuid REFERENCES consolidation_phases NOT NULL,
      type text NOT NULL CHECK (type IN ('gap', 'risk', 'observation', 'recommendation')),
      category text NOT NULL CHECK (category IN ('technical', 'operational', 'organizational', 'compliance')),
      severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
      title text NOT NULL,
      description text NOT NULL,
      impact text,
      recommendation text,
      department_ids uuid[] NOT NULL,
      owner_id uuid REFERENCES users,
      target_date timestamptz,
      status text NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted')),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE consolidation_findings ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'consolidation_reviews') THEN
    -- Consolidation Reviews
    CREATE TABLE consolidation_reviews (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      consolidation_id uuid REFERENCES consolidation_phases NOT NULL,
      reviewer_id uuid REFERENCES users NOT NULL,
      status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
      comments text,
      review_date timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      UNIQUE (consolidation_id, reviewer_id)
    );

    ALTER TABLE consolidation_reviews ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'consolidation_actions') THEN
    -- Consolidation Actions
    CREATE TABLE consolidation_actions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      finding_id uuid REFERENCES consolidation_findings NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
      owner_id uuid REFERENCES users,
      status text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
      target_date timestamptz,
      completion_date timestamptz,
      evidence_required boolean DEFAULT false,
      evidence_links text[],
      notes text,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    ALTER TABLE consolidation_actions ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'consolidation_action_dependencies') THEN
    -- Action Dependencies
    CREATE TABLE consolidation_action_dependencies (
      action_id uuid REFERENCES consolidation_actions NOT NULL,
      dependency_id uuid REFERENCES consolidation_actions NOT NULL,
      created_at timestamptz DEFAULT now(),
      PRIMARY KEY (action_id, dependency_id),
      CONSTRAINT no_self_dependency CHECK (action_id != dependency_id)
    );

    ALTER TABLE consolidation_action_dependencies ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_can_view_org_consolidations" ON consolidation_phases;
DROP POLICY IF EXISTS "admins_can_manage_consolidations" ON consolidation_phases;
DROP POLICY IF EXISTS "users_can_view_org_findings" ON consolidation_findings;
DROP POLICY IF EXISTS "admins_can_manage_findings" ON consolidation_findings;
DROP POLICY IF EXISTS "users_can_view_org_reviews" ON consolidation_reviews;
DROP POLICY IF EXISTS "reviewers_can_manage_reviews" ON consolidation_reviews;
DROP POLICY IF EXISTS "users_can_view_org_actions" ON consolidation_actions;
DROP POLICY IF EXISTS "owners_can_manage_actions" ON consolidation_actions;
DROP POLICY IF EXISTS "users_can_view_dependencies" ON consolidation_action_dependencies;
DROP POLICY IF EXISTS "admins_can_manage_dependencies" ON consolidation_action_dependencies;

-- Create new policies
CREATE POLICY "users_can_view_org_consolidations"
  ON consolidation_phases
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "admins_can_manage_consolidations"
  ON consolidation_phases
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND organization_id = consolidation_phases.organization_id
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND organization_id = consolidation_phases.organization_id
      AND role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

CREATE POLICY "users_can_view_org_findings"
  ON consolidation_findings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consolidation_phases cp
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND cp.id = consolidation_findings.consolidation_id
    )
  );

CREATE POLICY "admins_can_manage_findings"
  ON consolidation_findings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM consolidation_phases cp
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND cp.id = consolidation_findings.consolidation_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM consolidation_phases cp
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND cp.id = consolidation_findings.consolidation_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

CREATE POLICY "users_can_view_org_reviews"
  ON consolidation_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consolidation_phases cp
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND cp.id = consolidation_reviews.consolidation_id
    )
  );

CREATE POLICY "reviewers_can_manage_reviews"
  ON consolidation_reviews
  FOR ALL
  USING (
    reviewer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM consolidation_phases cp
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND cp.id = consolidation_reviews.consolidation_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  )
  WITH CHECK (
    reviewer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM consolidation_phases cp
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND cp.id = consolidation_reviews.consolidation_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

CREATE POLICY "users_can_view_org_actions"
  ON consolidation_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consolidation_findings cf
      JOIN consolidation_phases cp ON cp.id = cf.consolidation_id
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND cf.id = consolidation_actions.finding_id
    )
  );

CREATE POLICY "owners_can_manage_actions"
  ON consolidation_actions
  FOR ALL
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM consolidation_findings cf
      JOIN consolidation_phases cp ON cp.id = cf.consolidation_id
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND cf.id = consolidation_actions.finding_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM consolidation_findings cf
      JOIN consolidation_phases cp ON cp.id = cf.consolidation_id
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND cf.id = consolidation_actions.finding_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

CREATE POLICY "users_can_view_dependencies"
  ON consolidation_action_dependencies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consolidation_actions ca
      JOIN consolidation_findings cf ON cf.id = ca.finding_id
      JOIN consolidation_phases cp ON cp.id = cf.consolidation_id
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND ca.id = consolidation_action_dependencies.action_id
    )
  );

CREATE POLICY "admins_can_manage_dependencies"
  ON consolidation_action_dependencies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM consolidation_actions ca
      JOIN consolidation_findings cf ON cf.id = ca.finding_id
      JOIN consolidation_phases cp ON cp.id = cf.consolidation_id
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND ca.id = consolidation_action_dependencies.action_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM consolidation_actions ca
      JOIN consolidation_findings cf ON cf.id = ca.finding_id
      JOIN consolidation_phases cp ON cp.id = cf.consolidation_id
      JOIN users u ON u.organization_id = cp.organization_id
      WHERE u.id = auth.uid()
      AND ca.id = consolidation_action_dependencies.action_id
      AND u.role IN ('super_admin', 'admin', 'bcdr_manager')
    )
  );

-- Create or replace indexes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'consolidation_findings_consolidation_id_idx') THEN
    CREATE INDEX consolidation_findings_consolidation_id_idx ON consolidation_findings(consolidation_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'consolidation_reviews_consolidation_id_idx') THEN
    CREATE INDEX consolidation_reviews_consolidation_id_idx ON consolidation_reviews(consolidation_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'consolidation_actions_finding_id_idx') THEN
    CREATE INDEX consolidation_actions_finding_id_idx ON consolidation_actions(finding_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'consolidation_action_dependencies_action_id_idx') THEN
    CREATE INDEX consolidation_action_dependencies_action_id_idx ON consolidation_action_dependencies(action_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'consolidation_action_dependencies_dependency_id_idx') THEN
    CREATE INDEX consolidation_action_dependencies_dependency_id_idx ON consolidation_action_dependencies(dependency_id);
  END IF;
END $$;

-- Create or replace triggers
DROP TRIGGER IF EXISTS update_consolidation_phases_updated_at ON consolidation_phases;
DROP TRIGGER IF EXISTS update_consolidation_findings_updated_at ON consolidation_findings;
DROP TRIGGER IF EXISTS update_consolidation_reviews_updated_at ON consolidation_reviews;
DROP TRIGGER IF EXISTS update_consolidation_actions_updated_at ON consolidation_actions;

CREATE TRIGGER update_consolidation_phases_updated_at
  BEFORE UPDATE ON consolidation_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_consolidation_findings_updated_at
  BEFORE UPDATE ON consolidation_findings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_consolidation_reviews_updated_at
  BEFORE UPDATE ON consolidation_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();

CREATE TRIGGER update_consolidation_actions_updated_at
  BEFORE UPDATE ON consolidation_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_timestamp();