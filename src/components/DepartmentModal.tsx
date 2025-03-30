import React, { useState, useEffect } from 'react'
import { Building2, Plus, Info, X } from 'lucide-react'
import type { DepartmentTemplate } from './DepartmentTemplateModal'
import clsx from 'clsx'

interface DepartmentModalProps {
  show: boolean
  template?: DepartmentTemplate | null
  onClose: () => void
  onSave: (department: any) => void
}

export function DepartmentModal({
  show,
  template,
  onClose,
  onSave
}: DepartmentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'department',
    description: '',
    parent_id: null as string | null
  })

  // Update form when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        code: '',
        type: template.type,
        description: template.description,
        parent_id: null
      })
    }
  }, [template])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
        {/* Header - Fixed */}
        <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Building2 className="w-6 h-6 text-indigo-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {template ? `Add ${template.name}` : 'Add Custom Department'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {template?.description || 'Create a new department in your organization'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {template && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex">
                  <Info className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-indigo-900">Template Information</h3>
                    <p className="mt-1 text-sm text-indigo-800">
                      This department will be configured based on {template.name} best practices.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {template.standardRefs.map(ref => (
                        <span 
                          key={ref}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="form-group">
                <label className="form-label">Department Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="input"
                  placeholder="Optional unique identifier"
                />
                <p className="form-hint">
                  A unique code to identify this department (e.g., IT-001, FIN-001)
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Department Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    type: e.target.value as typeof formData.type
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
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                  required
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Department
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}