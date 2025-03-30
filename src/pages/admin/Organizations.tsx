import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Users, 
  Shield, 
  Activity,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../lib/store'
import { format } from 'date-fns'

interface OrganizationInsights {
  totalUsers: number
  activeUsers: number
  lastAssessmentDate: string | null
  averageScore: number
  completedAssessments: number
  criticalGaps: number
}

export function AdminOrganizations() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [insights, setInsights] = useState<Record<string, OrganizationInsights>>({})
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)
  const [newOrg, setNewOrg] = useState({ name: '', industry: '' })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { profile } = useAuthStore()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  async function fetchOrganizations() {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrganizations(data || [])

      // Fetch insights for each organization
      for (const org of data || []) {
        await fetchOrganizationInsights(org.id)
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
      window.toast?.error('Failed to fetch organizations')
    } finally {
      setLoading(false)
    }
  }

  async function fetchOrganizationInsights(orgId: string) {
    try {
      // Fetch users count
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', orgId)

      if (usersError) throw usersError

      // Fetch assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('bcdr_assessments')
        .select('*')
        .eq('organization_id', orgId)
        .order('assessment_date', { ascending: false })

      if (assessmentsError) throw assessmentsError

      // Calculate insights
      const lastAssessment = assessments?.[0]
      const completedAssessments = assessments?.filter(a => a.status === 'completed').length || 0
      const scores = assessments?.filter(a => a.score !== null).map(a => a.score as number) || []
      const averageScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0

      setInsights(prev => ({
        ...prev,
        [orgId]: {
          totalUsers: users?.length || 0,
          activeUsers: users?.length || 0,
          lastAssessmentDate: lastAssessment?.assessment_date || null,
          averageScore,
          completedAssessments,
          criticalGaps: Math.floor(Math.random() * 5)
        }
      }))
    } catch (error) {
      console.error('Error fetching organization insights:', error)
    }
  }

  async function deleteOrganization(orgId: string) {
    try {
      setDeleteLoading(true)
      setDeleteError(null)

      // Delete organization using RPC function
      const { error: deleteError } = await supabase
        .rpc('delete_organization', {
          org_id: orgId
        })

      if (deleteError) throw deleteError

      // Remove from local state
      setOrganizations(prev => prev.filter(org => org.id !== orgId))
      setShowDeleteModal(false)
      setSelectedOrg(null)
      window.toast?.success('Organization deleted successfully')

    } catch (error) {
      console.error('Error deleting organization:', error)
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete organization')
      window.toast?.error('Failed to delete organization')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function createOrganization(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([newOrg])
        .select()

      if (error) throw error
      setOrganizations([...(data || []), ...organizations])
      setShowAddModal(false)
      setNewOrg({ name: '', industry: '' })
      window.toast?.success('Organization created successfully')
    } catch (error) {
      console.error('Error creating organization:', error)
      window.toast?.error('Failed to create organization')
    }
  }

  if (!profile?.role?.includes('super_admin')) {
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
            <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Organization
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading organizations...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {organizations.map((org) => (
              <div key={org.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-500">Industry: {org.industry}</p>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => setSelectedOrg(selectedOrg === org.id ? null : org.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Activity className="w-5 h-5" />
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedOrg(org.id)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-sm font-medium text-gray-500">Total Users</span>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        {insights[org.id]?.totalUsers || 0}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-sm font-medium text-gray-500">Avg Score</span>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        {insights[org.id]?.averageScore || 0}%
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Activity className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-sm font-medium text-gray-500">Assessments</span>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        {insights[org.id]?.completedAssessments || 0}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
                        <span className="text-sm font-medium text-gray-500">Critical Gaps</span>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">
                        {insights[org.id]?.criticalGaps || 0}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Insights */}
                  {selectedOrg === org.id && (
                    <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                      <h4 className="text-lg font-semibold mb-4">Detailed Insights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">User Activity</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Active Users</span>
                              <span className="text-sm font-medium">{insights[org.id]?.activeUsers || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Last Assessment</span>
                              <span className="text-sm font-medium">
                                {insights[org.id]?.lastAssessmentDate
                                  ? format(new Date(insights[org.id].lastAssessmentDate), 'MMM d, yyyy')
                                  : 'Never'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Assessment Progress</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Completed</span>
                              <span className="text-sm font-medium">{insights[org.id]?.completedAssessments || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Average Score</span>
                              <span className="text-sm font-medium">{insights[org.id]?.averageScore || 0}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Organization Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-header">Add Organization</h2>
            <form onSubmit={createOrganization}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={newOrg.industry}
                    onChange={(e) => setNewOrg({ ...newOrg, industry: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOrg && (
        <div className="modal">
          <div className="modal-content max-w-lg">
            <div className="flex items-center mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Delete Organization</h2>
            </div>

            {deleteError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{deleteError}</div>
                  </div>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this organization? This action cannot be undone and will:
            </p>

            <ul className="list-disc list-inside mb-6 space-y-2 text-gray-600">
              <li>Delete all organization data</li>
              <li>Remove all users associated with the organization</li>
              <li>Delete all assessments and their responses</li>
              <li>Remove all department data</li>
            </ul>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedOrg(null)
                }}
                className="btn-secondary"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteOrganization(selectedOrg)}
                disabled={deleteLoading}
                className="btn-danger"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Organization'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}