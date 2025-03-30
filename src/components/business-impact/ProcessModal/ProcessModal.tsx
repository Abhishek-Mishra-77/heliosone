import React, { useState } from 'react'
import type { BusinessProcess } from '../../../types/business-impact'
import { BasicInformation } from './BasicInformation'
import { DependencyMapping } from './DependencyMapping'
import { DataRequirements } from './DataRequirements'
import { AdditionalImpacts } from './AdditionalImpacts'
import { v4 as uuidv4 } from 'uuid'

interface ProcessModalProps {
  show: boolean
  process?: BusinessProcess
  onClose: () => void
  onSave: (process: BusinessProcess) => void
}

export function ProcessModal({
  show,
  process,
  onClose,
  onSave
}: ProcessModalProps) {
  const [formData, setFormData] = useState<Partial<BusinessProcess>>(
    process || {
      id: uuidv4(),
      priority: 'medium',
      dependencies: [],
      stakeholders: [],
      criticalPeriods: [],
      costs: {
        direct: 0,
        indirect: 0,
        recovery: 0
      },
      applications: [],
      infrastructureDependencies: [],
      externalDependencies: [],
      dataRequirements: {
        classification: 'internal',
        backupFrequency: 'daily',
        retentionPeriod: '30 days'
      },
      supplyChainImpact: {
        dependencies: [],
        score: 0,
        details: ''
      },
      crossBorderOperations: {
        regions: [],
        operationTypes: [],
        regulatoryRequirements: [],
        score: 0,
        details: ''
      },
      environmentalImpact: {
        types: [],
        metrics: {},
        score: 0,
        details: '',
        mitigationStrategies: []
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData as BusinessProcess)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8">
        <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            {process ? "Edit Process" : "Add Process"}
          </h2>
        </div>

        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <BasicInformation 
              formData={formData} 
              setFormData={setFormData} 
            />

            <DependencyMapping 
              formData={formData} 
              setFormData={setFormData} 
            />

            <DataRequirements 
              formData={formData} 
              setFormData={setFormData} 
            />

            <AdditionalImpacts
              formData={formData}
              setFormData={setFormData}
            />

            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {process ? "Update Process" : "Create Process"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}