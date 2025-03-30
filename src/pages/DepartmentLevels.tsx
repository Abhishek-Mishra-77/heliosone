import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  UserPlus,
  ArrowLeft,
  Shield,
  Mail,
  Calendar
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/store'
import { DepartmentTemplateModal, type DepartmentTemplate } from '../components/DepartmentTemplateModal'
import { DepartmentModal } from '../components/DepartmentModal'
import { DepartmentUserModal } from '../components/DepartmentUserModal'
import { format } from 'date-fns'
import clsx from 'clsx'

interface Department {
  id: string
  name: string
  code: string
  type: 'department' | 'business_unit' | 'team' | 'division'
  description: string
  parent_id: string | null
  level: number
  path: string
  department_type: string
  created_at: string
  updated_at: string
}

interface DepartmentUser {
  id: string
  department_id: string
  user_id: string
  role: 'department_admin' | 'assessor' | 'viewer'
  user: {
    full_name: string
    email: string
  }
}

export function DepartmentLevels() {
  const { organization, profile } = useAuthStore()
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentUsers, setDepartmentUsers] = useState<Record<string, DepartmentUser[]>>({})
  const [loading, setLoading] = useState(true)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<DepartmentTemplate | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null)
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (organization?.id) {
      fetchDepartments()
    }
  }, [organization?.id])

  async function fetchDepartments() {
    try {
      setLoading(true)
      const { data: depts, error: deptsError } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('path')

      if (deptsError) throw deptsError
      setDepartments(depts || [])

      // Fetch users for each department
      for (const dept of depts || []) {
        const { data: users, error: usersError } = await supabase
          .from('department_users')
          .select(`
            *,
            user:users (
              full_name,
              email
            )
          `)
          .eq('department_id', dept.id)

        if (usersError) throw usersError
        setDepartmentUsers(prev => ({
          ...prev,
          [dept.id]: users || []
        }))
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      window.toast?.error('Failed to fetch departments')
    } finally {
      setLoading(false)
    }
  }

  async function createDepartment(departmentData: any) {
    try {
      // Ensure we have the required permissions
      if (!profile?.role || !['super_admin', 'admin'].includes(profile.role)) {
        throw new Error('You do not have permission to create departments')
      }

      const { data, error } = await supabase
        .from('departments')
        .insert([{
          ...departmentData,
          organization_id: organization?.id,
          department_type: departmentData.type
        }])
        .select()

      if (error) throw error
      
      await fetchDepartments()
      setShowAddModal(false)
      setSelectedTemplate(null)
      window.toast?.success('Department created successfully')
    } catch (error) {
      console.error('Error creating department:', error)
      window.toast?.error(error instanceof Error ? error.message : 'Failed to create department')
    }
  }

  const handleTemplateSelect = (template: DepartmentTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateModal(false)
    setShowAddModal(true)
  }

  function toggleDepartment(deptId: string) {
    setExpandedDepartments(prev => {
      const next = new Set(prev)
      if (next.has(deptId)) {
        next.delete(deptId)
      } else {
        next.add(deptId)
      }
      return next
    })
  }

  async function removeDepartmentUser(departmentId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('department_users')
        .delete()
        .eq('department_id', departmentId)
        .eq('user_id', userId)

      if (error) throw error

      // Update local state
      setDepartmentUsers(prev => ({
        ...prev,
        [departmentId]: prev[departmentId].filter(u => u.user_id !== userId)
      }))

      window.toast?.success('User removed from department')
    } catch (error) {
      console.error('Error removing user from department:', error)
      window.toast?.error('Failed to remove user from department')
    }
  }

  function getDepartmentHierarchy() {
    const hierarchy: Department[] = []
    const seen = new Set<string>()

    function addDepartment(dept: Department) {
      if (seen.has(dept.id)) return
      seen.add(dept.id)
      hierarchy.push(dept)

      const children = departments.filter(d => d.parent_id === dept.id)
      children.forEach(child => addDepartment(child))
    }

    departments
      .filter(d => !d.parent_id)
      .forEach(root => addDepartment(root))

    return hierarchy
  }

  const renderDepartmentList = () => (
    <div className="space-y-4">
      {getDepartmentHierarchy().map((dept) => (
        <div
          key={dept.id}
          className={clsx(
            "bg-white border border-gray-200 rounded-lg shadow-sm transition-all hover:border-indigo-300",
            { "ml-8": dept.level > 0 }
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setViewingDepartment(dept)}
                  className="flex items-center group"
                >
                  <Building2 className="w-5 h-5 text-indigo-600 mr-2" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                      {dept.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="capitalize">{dept.type}</span>
                      {dept.code && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Code: {dept.code}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  {departmentUsers[dept.id]?.length || 0} members
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedDepartment(dept.id)
                      setShowUserModal(true)
                    }}
                    className="p-1 text-indigo-600 hover:text-indigo-900"
                    title="Add member"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                  <button className="p-1 text-indigo-600 hover:text-indigo-900">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this department?')) {
                        try {
                          const { error } = await supabase
                            .from('departments')
                            .delete()
                            .eq('id', dept.id)

                          if (error) throw error
                          await fetchDepartments()
                          window.toast?.success('Department deleted successfully')
                        } catch (error) {
                          console.error('Error deleting department:', error)
                          window.toast?.error('Failed to delete department')
                        }
                      }
                    }}
                    className="p-1 text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderDepartmentDetails = () => {
    if (!viewingDepartment) return null

    const users = departmentUsers[viewingDepartment.id] || []
    const admins = users.filter(u => u.role === 'department_admin')
    const assessors = users.filter(u => u.role === 'assessor')
    const viewers = users.filter(u => u.role === 'viewer')

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setViewingDepartment(null)}
              className="mr-4 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{viewingDepartment.name}</h2>
              <p className="mt-1 text-gray-600">{viewingDepartment.description}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedDepartment(viewingDepartment.id)
              setShowUserModal(true)
            }}
            className="btn-primary"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add Member
          </button>
        </div>

        {/* Department Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Department Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{viewingDepartment.type}</span>
              </div>
              {viewingDepartment.code && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Code:</span>
                  <span className="font-medium">{viewingDepartment.code}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {format(new Date(viewingDepartment.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Member Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Members:</span>
                <span className="font-medium">{users.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Admins:</span>
                <span className="font-medium">{admins.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Assessors:</span>
                <span className="font-medium">{assessors.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-secondary text-sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Department
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this department?')) {
                    // Handle delete
                  }
                }}
                className="w-full btn-danger text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Department
              </button>
            </div>
          </div>
        </div>

        {/* Member List */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Department Members</h3>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Members Yet</h4>
                <p className="text-gray-600 mb-4">Add members to this department to get started</p>
                <button
                  onClick={() => {
                    setSelectedDepartment(viewingDepartment.id)
                    setShowUserModal(true)
                  }}
                  className="btn-primary"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Add Member
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {user.user.full_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-500">{user.user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx(
                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                            {
                              "bg-indigo-100 text-indigo-800": user.role === "department_admin",
                              "bg-green-100 text-green-800": user.role === "assessor",
                              "bg-gray-100 text-gray-800": user.role === "viewer"
                            }
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => removeDepartmentUser(viewingDepartment.id, user.user_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!profile?.role?.includes('admin')) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {!viewingDepartment ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-indigo-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                  <p className="mt-1 text-gray-600">
                    Manage your organizational structure and department hierarchy
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="btn-secondary"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Use Template
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate(null)
                    setShowAddModal(true)
                  }}
                  className="btn-primary"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Custom
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading departments...</p>
              </div>
            ) : departments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Departments Yet</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first department</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="btn-secondary"
                  >
                    <Building2 className="w-5 h-5 mr-2" />
                    Use Template
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Custom
                  </button>
                </div>
              </div>
            ) : (
              renderDepartmentList()
            )}
          </>
        ) : (
          renderDepartmentDetails()
        )}
      </div>

      {/* Template Selection Modal */}
      <DepartmentTemplateModal
        show={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Department Creation Modal */}
      <DepartmentModal
        show={showAddModal}
        template={selectedTemplate}
        onClose={() => {
          setShowAddModal(false)
          setSelectedTemplate(null)
        }}
        onSave={createDepartment}
      />

      {/* Department User Modal */}
      {selectedDepartment && (
        <DepartmentUserModal
          show={showUserModal}
          departmentId={selectedDepartment}
          onClose={() => {
            setShowUserModal(false)
            setSelectedDepartment(null)
          }}
          onSave={() => {
            fetchDepartments()
            setShowUserModal(false)
            setSelectedDepartment(null)
          }}
        />
      )}
    </div>
  )
}