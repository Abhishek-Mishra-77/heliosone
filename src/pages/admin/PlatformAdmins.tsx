import React, { useState, useEffect } from 'react'
import { Shield, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../lib/store'
import { format } from 'date-fns'
import clsx from 'clsx'

export function PlatformAdmins() {
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ 
    email: '', 
    full_name: '',
    password: ''
  })
  const [error, setError] = useState('')
  const { profile } = useAuthStore()

  useEffect(() => {
    fetchAdmins()
  }, [])

  async function fetchAdmins() {
    try {
      const { data, error } = await supabase
        .from('platform_admins')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (error) {
      console.error('Error fetching platform admins:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // Check if admin already exists
      const { data: existingAdmins, error: adminError } = await supabase
        .from('platform_admins')
        .select('*')
        .eq('email', newAdmin.email)

      if (adminError && adminError.code !== 'PGRST116') {
        throw adminError
      }

      if (existingAdmins && existingAdmins.length > 0) {
        setError('An admin with this email already exists')
        return
      }

      // Create auth user
      const { data: authUser, error: signUpError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
      })

      if (signUpError) throw signUpError

      if (!authUser.user) {
        throw new Error('Failed to create admin user')
      }

      // Create platform admin profile
      const { error: profileError } = await supabase
        .from('platform_admins')
        .insert([{
          id: authUser.user.id,
          email: newAdmin.email,
          full_name: newAdmin.full_name
        }])

      if (profileError) throw profileError

      // Refresh admins list
      await fetchAdmins()
      
      setShowAddModal(false)
      setNewAdmin({ 
        email: '', 
        full_name: '',
        password: ''
      })
    } catch (error) {
      console.error('Error creating platform admin:', error)
      setError('Failed to create platform admin. Please try again.')
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
            <Shield className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Platform Administrators</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Platform Admin
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading platform admins...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="font-medium">{admin.full_name}</td>
                    <td>{admin.email}</td>
                    <td>{format(new Date(admin.created_at), 'MMM d, yyyy')}</td>
                    <td>
                      <div className="flex space-x-3">
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to remove this platform admin?')) {
                              try {
                                const { error } = await supabase
                                  .from('platform_admins')
                                  .delete()
                                  .eq('id', admin.id)

                                if (error) throw error
                                await fetchAdmins()
                              } catch (error) {
                                console.error('Error removing platform admin:', error)
                                alert('Failed to remove platform admin')
                              }
                            }
                          }}
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

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2 className="modal-header">Add Platform Admin</h2>
            <form onSubmit={createAdmin}>
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
                    value={newAdmin.full_name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    className="input"
                    required
                    minLength={6}
                  />
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
                  {loading ? 'Creating Admin...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}