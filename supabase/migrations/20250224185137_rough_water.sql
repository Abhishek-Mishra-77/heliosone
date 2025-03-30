-- First, get Matthew's department and organization details
DO $$
DECLARE
  v_dept_id uuid;
  v_org_id uuid;
  v_template_id uuid;
  v_admin_id uuid;
BEGIN
  -- Get Matthew's department and org ID
  SELECT d.id, d.organization_id INTO v_dept_id, v_org_id
  FROM departments d
  JOIN department_users du ON du.department_id = d.id
  WHERE du.user_id = 'b06059d8-5613-4a38-a136-62533999193c'
  AND d.department_type = 'department'
  LIMIT 1;

  IF v_dept_id IS NULL THEN
    RAISE EXCEPTION 'IT department not found for Matthew';
  END IF;

  -- Get the first admin from the organization
  SELECT id INTO v_admin_id
  FROM users 
  WHERE organization_id = v_org_id
  AND role = 'admin'
  LIMIT 1;

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'No admin found in organization';
  END IF;

  -- Get the IT department template ID
  SELECT id INTO v_template_id
  FROM department_questionnaire_templates
  WHERE name = 'IT Department Assessment'
  AND department_type = 'department'
  AND is_active = true
  LIMIT 1;

  IF v_template_id IS NULL THEN
    RAISE EXCEPTION 'IT department template not found';
  END IF;

  -- First delete ALL existing assignments for this department
  DELETE FROM department_questionnaire_assignments
  WHERE department_id = v_dept_id;

  -- Create new assignment
  INSERT INTO department_questionnaire_assignments (
    template_id,
    department_id,
    assigned_by,
    status,
    due_date
  ) VALUES (
    v_template_id,
    v_dept_id,
    v_admin_id,
    'pending',
    CURRENT_TIMESTAMP + INTERVAL '30 days'
  );

END $$;