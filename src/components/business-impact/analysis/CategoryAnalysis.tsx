import React from 'react'
import { Building2, ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { BusinessProcess } from '../../../types/business-impact'
import clsx from 'clsx'

interface CategoryAnalysisProps {
  processes: BusinessProcess[]
}

export function CategoryAnalysis({ processes }: CategoryAnalysisProps) {
  const stats = {
    totalProcesses: processes.length,
    criticalProcesses: processes.filter(p => p.priority === 'critical').length,
    highPriorityProcesses: processes.filter(p => p.priority === 'high').length,
    mediumPriorityProcesses: processes.filter(p => p.priority === 'medium').length,
    lowPriorityProcesses: processes.filter(p => p.priority === 'low').length,
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Category Analysis</h2>
        <Link 
          to="/bcdr/business-impact" 
          className="text-indigo-600 hover:text-indigo-700 flex items-center"
        >
          View Details
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
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