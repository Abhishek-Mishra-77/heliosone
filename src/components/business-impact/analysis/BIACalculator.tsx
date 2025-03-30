import React, { useState, useEffect } from 'react'
import { DollarSign, Clock, AlertTriangle, TrendingUp, Building2, Users } from 'lucide-react'
import type { BusinessProcess } from '../../../types/business-impact'
import clsx from 'clsx'

interface BIACalculatorProps {
  processes: BusinessProcess[]
}

interface ImpactScenario {
  hours: number
  financialImpact: number
  operationalImpact: number
  reputationalImpact: number
  dependencies: string[]
  affectedStakeholders: string[]
}

export function BIACalculator({ processes }: BIACalculatorProps) {
  const [selectedProcess, setSelectedProcess] = useState<BusinessProcess | null>(null)
  const [downtimeHours, setDowntimeHours] = useState(4)
  const [scenario, setScenario] = useState<ImpactScenario | null>(null)

  useEffect(() => {
    if (selectedProcess) {
      calculateImpact(downtimeHours)
    }
  }, [selectedProcess, downtimeHours])

  const calculateImpact = (hours: number) => {
    if (!selectedProcess) return

    // Calculate financial impact based on downtime
    const hourlyRevenueLoss = selectedProcess.revenueImpact.daily / 24
    const financialImpact = hourlyRevenueLoss * hours

    // Calculate operational impact score (0-100)
    const operationalImpact = Math.min(
      100,
      (hours / selectedProcess.mtd) * 100
    )

    // Calculate reputational impact score (0-100)
    const reputationalImpact = Math.min(
      100,
      (hours / (selectedProcess.mtd * 1.5)) * 100
    )

    // Get affected dependencies
    const dependencies = [
      ...(selectedProcess.applications?.map(app => app.name) || []),
      ...(selectedProcess.infrastructureDependencies?.map(dep => dep.name) || []),
      ...(selectedProcess.externalDependencies?.map(dep => dep.name) || [])
    ]

    setScenario({
      hours,
      financialImpact,
      operationalImpact,
      reputationalImpact,
      dependencies,
      affectedStakeholders: selectedProcess.stakeholders || []
    })
  }

  return (
    <div className="space-y-6">
      {/* Process Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Business Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {processes.map(process => (
            <button
              key={process.id}
              onClick={() => setSelectedProcess(process)}
              className={clsx(
                'p-4 rounded-lg border-2 transition-all duration-200 text-left',
                selectedProcess?.id === process.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{process.name}</h4>
                <span className={clsx(
                  'px-2 py-1 text-xs font-medium rounded-full',
                  process.priority === 'critical' && 'bg-red-100 text-red-800',
                  process.priority === 'high' && 'bg-orange-100 text-orange-800',
                  process.priority === 'medium' && 'bg-yellow-100 text-yellow-800',
                  process.priority === 'low' && 'bg-green-100 text-green-800'
                )}>
                  {process.priority.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                RTO: {process.rto}h | RPO: {process.rpo}h | MTD: {process.mtd}h
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedProcess && (
        <>
          {/* Downtime Adjustment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjust Downtime</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min={1}
                  max={selectedProcess.mtd * 2}
                  value={downtimeHours}
                  onChange={(e) => setDowntimeHours(parseInt(e.target.value))}
                  className="flex-1"
                />
                <div className="w-24 text-right">
                  <span className="text-lg font-semibold text-gray-900">{downtimeHours}h</span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>RTO: {selectedProcess.rto}h</span>
                <span>MTD: {selectedProcess.mtd}h</span>
              </div>
            </div>
          </div>

          {/* Impact Analysis */}
          {scenario && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Financial Impact */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Financial Impact</h4>
                    </div>
                    <span className="text-lg font-semibold text-green-600">
                      ${scenario.financialImpact.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Estimated revenue loss over {scenario.hours} hours
                  </div>
                </div>

                {/* Operational Impact */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Operational Impact</h4>
                    </div>
                    <span className="text-lg font-semibold text-blue-600">
                      {Math.round(scenario.operationalImpact)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={clsx(
                        "h-full rounded-full transition-all duration-300",
                        scenario.operationalImpact >= 80 ? "bg-red-500" :
                        scenario.operationalImpact >= 60 ? "bg-orange-500" :
                        scenario.operationalImpact >= 40 ? "bg-yellow-500" :
                        "bg-green-500"
                      )}
                      style={{ width: `${scenario.operationalImpact}%` }}
                    />
                  </div>
                </div>

                {/* Reputational Impact */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Reputational Impact</h4>
                    </div>
                    <span className="text-lg font-semibold text-orange-600">
                      {Math.round(scenario.reputationalImpact)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={clsx(
                        "h-full rounded-full transition-all duration-300",
                        scenario.reputationalImpact >= 80 ? "bg-red-500" :
                        scenario.reputationalImpact >= 60 ? "bg-orange-500" :
                        scenario.reputationalImpact >= 40 ? "bg-yellow-500" :
                        "bg-green-500"
                      )}
                      style={{ width: `${scenario.reputationalImpact}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dependencies & Stakeholders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Affected Dependencies */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-3">
                    <Building2 className="w-5 h-5 text-gray-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Affected Dependencies</h4>
                  </div>
                  <div className="space-y-2">
                    {scenario.dependencies.map((dep, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                        {dep}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stakeholder Impact */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-3">
                    <Users className="w-5 h-5 text-gray-600 mr-2" />
                    <h4 className="font-medium text-gray-900">Affected Stakeholders</h4>
                  </div>
                  <div className="space-y-2">
                    {scenario.affectedStakeholders.map((stakeholder, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                        {stakeholder}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}