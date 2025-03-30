import React, { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, Upload } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../lib/store'
import { format } from 'date-fns'
import { UserImportModal } from '../../components/admin/UserImportModal'
import clsx from 'clsx'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  organization_id: string
  created_at: string
  organizations?: {
    name: string
  }
}

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [newUser, setNewUser] = useState({ 
    email: '', 
    role: 'user', // Default role
    organization_id: '',
    full_name: '',
    password: ''
  })
  const [error, setError] = useState('')
  const { profile } = useAuthStore()

  useEffect(() => {
    fetchUsers()
    fetchOrganizations()
  }, [])

  async function fetchUsers() {
    try {
      // Get all platform admin IDs first
      const { data: platformAdmins, error: adminError } = await supabase
        .from('platform_admins')
        .select('id, email')

      if (adminError) throw adminError

      // Get users excluding platform admins
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Filter out platform admins and super_admin roles from the results
      const filteredUsers = data?.filter(user => 
        !platformAdmins?.some(admin => admin.id === user.id) &&
        !platformAdmins?.some(admin => admin.email === user.email) &&
        user.role !== 'super_admin'
      ) || []

      setUsers(filteredUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      window.toast?.error('Failed to fetch users')
    }
  }

  async function fetchOrganizations() {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('name')

      if (error) throw error
      setOrganizations(data || [])
    } catch (error) {
      console.error('Error fetching organizations:', error)
      window.toast?.error('Failed to fetch organizations')
    } finally {
      setLoading(false)
    }
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Validate required fields
      if (!newUser.email || !newUser.password || !newUser.organization_id || !newUser.role) {
        setError('All fields are required')
        return
      }

      // Check if user already exists
      const { data: existingUsers, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', newUser.email)

      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }

      if (existingUsers && existingUsers.length > 0) {
        setError('A user with this email already exists')
        return
      }

      // Check if email is already used by a platform admin
      const { data: existingAdmin, error: adminError } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('email', newUser.email)

      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError
      }

      if (existingAdmin && existingAdmin.length > 0) {
        setError('This email is already registered as a platform admin')
        return
      }

      // Create auth user with metadata
      const { data: authUser, error: signUpError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            role: newUser.role,
            organization_id: newUser.organization_id
          }
        }
      })

      if (signUpError) throw signUpError

      if (!authUser.user) {
        throw new Error('Failed to create user')
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authUser.user.id,
          email: newUser.email,
          role: newUser.role,
          organization_id: newUser.organization_id,
          full_name: newUser.full_name
        }])

      if (profileError) throw profileError

      // Refresh users list
      await fetchUsers()
      
      setShowAddModal(false)
      setNewUser({ 
        email: '', 
        role: 'user',
        organization_id: '',
        full_name: '',
        password: ''
      })
      window.toast?.success('User created successfully')
    } catch (error) {
      console.error('Error creating user:', error)
      setError('Failed to create user. Please try again.')
      window.toast?.error('Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  async function deleteUser(userId: string) {
    try {
      setLoading(true)

      // First, check if user is a platform admin
      const { data: platformAdmin } = await supabase
        .from('platform_admins')
        .select('id')
        .eq('id', userId)
        .single()

      if (platformAdmin) {
        window.toast?.error('Cannot delete platform admin users from this interface')
        return
      }

      // First, delete any department assignments
      const { error: deptError } = await supabase
        .from('department_users')
        .delete()
        .eq('user_id', userId)

      if (deptError) throw deptError

      // Delete user profile
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (userError) throw userError

      // Delete auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) throw authError

      // Refresh users list
      await fetchUsers()
      window.toast?.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      window.toast?.error('Failed to delete user')
    } finally {
      setLoading(false)
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
            <Users className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-secondary"
            >
              <Upload className="w-5 h-5 mr-2" />
              Import Users
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Organization</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="font-medium">{user.full_name}</td>
                    <td>{user.organizations?.name}</td>
                    <td>
                      <span className="badge-info">
                        {user.role}
                      </span>
                    </td>
                    <td>{format(new Date(user.created_at), 'MMM d, yyyy')}</td>
                    <td>
                      <div className="flex space-x-3">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                              deleteUser(user.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-header">Add User</h2>
            <form onSubmit={createUser}>
              {error && (
                <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="input"
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Organization</label>
                  <select
                    value={newUser.organization_id}
                    onChange={(e) => setNewUser({ ...newUser, organization_id: e.target.value })}
                    className="select"
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="select"
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating User...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UserImportModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        onComplete={fetchUsers}
      />
    </div>
  )
}