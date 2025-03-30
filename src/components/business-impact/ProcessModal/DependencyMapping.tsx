import React from 'react'
import { X } from 'lucide-react'
import type { BusinessProcess } from '../../../types/business-impact'
import { 
  APPLICATION_TYPES, 
  INFRASTRUCTURE_TYPES, 
  EXTERNAL_DEPENDENCY_TYPES 
} from './constants'

interface DependencyMappingProps {
  formData: Partial<BusinessProcess>
  setFormData: (data: Partial<BusinessProcess>) => void
}

export function DependencyMapping({ formData, setFormData }: DependencyMappingProps) {
  const removeApplication = (index: number) => {
    const newApps = [...(formData.applications || [])]
    newApps.splice(index, 1)
    setFormData({ ...formData, applications: newApps })
  }

  const removeInfrastructure = (index: number) => {
    const newInfra = [...(formData.infrastructureDependencies || [])]
    newInfra.splice(index, 1)
    setFormData({ ...formData, infrastructureDependencies: newInfra })
  }

  const removeExternalDependency = (index: number) => {
    const newDeps = [...(formData.externalDependencies || [])]
    newDeps.splice(index, 1)
    setFormData({ ...formData, externalDependencies: newDeps })
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Dependency Mapping
      </h3>

      {/* Applications */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">Applications</h4>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                applications: [
                  ...(prev.applications || []),
                  {
                    name: "",
                    type: "internal",
                    criticality: "medium",
                    description: ""
                  }
                ]
              }))
            }}
            className="btn-secondary text-sm"
          >
            Add Application
          </button>
        </div>
        <div className="space-y-4">
          {formData.applications?.map((app, index) => (
            <div
              key={index}
              className="relative grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <button
                type="button"
                onClick={() => removeApplication(index)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                title="Remove application"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="form-group">
                <label className="form-label">Application Name</label>
                <input
                  type="text"
                  value={app.name}
                  onChange={(e) => {
                    const newApps = [...(formData.applications || [])]
                    newApps[index] = { ...app, name: e.target.value }
                    setFormData({ ...formData, applications: newApps })
                  }}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  value={app.type}
                  onChange={(e) => {
                    const newApps = [...(formData.applications || [])]
                    newApps[index] = { ...app, type: e.target.value as any }
                    setFormData({ ...formData, applications: newApps })
                  }}
                  className="select"
                  required
                >
                  {APPLICATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Criticality</label>
                <select
                  value={app.criticality}
                  onChange={(e) => {
                    const newApps = [...(formData.applications || [])]
                    newApps[index] = {
                      ...app,
                      criticality: e.target.value as any
                    }
                    setFormData({ ...formData, applications: newApps })
                  }}
                  className="select"
                  required
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              {(app.type === "external" || app.type === "cloud") && (
                <div className="form-group">
                  <label className="form-label">Provider</label>
                  <input
                    type="text"
                    value={app.provider || ""}
                    onChange={(e) => {
                      const newApps = [...(formData.applications || [])]
                      newApps[index] = { ...app, provider: e.target.value }
                      setFormData({ ...formData, applications: newApps })
                    }}
                    className="input"
                    required
                  />
                </div>
              )}
              <div className="form-group md:col-span-2">
                <label className="form-label">Description</label>
                <textarea
                  value={app.description || ""}
                  onChange={(e) => {
                    const newApps = [...(formData.applications || [])]
                    newApps[index] = { ...app, description: e.target.value }
                    setFormData({ ...formData, applications: newApps })
                  }}
                  className="input"
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure Dependencies */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">
            Infrastructure Dependencies
          </h4>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                infrastructureDependencies: [
                  ...(prev.infrastructureDependencies || []),
                  {
                    name: "",
                    type: "server",
                    description: ""
                  }
                ]
              }))
            }}
            className="btn-secondary text-sm"
          >
            Add Infrastructure
          </button>
        </div>
        <div className="space-y-4">
          {formData.infrastructureDependencies?.map((infra, index) => (
            <div
              key={index}
              className="relative grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <button
                type="button"
                onClick={() => removeInfrastructure(index)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                title="Remove infrastructure"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={infra.name}
                  onChange={(e) => {
                    const newInfra = [
                      ...(formData.infrastructureDependencies || [])
                    ]
                    newInfra[index] = { ...infra, name: e.target.value }
                    setFormData({
                      ...formData,
                      infrastructureDependencies: newInfra
                    })
                  }}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  value={infra.type}
                  onChange={(e) => {
                    const newInfra = [
                      ...(formData.infrastructureDependencies || [])
                    ]
                    newInfra[index] = { ...infra, type: e.target.value as any }
                    setFormData({
                      ...formData,
                      infrastructureDependencies: newInfra
                    })
                  }}
                  className="select"
                  required
                >
                  {INFRASTRUCTURE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">Description</label>
                <textarea
                  value={infra.description}
                  onChange={(e) => {
                    const newInfra = [
                      ...(formData.infrastructureDependencies || [])
                    ]
                    newInfra[index] = { ...infra, description: e.target.value }
                    setFormData({
                      ...formData,
                      infrastructureDependencies: newInfra
                    })
                  }}
                  className="input"
                  rows={2}
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* External Dependencies */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">
            External Dependencies
          </h4>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                externalDependencies: [
                  ...(prev.externalDependencies || []),
                  {
                    name: "",
                    type: "vendor",
                    provider: "",
                    description: ""
                  }
                ]
              }))
            }}
            className="btn-secondary text-sm"
          >
            Add External Dependency
          </button>
        </div>
        <div className="space-y-4">
          {formData.externalDependencies?.map((dep, index) => (
            <div
              key={index}
              className="relative grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <button
                type="button"
                onClick={() => removeExternalDependency(index)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                title="Remove external dependency"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={dep.name}
                  onChange={(e) => {
                    const newDeps = [...(formData.externalDependencies || [])]
                    newDeps[index] = { ...dep, name: e.target.value }
                    setFormData({ ...formData, externalDependencies: newDeps })
                  }}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  value={dep.type}
                  onChange={(e) => {
                    const newDeps = [...(formData.externalDependencies || [])]
                    newDeps[index] = { ...dep, type: e.target.value as any }
                    setFormData({ ...formData, externalDependencies: newDeps })
                  }}
                  className="select"
                  required
                >
                  {EXTERNAL_DEPENDENCY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Provider</label>
                <input
                  type="text"
                  value={dep.provider}
                  onChange={(e) => {
                    const newDeps = [...(formData.externalDependencies || [])]
                    newDeps[index] = { ...dep, provider: e.target.value }
                    setFormData({ ...formData, externalDependencies: newDeps })
                  }}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contract Reference</label>
                <input
                  type="text"
                  value={dep.contract || ""}
                  onChange={(e) => {
                    const newDeps = [...(formData.externalDependencies || [])]
                    newDeps[index] = { ...dep, contract: e.target.value }
                    setFormData({ ...formData, externalDependencies: newDeps })
                  }}
                  className="input"
                />
              </div>
              <div className="form-group md:col-span-2">
                <label className="form-label">Description</label>
                <textarea
                  value={dep.description}
                  onChange={(e) => {
                    const newDeps = [...(formData.externalDependencies || [])]
                    newDeps[index] = { ...dep, description: e.target.value }
                    setFormData({ ...formData, externalDependencies: newDeps })
                  }}
                  className="input"
                  rows={2}
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}