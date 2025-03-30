import React from 'react'
import { FileSearch, Edit2, Trash2, Plus, Building2 } from 'lucide-react'
import clsx from 'clsx'
import type { BusinessProcess } from '../../types/business-impact'

interface ProcessAssessmentProps {
  processes: BusinessProcess[]
  onAddProcess: () => void
  onEditProcess: (process: BusinessProcess) => void
  onDeleteProcess: (processId: string) => void
  onShowTemplateModal: () => void
}

export function ProcessAssessment({
  processes,
  onAddProcess,
  onEditProcess,
  onDeleteProcess,
  onShowTemplateModal
}: ProcessAssessmentProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Business Process Assessment</h2>
        <div className="flex space-x-4">
          <button
            onClick={onShowTemplateModal}
            className="btn-secondary"
          >
            <Building2 className="w-5 h-5 mr-2" />
            Load Template
          </button>
          <button
            onClick={onAddProcess}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Process
          </button>
        </div>
      </div>

      {processes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <FileSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Processes Added</h3>
          <p className="text-gray-500 mb-4">Start by adding processes or loading a template</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onShowTemplateModal}
              className="btn-primary"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Load Template
            </button>
            <button
              onClick={onAddProcess}
              className="btn-secondary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Process
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {processes.map((process) => (
            <div
              key={process.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{process.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{process.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={clsx(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      process.priority === 'critical' && "bg-red-100 text-red-800",
                      process.priority === 'high' && "bg-orange-100 text-orange-800",
                      process.priority === 'medium' && "bg-yellow-100 text-yellow-800",
                      process.priority === 'low' && "bg-green-100 text-green-800"
                    )}>
                      {process.priority.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      RTO: {process.rto}h
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      RPO: {process.rpo}h
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditProcess(process)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this process?')) {
                        onDeleteProcess(process.id)
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}