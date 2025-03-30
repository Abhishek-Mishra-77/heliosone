import React, { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface DepartmentUserModalProps {
  show: boolean
  departmentId: string
  onClose: () => void
  onSave: () => void
}

export function DepartmentUserModal({
  show,
  departmentId,
  onClose,
  onSave
}: DepartmentUserModalProps) {
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState('')
  const [role, setRole] = useState<'department_admin' | 'assessor' | 'viewer'>('viewer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (show) {
      fetchAvailableUsers()
    }
  }, [show, departmentId])

  async function fetchAvailableUsers() {
    try {
      setError(null)
      setLoading(true)
      console.log('Fetching available users for department:', departmentId)

      // Use the RPC function to get available users
      const { data, error } = await supabase
        .rpc('get_available_department_users', {
          dept_id: departmentId
        })

      if (error) throw error

      console.log('Available users:', data)
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching available users:', error)
      setError('Failed to fetch available users')
      window.toast?.error('Failed to fetch available users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) {
      setError('Please select a user')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('department_users')
        .insert({
          department_id: departmentId,
          user_id: selectedUser, // Now using the actual UUID
          role
        })

      if (error) throw error

      window.toast?.success('User added to department successfully')
      onSave()
    } catch (error) {
      console.error('Error adding user to department:', error)
      setError('Failed to add user to department')
      window.toast?.error('Failed to add user to department')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="flex items-center mb-6">
          <Users className="w-6 h-6 text-indigo-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Add Department Member</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="select"
              required
            >
              <option value="">Select a user</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
            {loading && (
              <p className="text-sm text-gray-500 mt-2">
                Loading available users...
              </p>
            )}
            {!loading && users.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No available users found in this organization
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="select"
              required
            >
              <option value="viewer">Viewer</option>
              <option value="assessor">Assessor</option>
              <option value="department_admin">Department Admin</option>
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !selectedUser}
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}