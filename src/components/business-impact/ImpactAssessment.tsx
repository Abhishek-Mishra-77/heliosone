import React, { useState } from 'react'
import { 
  Info, 
  ChevronRight, 
  ChevronDown,
  Building2,
  AlertCircle
} from 'lucide-react'
import type { BusinessProcess } from '../../types/business-impact'
import clsx from 'clsx'

interface ImpactAssessmentProps {
  processes: BusinessProcess[]
  onUpdateProcess: (index: number, process: BusinessProcess) => void
}

const IMPACT_QUESTIONS = {
  financial: [
    {
      id: 'revenue_direct',
      question: 'What is the direct revenue impact?',
      type: 'select',
      options: [
        { value: 'very_high', label: 'Over $1M per day', impact: 100 },
        { value: 'high', label: '$500K - $1M per day', impact: 80 },
        { value: 'medium', label: '$100K - $500K per day', impact: 60 },
        { value: 'low', label: '$50K - $100K per day', impact: 40 },
        { value: 'very_low', label: 'Under $50K per day', impact: 20 },
      ],
    },
    {
      id: 'revenue_indirect',
      question: 'What is the indirect revenue impact?',
      type: 'select',
      options: [
        { value: 'severe', label: 'Severe indirect impact', impact: 100 },
        { value: 'significant', label: 'Significant impact', impact: 75 },
        { value: 'moderate', label: 'Moderate impact', impact: 50 },
        { value: 'minor', label: 'Minor impact', impact: 25 },
        { value: 'none', label: 'No impact', impact: 0 },
      ],
    }
  ],
  operational: [
    {
      id: 'customer_impact',
      question: 'What percentage of customers are affected?',
      type: 'select',
      options: [
        { value: 'all', label: 'All customers (100%)', impact: 100 },
        { value: 'most', label: 'Most customers (75%)', impact: 75 },
        { value: 'some', label: 'Some customers (50%)', impact: 50 },
        { value: 'few', label: 'Few customers (25%)', impact: 25 },
        { value: 'minimal', label: 'Minimal impact (<10%)', impact: 10 },
      ],
    },
    {
      id: 'process_dependencies',
      question: 'How many other processes depend on this one?',
      type: 'select',
      options: [
        { value: 'critical', label: 'Critical enterprise dependency', impact: 100 },
        { value: 'high', label: 'Multiple department dependency', impact: 75 },
        { value: 'medium', label: 'Single department dependency', impact: 50 },
        { value: 'low', label: 'Limited dependencies', impact: 25 },
        { value: 'none', label: 'No dependencies', impact: 0 },
      ],
    }
  ],
  reputational: [
    {
      id: 'brand_impact',
      question: 'What is the potential brand/reputation impact?',
      type: 'select',
      options: [
        { value: 'severe', label: 'Severe brand damage', impact: 100 },
        { value: 'major', label: 'Major reputation impact', impact: 75 },
        { value: 'moderate', label: 'Moderate impact', impact: 50 },
        { value: 'minor', label: 'Minor impact', impact: 25 },
        { value: 'none', label: 'No impact', impact: 0 },
      ],
    },
    {
      id: 'regulatory_impact',
      question: 'Are there regulatory/compliance implications?',
      type: 'select',
      options: [
        { value: 'severe', label: 'Severe compliance breach', impact: 100 },
        { value: 'major', label: 'Major compliance issues', impact: 75 },
        { value: 'moderate', label: 'Moderate compliance impact', impact: 50 },
        { value: 'minor', label: 'Minor compliance concerns', impact: 25 },
        { value: 'none', label: 'No compliance impact', impact: 0 },
      ],
    }
  ]
}

