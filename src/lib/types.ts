export interface DepartmentRole {
  department_id: string
  role: 'department_admin' | 'assessor' | 'viewer'
}

export interface UserProfile {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'user'
  full_name: string | null
  organization_id: string | null
  department_roles: DepartmentRole[]
}