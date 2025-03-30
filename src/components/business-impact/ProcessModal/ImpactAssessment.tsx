import React from 'react'
import { Info } from 'lucide-react'
import type { BusinessProcess } from '../../../types/business-impact'
import { IMPACT_QUESTIONS } from './constants'

interface ImpactAssessmentProps {
  formData: Partial<BusinessProcess>
  impactResponses: Record<string, string>
  showHelp: string | null
  setShowHelp: (id: string | null) => void
  handleResponseChange: (questionId: string, value: string) => void
}

export function ImpactAssessment({
  formData,
  impactResponses,
  showHelp,
  setShowHelp,
  handleResponseChange
}: ImpactAssessmentProps) {
  const renderQuestionSection = (
    title: string,
    questions: typeof IMPACT_QUESTIONS.revenue
  ) => (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="space-y-2">
            <label className="flex items-center text-sm text-gray-600">
              {question.question}
              <button
                type="button"
                onClick={() =>
                  setShowHelp(showHelp === question.id ? null : question.id)
                }
                className="ml-2 text-gray-400 hover:text-gray-500"
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
              value={impactResponses[question.id] || ""}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              className="select"
            >
              <option value="">Select an option</option>
              {question.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Impact Assessment
      </h3>
      {renderQuestionSection('Revenue Impact', IMPACT_QUESTIONS.revenue)}
      {renderQuestionSection('Operational Impact', IMPACT_QUESTIONS.operational)}
      {renderQuestionSection('Supply Chain Impact', IMPACT_QUESTIONS.supplyChain)}
      {renderQuestionSection('Cross-Border Impact', IMPACT_QUESTIONS.crossBorder)}
      {renderQuestionSection('Environmental Impact', IMPACT_QUESTIONS.environmental)}
    </div>
  )
}