import React from 'react'
import type { BusinessProcess } from '../../../types/business-impact'
import { 
  SUPPLY_CHAIN_CATEGORIES,
  CROSS_BORDER_TYPES,
  ENVIRONMENTAL_IMPACT_TYPES
} from './constants'

interface AdditionalImpactsProps {
  formData: Partial<BusinessProcess>
  setFormData: (data: Partial<BusinessProcess>) => void
}

export function AdditionalImpacts({ formData, setFormData }: AdditionalImpactsProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Additional Impact Areas
      </h3>

      {/* Supply Chain Impact */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Supply Chain Impact</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.supplyChainImpact?.dependencies?.map((dep, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="form-group">
                  <label className="form-label">Dependency Type</label>
                  <select
                    value={dep.type}
                    onChange={(e) => {
                      const newDeps = [...(formData.supplyChainImpact?.dependencies || [])]
                      newDeps[index] = { ...dep, type: e.target.value as any }
                      setFormData({
                        ...formData,
                        supplyChainImpact: {
                          ...formData.supplyChainImpact,
                          dependencies: newDeps
                        }
                      })
                    }}
                    className="select"
                  >
                    {SUPPLY_CHAIN_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mt-2">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={dep.name}
                    onChange={(e) => {
                      const newDeps = [...(formData.supplyChainImpact?.dependencies || [])]
                      newDeps[index] = { ...dep, name: e.target.value }
                      setFormData({
                        ...formData,
                        supplyChainImpact: {
                          ...formData.supplyChainImpact,
                          dependencies: newDeps
                        }
                      })
                    }}
                    className="input"
                  />
                </div>

                <div className="form-group mt-2">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={dep.location}
                    onChange={(e) => {
                      const newDeps = [...(formData.supplyChainImpact?.dependencies || [])]
                      newDeps[index] = { ...dep, location: e.target.value }
                      setFormData({
                        ...formData,
                        supplyChainImpact: {
                          ...formData.supplyChainImpact,
                          dependencies: newDeps
                        }
                      })
                    }}
                    className="input"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setFormData({
                ...formData,
                supplyChainImpact: {
                  ...formData.supplyChainImpact,
                  dependencies: [
                    ...(formData.supplyChainImpact?.dependencies || []),
                    {
                      type: 'critical_supplier',
                      name: '',
                      location: '',
                      alternativeSuppliers: 0,
                      leadTime: '',
                      contractValue: 0,
                      riskLevel: 'medium'
                    }
                  ]
                }
              })
            }}
            className="btn-secondary text-sm"
          >
            Add Supply Chain Dependency
          </button>
        </div>
      </div>

      {/* Cross-Border Operations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Cross-Border Operations</h4>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Regions</label>
            <input
              type="text"
              value={formData.crossBorderOperations?.regions?.join(', ') || ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  crossBorderOperations: {
                    ...formData.crossBorderOperations,
                    regions: e.target.value.split(',').map(r => r.trim())
                  }
                })
              }}
              className="input"
              placeholder="Enter comma-separated regions"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Operation Types</label>
            <div className="grid grid-cols-2 gap-4">
              {CROSS_BORDER_TYPES.map(type => (
                <label key={type.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.crossBorderOperations?.operationTypes?.includes(type.value)}
                    onChange={(e) => {
                      const types = formData.crossBorderOperations?.operationTypes || []
                      setFormData({
                        ...formData,
                        crossBorderOperations: {
                          ...formData.crossBorderOperations,
                          operationTypes: e.target.checked
                            ? [...types, type.value]
                            : types.filter(t => t !== type.value)
                        }
                      })
                    }}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-4">Environmental Impact</h4>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Impact Types</label>
            <div className="grid grid-cols-2 gap-4">
              {ENVIRONMENTAL_IMPACT_TYPES.map(type => (
                <label key={type.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.environmentalImpact?.types?.includes(type.value)}
                    onChange={(e) => {
                      const types = formData.environmentalImpact?.types || []
                      setFormData({
                        ...formData,
                        environmentalImpact: {
                          ...formData.environmentalImpact,
                          types: e.target.checked
                            ? [...types, type.value]
                            : types.filter(t => t !== type.value)
                        }
                      })
                    }}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mitigation Strategies</label>
            <textarea
              value={formData.environmentalImpact?.mitigationStrategies?.join('\n') || ''}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  environmentalImpact: {
                    ...formData.environmentalImpact,
                    mitigationStrategies: e.target.value.split('\n').filter(s => s.trim())
                  }
                })
              }}
              className="input"
              rows={3}
              placeholder="Enter mitigation strategies (one per line)"
            />
          </div>
        </div>
      </div>
    </div>
  )
}