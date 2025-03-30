import React from 'react'
import type { BusinessProcess } from '../../../types/business-impact'
import { DATA_CLASSIFICATIONS } from './constants'

interface DataRequirementsProps {
  formData: Partial<BusinessProcess>
  setFormData: (data: Partial<BusinessProcess>) => void
}

export function DataRequirements({ formData, setFormData }: DataRequirementsProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Data Requirements
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Data Classification</label>
          <select
            value={formData.dataRequirements?.classification}
            onChange={(e) =>
              setFormData({
                ...formData,
                dataRequirements: {
                  ...formData.dataRequirements!,
                  classification: e.target.value as any
                }
              })
            }
            className="select"
            required
          >
            {DATA_CLASSIFICATIONS.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Backup Frequency</label>
          <input
            type="text"
            value={formData.dataRequirements?.backupFrequency}
            onChange={(e) =>
              setFormData({
                ...formData,
                dataRequirements: {
                  ...formData.dataRequirements!,
                  backupFrequency: e.target.value
                }
              })
            }
            className="input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Retention Period</label>
          <input
            type="text"
            value={formData.dataRequirements?.retentionPeriod}
            onChange={(e) =>
              setFormData({
                ...formData,
                dataRequirements: {
                  ...formData.dataRequirements!,
                  retentionPeriod: e.target.value
                }
              })
            }
            className="input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Compliance Requirements</label>
          <input
            type="text"
            value={formData.dataRequirements?.compliance?.join(", ") || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                dataRequirements: {
                  ...formData.dataRequirements!,
                  compliance: e.target.value.split(",").map((s) => s.trim())
                }
              })
            }
            className="input"
            placeholder="Enter comma-separated compliance requirements"
          />
        </div>
      </div>
    </div>
  )
}