export function ImpactAssessment({ processes, onUpdateProcess }: ImpactAssessmentProps) {
  const [responses, setResponses] = useState<Record<string, Record<string, string>>>({})
  const [showHelp, setShowHelp] = useState<string | null>(null)
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set())
  const [activeProcessIndex, setActiveProcessIndex] = useState<number | null>(null)

  // If there are no processes, show a message
  if (!processes || processes.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Processes Available</h3>
          <p className="text-gray-600">Please add processes in the Process Assessment step first.</p>
        </div>
      </div>
    )
  }

  const calculateImpactScores = (processId: string, newResponses: Record<string, string>) => {
    // Calculate financial impact
    const financialScore = IMPACT_QUESTIONS.financial.reduce((score, question) => {
      const response = newResponses[question.id]
      const option = question.options.find(opt => opt.value === response)
      return score + (option?.impact || 0)
    }, 0) / IMPACT_QUESTIONS.financial.length

    // Calculate operational impact
    const operationalScore = IMPACT_QUESTIONS.operational.reduce((score, question) => {
      const response = newResponses[question.id]
      const option = question.options.find(opt => opt.value === response)
      return score + (option?.impact || 0)
    }, 0) / IMPACT_QUESTIONS.operational.length

    // Calculate reputational impact
    const reputationalScore = IMPACT_QUESTIONS.reputational.reduce((score, question) => {
      const response = newResponses[question.id]
      const option = question.options.find(opt => opt.value === response)
      return score + (option?.impact || 0)
    }, 0) / IMPACT_QUESTIONS.reputational.length

    return {
      financial: {
        score: Math.round(financialScore)
      },
      operational: {
        score: Math.round(operationalScore)
      },
      reputational: {
        score: Math.round(reputationalScore)
      }
    }
  }

  const handleResponseChange = (processIndex: number, questionId: string, value: string) => {
    const process = processes[processIndex]
    const newResponses = {
      ...responses[process.id],
      [questionId]: value
    }
    setResponses(prev => ({
      ...prev,
      [process.id]: newResponses
    }))

    const impacts = calculateImpactScores(process.id, newResponses)
    onUpdateProcess(processIndex, {
      ...process,
      operationalImpact: {
        ...process.operationalImpact,
        score: impacts.operational.score
      },
      reputationalImpact: {
        ...process.reputationalImpact,
        score: impacts.reputational.score
      }
    })
  }

  const toggleProcess = (processId: string) => {
    setExpandedProcesses(prev => {
      const next = new Set(prev)
      if (next.has(processId)) {
        next.delete(processId)
      } else {
        next.add(processId)
      }
      return next
    })
  }

  const getProcessProgress = (processId: string) => {
    const processResponses = responses[processId] || {}
    const totalQuestions = Object.values(IMPACT_QUESTIONS).flat().length
    const answeredQuestions = Object.keys(processResponses).length
    return Math.round((answeredQuestions / totalQuestions) * 100)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Impact Assessment</h2>
        <p className="mt-1 text-gray-600">
          Evaluate the potential impacts of process disruption across key areas
        </p>
      </div>

      {/* Process Selection */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-indigo-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-indigo-900">Assessment Progress</h3>
            <p className="mt-1 text-sm text-indigo-800">
              Select each process below to assess its potential impacts. All processes must be evaluated.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {processes.map((process, processIndex) => (
          <div 
            key={process.id} 
            className={clsx(
              "bg-white rounded-lg border transition-all duration-200",
              expandedProcesses.has(process.id) ? "border-indigo-300 shadow-md" : "border-gray-200"
            )}
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => toggleProcess(process.id)}
                    className="text-gray-500 hover:text-gray-700 mr-2"
                  >
                    {expandedProcesses.has(process.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{process.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        process.priority === 'critical' && "bg-red-100 text-red-800",
                        process.priority === 'high' && "bg-orange-100 text-orange-800",
                        process.priority === 'medium' && "bg-yellow-100 text-yellow-800",
                        process.priority === 'low' && "bg-green-100 text-green-800"
                      )}>
                        {process.priority.toUpperCase()}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{process.category}</span>
                      <span className="mx-2">•</span>
                      <span>Progress: {getProcessProgress(process.id)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {expandedProcesses.has(process.id) && (
                <div className="mt-6 space-y-8">
                  {/* Financial Impact */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Financial Impact</h4>
                    <div className="space-y-4">
                      {IMPACT_QUESTIONS.financial.map(question => (
                        <div key={question.id} className="space-y-2">
                          <label className="flex items-center text-sm text-gray-600">
                            {question.question}
                            <button
                              onClick={() => setShowHelp(showHelp === question.id ? null : question.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </label>
                          {showHelp === question.id && (
                            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                              Select the option that best describes the impact for this process.
                            </div>
                          )}
                          <select
                            value={responses[process.id]?.[question.id] || ''}
                            onChange={(e) => handleResponseChange(processIndex, question.id, e.target.value)}
                            className="select"
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

                  {/* Operational Impact */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Operational Impact</h4>
                    <div className="space-y-4">
                      {IMPACT_QUESTIONS.operational.map(question => (
                        <div key={question.id} className="space-y-2">
                          <label className="flex items-center text-sm text-gray-600">
                            {question.question}
                            <button
                              onClick={() => setShowHelp(showHelp === question.id ? null : question.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </label>
                          {showHelp === question.id && (
                            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                              Select the option that best describes the impact for this process.
                            </div>
                          )}
                          <select
                            value={responses[process.id]?.[question.id] || ''}
                            onChange={(e) => handleResponseChange(processIndex, question.id, e.target.value)}
                            className="select"
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

                  {/* Reputational Impact */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Reputational Impact</h4>
                    <div className="space-y-4">
                      {IMPACT_QUESTIONS.reputational.map(question => (
                        <div key={question.id} className="space-y-2">
                          <label className="flex items-center text-sm text-gray-600">
                            {question.question}
                            <button
                              onClick={() => setShowHelp(showHelp === question.id ? null : question.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                          </label>
                          {showHelp === question.id && (
                            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                              Select the option that best describes the impact for this process.
                            </div>
                          )}
                          <select
                            value={responses[process.id]?.[question.id] || ''}
                            onChange={(e) => handleResponseChange(processIndex, question.id, e.target.value)}
                            className="select"
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
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}