import React from 'react'
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { BusinessProcess } from '../../../types/business-impact'
import clsx from 'clsx'

interface ImpactMetricsProps {
  processes: BusinessProcess[]
}

export function ImpactMetrics({ processes }: ImpactMetricsProps) {
  const totalDailyRevenue = processes.reduce((sum, p) => sum + (p.revenueImpact?.daily || 0), 0)
  const avgOperationalScore = Math.round(processes.reduce((sum, p) => sum + (p.operationalImpact?.score || 0), 0) / processes.length)
  const avgReputationalScore = Math.round(processes.reduce((sum, p) => sum + (p.reputationalImpact?.score || 0), 0) / processes.length)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Impact</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Daily Impact</span>
            <span className="text-xl font-semibold text-indigo-600">
              ${totalDailyRevenue.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Average Monthly Impact</span>
            <span className="text-xl font-semibold text-indigo-600">
              ${(totalDailyRevenue * 30).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Operational Impact</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Average Impact Score</span>
            <span className="text-xl font-semibold text-indigo-600">
              {avgOperationalScore}%
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
            <span className="text-sm text-gray-600">Average Impact Score</span>
            <span className="text-xl font-semibold text-indigo-600">
              {avgReputationalScore}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}