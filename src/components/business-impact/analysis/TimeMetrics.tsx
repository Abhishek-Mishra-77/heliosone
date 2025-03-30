import React from 'react'
import { Clock } from 'lucide-react'
import type { BusinessProcess } from '../../../types/business-impact'
import clsx from 'clsx'

interface TimeMetricsProps {
  processes: BusinessProcess[]
}

export function TimeMetrics({ processes }: TimeMetricsProps) {
  const avgRTO = Math.round(processes.reduce((sum, p) => sum + p.rto, 0) / processes.length)
  const avgRPO = Math.round(processes.reduce((sum, p) => sum + p.rpo, 0) / processes.length)
  const avgMTD = Math.round(processes.reduce((sum, p) => sum + p.mtd, 0) / processes.length)

  const criticalProcessStats = {
    rto: Math.round(processes.filter(p => p.priority === 'critical').reduce((sum, p) => sum + p.rto, 0) / processes.filter(p => p.priority === 'critical').length),
    rpo: Math.round(processes.filter(p => p.priority === 'critical').reduce((sum, p) => sum + p.rpo, 0) / processes.filter(p => p.priority === 'critical').length),
    mtd: Math.round(processes.filter(p => p.priority === 'critical').reduce((sum, p) => sum + p.mtd, 0) / processes.filter(p => p.priority === 'critical').length)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recovery Time Objective (RTO)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average RTO</span>
              <span className="text-xl font-semibold text-indigo-600">
                {avgRTO}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critical Processes</span>
              <span className="text-sm text-gray-600">
                {criticalProcessStats.rto}h
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recovery Point Objective (RPO)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average RPO</span>
              <span className="text-xl font-semibold text-indigo-600">
                {avgRPO}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critical Processes</span>
              <span className="text-sm text-gray-600">
                {criticalProcessStats.rpo}h
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Maximum Tolerable Downtime (MTD)</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average MTD</span>
              <span className="text-xl font-semibold text-indigo-600">
                {avgMTD}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critical Processes</span>
              <span className="text-sm text-gray-600">
                {criticalProcessStats.mtd}h
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Process-specific metrics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Process Time Metrics</h3>
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
                <div className="flex space-x-4">
                  <div className="text-sm">
                    <span className="text-gray-500">RTO: </span>
                    <span className="font-medium">{process.rto}h</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">RPO: </span>
                    <span className="font-medium">{process.rpo}h</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">MTD: </span>
                    <span className="font-medium">{process.mtd}h</span>
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