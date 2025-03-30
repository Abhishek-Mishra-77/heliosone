import React from 'react'
import type { BusinessProcess } from '../../../types/business-impact'

interface BasicInformationProps {
  formData: Partial<BusinessProcess>
  setFormData: (data: Partial<BusinessProcess>) => void
}

export function BasicInformation({ formData, setFormData }: BasicInformationProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Basic Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="form-group">
          <label className="form-label">Process Name</label>
          <input
            type="text"
            value={formData.name || ""}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: e.target.value as BusinessProcess["priority"]
              })
            }
            className="select"
            required
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="form-group md:col-span-2">
          <label className="form-label">Description</label>
          <textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="input"
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Process Owner</label>
          <input
            type="text"
            value={formData.owner || ""}
            onChange={(e) =>
              setFormData({ ...formData, owner: e.target.value })
            }
            className="input"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <input
            type="text"
            value={formData.category || ""}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="input"
            required
          />
        </div>
      </div>
    </div>
  )
}