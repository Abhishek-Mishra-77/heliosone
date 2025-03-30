import React from 'react'
import { FileSearch, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { BusinessProcess } from '../../types/business-impact'
import clsx from 'clsx'

interface OverviewMetricsProps {
  processes: BusinessProcess[]
}

export function OverviewMetrics({ processes }: OverviewMetricsProps) {
  const stats = {
    totalProcesses: processes.length,
    criticalProcesses: processes.filter(p => p.priority === 'critical').length,
    highPriorityProcesses: processes.filter(p => p.priority === 'high').length,
    mediumPriorityProcesses: processes.filter(p => p.priority === 'medium').length,
    lowPriorityProcesses: processes.filter(p => p.priority === 'low').length,
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileSearch className="w-5 h-5 text-indigo-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-700">Process Overview</h3>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-2xl font-bold text-indigo-600">
            {stats.totalProcesses}
          </span>
          <Link 
            to="/bcdr/business-impact/analysis"
            className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View Analysis
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {['critical', 'high', 'medium', 'low'].map(priority => {
          const count = processes.filter(p => p.priority === priority).length
          const percentage = processes.length > 0 
            ? Math.round((count / processes.length) * 100) 
            : 0
          
          return (
            <div key={priority}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize">{priority}</span>
                <span>{count} ({percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={clsx(
                    "h-full rounded-full transition-all duration-300",
                    priority === 'critical' && "bg-red-500",
                    priority === 'high' && "bg-orange-500",
                    priority === 'medium' && "bg-yellow-500",
                    priority === 'low' && "bg-green-500"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}