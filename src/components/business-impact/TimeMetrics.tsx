import React, { useState } from 'react'
import { Info } from 'lucide-react'
import clsx from 'clsx'
import type { BusinessProcess } from '../../types/business-impact'

interface TimeMetricsProps {
  processes: BusinessProcess[]
  onUpdateProcess: (index: number, process: BusinessProcess) => void
}

interface RecoveryResponse {
  id: string
  response: string | number
}

// Recovery assessment questions
const RECOVERY_QUESTIONS = [
  {
    id: 'regulatory_requirements',
    question: 'Are there any regulatory requirements for recovery time?',
    type: 'select',
    options: [
      { value: 2, label: 'Yes - Strict (2 hours)', weight: 0.3 },
      { value: 4, label: 'Yes - Moderate (4 hours)', weight: 0.3 },
      { value: 8, label: 'Yes - Flexible (8 hours)', weight: 0.3 },
      { value: 24, label: 'No specific requirements', weight: 0.3 }
    ]
  },
  {
    id: 'data_criticality',
    question: 'How critical is the data for this process?',
    type: 'select',
    options: [
      { value: 0.25, label: 'Critical - Requires near real-time backup', weight: 0.25 },
      { value: 1, label: 'High - Hourly backup needed', weight: 0.25 },
      { value: 4, label: 'Medium - Few hours of data loss acceptable', weight: 0.25 },
      { value: 24, label: 'Low - Daily backup sufficient', weight: 0.25 }
    ]
  },
  {
    id: 'dependencies',
    question: 'How many critical system dependencies exist?',
    type: 'select',
    options: [
      { value: 2, label: 'Many (5+) critical dependencies', weight: 0.2 },
      { value: 4, label: 'Several (3-4) critical dependencies', weight: 0.2 },
      { value: 6, label: 'Few (1-2) critical dependencies', weight: 0.2 },
      { value: 8, label: 'No critical dependencies', weight: 0.2 }
    ]
  },
  {
    id: 'recovery_complexity',
    question: 'What is the complexity of recovery procedures?',
    type: 'select',
    options: [
      { value: 4, label: 'Very complex - Multiple teams required', weight: 0.15 },
      { value: 6, label: 'Moderately complex - Specialized skills needed', weight: 0.15 },
      { value: 8, label: 'Standard complexity - Documented procedures exist', weight: 0.15 },
      { value: 12, label: 'Simple - Straightforward recovery process', weight: 0.15 }
    ]
  },
  {
    id: 'business_impact',
    question: 'What is the business impact of process downtime?',
    type: 'select',
    options: [
      { value: 2, label: 'Severe - Immediate revenue/customer impact', weight: 0.1 },
      { value: 4, label: 'High - Significant operational impact', weight: 0.1 },
      { value: 8, label: 'Moderate - Limited operational impact', weight: 0.1 },
      { value: 12, label: 'Low - Minimal immediate impact', weight: 0.1 }
    ]
  }
]

export function TimeMetrics({ processes, onUpdateProcess }: TimeMetricsProps) {
  const [responses, setResponses] = useState<Record<string, RecoveryResponse[]>>({})
  const [showHelp, setShowHelp] = useState<string | null>(null)

  const calculateMetrics = (process: BusinessProcess, processResponses: RecoveryResponse[]) => {
    // Start with standard times based on priority
    const standardTimes = {
      critical: { rto: 2, rpo: 0.25 },
      high: { rto: 8, rpo: 1 },
      medium: { rto: 18, rpo: 4 },
      low: { rto: 36, rpo: 24 }
    }[process.priority]

    // Calculate RTO based on responses
    let calculatedRTO = processResponses.reduce((acc, response) => {
      const question = RECOVERY_QUESTIONS.find(q => q.id === response.id)
      if (!question) return acc
      return acc + (Number(response.response) * question.options[0].weight)
    }, 0)

    // Adjust RTO based on priority and responses
    calculatedRTO = Math.max(
      standardTimes.rto,
      Math.min(calculatedRTO, standardTimes.rto * 2)
    )

    // Calculate RPO based on data criticality response
    const dataCriticalityResponse = processResponses.find(r => r.id === 'data_criticality')
    const calculatedRPO = dataCriticalityResponse 
      ? Number(dataCriticalityResponse.response)
      : standardTimes.rpo

    // Calculate MTD (Maximum Tolerable Downtime)
    const calculatedMTD = Math.ceil(calculatedRTO * 1.5)

    return {
      rto: Math.round(calculatedRTO),
      rpo: calculatedRPO,
      mtd: calculatedMTD
    }
  }

  const handleResponseChange = (processId: string, questionId: string, value: string | number) => {
    const updatedResponses = {
      ...responses,
      [processId]: [
        ...(responses[processId]?.filter(r => r.id !== questionId) || []),
        { id: questionId, response: value }
      ]
    }
    setResponses(updatedResponses)

    // Find process index
    const processIndex = processes.findIndex(p => p.id === processId)
    if (processIndex === -1) return

    // Calculate new metrics based on all responses
    const metrics = calculateMetrics(processes[processIndex], updatedResponses[processId])

    // Update process with new metrics
    onUpdateProcess(processIndex, {
      ...processes[processIndex],
      ...metrics
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recovery Time Data Collection</h2>
        <p className="mt-1 text-sm text-gray-600">
          Answer the following questions to determine recovery time requirements for each process
        </p>
      </div>

      <div className="space-y-8">
        {processes.map((process) => (
          <div key={process.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
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
              {/* Recovery Assessment Questions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Recovery Assessment Questions</h4>
                <div className="space-y-4">
                  {RECOVERY_QUESTIONS.map(question => (
                    <div key={question.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="block text-sm font-medium text-gray-700">
                        {question.question}
                        <button
                          type="button"
                          onClick={() => setShowHelp(
                            showHelp === question.id ? null : question.id
                          )}
                          className="ml-2 text-gray-400 hover:text-gray-500"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </label>
                      {showHelp === question.id && (
                        <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                          Select the option that best describes the recovery requirements for this process.
                        </div>
                      )}
                      <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={responses[process.id]?.find(r => r.id === question.id)?.response || ''}
                        onChange={(e) => handleResponseChange(process.id, question.id, Number(e.target.value))}
                      >
                        <option value="">Select an option</option>
                        {question.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}