import React from 'react'
import clsx from 'clsx'
import type { BusinessProcess } from '../../types/business-impact'

interface CostAnalysisProps {
  processes: BusinessProcess[]
  onUpdateProcess: (index: number, process: BusinessProcess) => void
}

const HOURLY_RATE = 150 // Standard hourly rate for calculations

export function CostAnalysis({ processes, onUpdateProcess }: CostAnalysisProps) {
  const calculateDirectCosts = (process: BusinessProcess) => {
    const dailyRevenue = process.revenueImpact.daily
    const laborCosts = process.rto * HOURLY_RATE * getTeamSize(process.priority)
    const recoveryOverhead = dailyRevenue * 0.15
    const slaImpact = dailyRevenue * 0.20
    const regulatoryImpact = dailyRevenue * 0.30

    return {
      laborCosts,
      recoveryOverhead,
      slaImpact,
      regulatoryImpact,
      total: laborCosts + recoveryOverhead + slaImpact + regulatoryImpact
    }
  }

  const calculateIndirectCosts = (process: BusinessProcess) => {
    const reputationalMultiplier = getReputationalMultiplier(process.priority)
    return process.revenueImpact.daily * reputationalMultiplier
  }

  const getTeamSize = (priority: string) => {
    switch (priority) {
      case 'critical': return 8
      case 'high': return 5
      case 'medium': return 3
      case 'low': return 1
      default: return 1
    }
  }

  const getReputationalMultiplier = (priority: string) => {
    switch (priority) {
      case 'critical': return 0.50
      case 'high': return 0.30
      case 'medium': return 0.15
      case 'low': return 0.05
      default: return 0.05
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Cost Impact Analysis</h2>
        <p className="mt-1 text-sm text-gray-600">
          Calculate direct and indirect costs associated with process disruption
        </p>
      </div>

      <div className="space-y-8">
        {processes.map((process) => {
          const directCosts = calculateDirectCosts(process)
          const indirectCosts = calculateIndirectCosts(process)
          const totalCost = directCosts.total + indirectCosts

          return (
            <div key={process.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{process.name}</h3>
                  <p className="text-sm text-gray-500">{process.description}</p>
                </div>
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

              <div className="space-y-6">
                {/* Direct Costs */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Direct Costs</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Labor Costs</span>
                        <span className="font-medium">${directCosts.laborCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Recovery Overhead</span>
                        <span className="font-medium">${directCosts.recoveryOverhead.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">SLA Impact</span>
                        <span className="font-medium">${directCosts.slaImpact.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Regulatory Impact</span>
                        <span className="font-medium">${directCosts.regulatoryImpact.toLocaleString()}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center font-medium">
                          <span className="text-gray-900">Total Direct Costs</span>
                          <span className="text-indigo-600">${directCosts.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Indirect Costs */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Indirect Costs</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reputational Impact</span>
                        <span className="font-medium">${indirectCosts.toLocaleString()}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center font-medium">
                          <span className="text-gray-900">Total Indirect Costs</span>
                          <span className="text-indigo-600">${indirectCosts.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Impact */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-indigo-900">Total Cost Impact</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      ${totalCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}