import React, { useState, useEffect } from 'react'
import { Building2, Plus, Edit2, Trash2, Users, ChevronRight, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../lib/store'
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

export function Departments() {
  const { organization, profile } = useAuthStore()
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentUsers, setDepartmentUsers] = useState<Record<string, DepartmentUser[]>>({})
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set())
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    code: '',
    type: 'department' as const,
    description: '',
    parent_id: null as string | null
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  async function fetchDepartments() {
    try {
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
    } finally {
      setLoading(false)
    }
  }

  async function createDepartment(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert([{
          ...newDepartment,
          organization_id: organization?.id
        }])
        .select()

      if (error) throw error
      
      await fetchDepartments()
      setShowAddModal(false)
      setNewDepartment({
        name: '',
        code: '',
        type: 'department',
        description: '',
        parent_id: null
      })
    } catch (error) {
      console.error('Error creating department:', error)
      alert('Failed to create department')
    }
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

  if (!profile?.role?.includes('admin') && !profile?.role?.includes('bcdr_manager')) {
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Department
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading departments...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getDepartmentHierarchy().map((dept) => (
              <div
                key={dept.id}
                className={clsx(
                  "bg-white border border-gray-200 rounded-lg shadow-sm",
                  { "ml-8": dept.level > 0 }
                )}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleDepartment(dept.id)}
                        className="text-gray-500 hover:text-gray-700 mr-2"
                      >
                        {departments.some(d => d.parent_id === dept.id) ? (
                          expandedDepartments.has(dept.id) ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )
                        ) : null}
                      </button>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
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
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        {departmentUsers[dept.id]?.length || 0} members
                      </div>
                      <div className="flex space-x-2">
                        <button className="p-1 text-indigo-600 hover:text-indigo-900">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button className="p-1 text-red-600 hover:text-red-900">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedDepartments.has(dept.id) && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Members</h4>
                      <div className="space-y-2">
                        {departmentUsers[dept.id]?.map(user => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <span className="font-medium">{user.user.full_name}</span>
                              <span className="text-gray-500 ml-2">{user.user.email}</span>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {user.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-header">Add Department</h2>
            <form onSubmit={createDepartment}>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Code</label>
                  <input
                    type="text"
                    value={newDepartment.code}
                    onChange={(e) => setNewDepartment({ ...newDepartment, code: e.target.value })}
                    className="input"
                  />
                  <p className="form-hint">Optional unique code for this department</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    value={newDepartment.type}
                    onChange={(e) => setNewDepartment({
                      ...newDepartment,
                      type: e.target.value as typeof newDepartment.type
                    })}
                    className="select"
                    required
                  >
                    <option value="department">Department</option>
                    <option value="business_unit">Business Unit</option>
                    <option value="team">Team</option>
                    <option value="division">Division</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Parent Department</label>
                  <select
                    value={newDepartment.parent_id || ''}
                    onChange={(e) => setNewDepartment({
                      ...newDepartment,
                      parent_id: e.target.value || null
                    })}
                    className="select"
                  >
                    <option value="">No Parent (Top Level)</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}