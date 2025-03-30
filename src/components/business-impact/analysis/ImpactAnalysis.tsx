import React from 'react'
import type { BusinessProcess } from '../../../types/business-impact'
import clsx from 'clsx'

interface ImpactAnalysisProps {
  processes: BusinessProcess[]
}

export function ImpactAnalysis({ processes }: ImpactAnalysisProps) {
  return (
    <div className="space-y-6">
      {/* Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Daily Impact</span>
              <span className="text-xl font-semibold text-indigo-600">
                ${processes.reduce((sum, p) => sum + (p.revenueImpact?.daily || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Impact</span>
              <span className="text-xl font-semibold text-indigo-600">
                ${(processes.reduce((sum, p) => sum + (p.revenueImpact?.daily || 0), 0) * 30).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Operational Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Score</span>
              <span className="text-xl font-semibold text-indigo-600">
                {Math.round(processes.reduce((sum, p) => sum + (p.operationalImpact?.score || 0), 0) / processes.length)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critical Processes</span>
              <span className="text-xl font-semibold text-indigo-600">
                {processes.filter(p => p.priority === 'critical').length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reputational Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Score</span>
              <span className="text-xl font-semibold text-indigo-600">
                {Math.round(processes.reduce((sum, p) => sum + (p.reputationalImpact?.score || 0), 0) / processes.length)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Process Impact Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Process Impact Analysis</h3>
        <div className="space-y-4">
          {processes.map(process => (
            <div key={process.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{process.name}</h4>
                  <span className={clsx(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    process.priority === 'critical' && "bg-red-100 text-red-800",
                    process.priority === 'high' && "bg-orange-100 text-orange-800",
                    process.priority === 'medium' && "bg-yellow-100 text-yellow-800",
                    process.priority === 'low' && "bg-green-100 text-green-800"
                  )}>
                    {process.priority.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Financial Impact</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Daily</span>
                      <span className="font-medium">${process.revenueImpact?.daily?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly</span>
                      <span className="font-medium">${process.revenueImpact?.monthly?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Operational Impact</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className="font-medium">{process.operationalImpact?.score || 0}%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {process.operationalImpact?.details || 'No details provided'}
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Reputational Impact</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Score</span>
                      <span className="font-medium">{process.reputationalImpact?.score || 0}%</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {process.reputationalImpact?.details || 'No details provided'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}