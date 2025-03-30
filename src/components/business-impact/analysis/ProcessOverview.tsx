import React from 'react'
import type { BusinessProcess } from '../../../types/business-impact'
import clsx from 'clsx'

interface ProcessOverviewProps {
  process: BusinessProcess
}

export function ProcessOverview({ process }: ProcessOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{process.name}</h2>
            <p className="mt-1 text-gray-600">{process.description}</p>
          </div>
          <span className={clsx(
            'px-3 py-1 text-sm font-medium rounded-full',
            process.priority === 'critical' && 'bg-red-100 text-red-800',
            process.priority === 'high' && 'bg-orange-100 text-orange-800',
            process.priority === 'medium' && 'bg-yellow-100 text-yellow-800',
            process.priority === 'low' && 'bg-green-100 text-green-800'
          )}>
            {process.priority.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Recovery Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">RTO</span>
                <span className="font-medium">{process.rto}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">RPO</span>
                <span className="font-medium">{process.rpo}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">MTD</span>
                <span className="font-medium">{process.mtd}h</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Impact Scores</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Operational</span>
                <span className="font-medium">{process.operationalImpact?.score || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Reputational</span>
                <span className="font-medium">{process.reputationalImpact?.score || 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Financial Impact</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Daily</span>
                <span className="font-medium">
                  ${process.revenueImpact?.daily?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Monthly</span>
                <span className="font-medium">
                  ${process.revenueImpact?.monthly?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}