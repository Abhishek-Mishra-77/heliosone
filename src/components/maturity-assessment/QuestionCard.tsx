import React from 'react'
import { HelpCircle, Info, FileText, Upload } from 'lucide-react'

interface QuestionCardProps {
  question: {
    id: string
    question: string
    description: string
    type: 'boolean' | 'scale' | 'text' | 'date' | 'multi_choice'
    options: any
    maturity_level: number
    standard_reference: {
      name: string
      clause: string
      description: string
    }
    evidence_required: boolean
    evidence_description: string | null
    evidence_requirements?: {
      required_files: string[]
      max_size_mb: number
      min_files: number
      max_files: number
      naming_convention: string
    }
  }
  response: {
    value: any
    evidence?: File[]
  }
  allResponses: Record<string, { value: any, evidence?: File[] }>
  showHelp: boolean
  showStandard: boolean
  onToggleHelp: () => void
  onToggleStandard: () => void
  onResponseChange: (value: any, evidence?: File[]) => void
}

export function QuestionCard({
  question,
  response,
  allResponses,
  showHelp,
  showStandard,
  onToggleHelp,
  onToggleStandard,
  onResponseChange
}: QuestionCardProps) {
  // Check if previous maturity level requirements are met
  const canShowQuestion = () => {
    if (question.maturity_level === 1) return true

    // Get all questions in the same category
    const categoryQuestions = Object.values(allResponses)
      .filter(q => q.maturity_level === question.maturity_level - 1)

    // Must have positive responses to all questions at previous level
    return categoryQuestions.every(q => {
      const response = allResponses[q.id]?.value
      if (!response) return false

      if (typeof response === 'boolean') return response === true
      if (typeof response === 'number') return response >= 4 // High score on scale
      return true
    })
  }

  if (!canShowQuestion()) return null

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 animate-fade-in">
      <div className="space-y-4">
        {/* Question Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">
                {question.question}
              </span>
              <button
                onClick={() => {
                  onToggleStandard()
                  onToggleHelp()
                }}
                className="ml-2 text-indigo-400 hover:text-indigo-600"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            {question.description && (
              <p className="mt-1 text-sm text-gray-500">
                {question.description}
              </p>
            )}
          </div>
        </div>

        {/* Help Text */}
        {showHelp && (
          <div className="mt-2 p-4 bg-indigo-50 rounded-lg animate-fade-in">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-indigo-600 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-indigo-900">Guidance</h4>
                <p className="mt-1 text-sm text-indigo-800">{question.description}</p>
                {question.evidence_description && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-indigo-900">Evidence Guidelines</h5>
                    <p className="text-sm text-indigo-800">{question.evidence_description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Standard Reference */}
        {showStandard && (
          <div className="mt-2 p-4 bg-indigo-50 rounded-lg animate-fade-in">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-indigo-600 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-indigo-900">Standard Reference</h4>
                <p className="mt-1 text-sm text-indigo-800">
                  {question.standard_reference.name} - {question.standard_reference.clause}
                </p>
                <p className="mt-1 text-sm text-indigo-700">
                  {question.standard_reference.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question Input */}
        <div className="mt-4">
          {question.type === 'boolean' && (
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value="true"
                  checked={response?.value === true}
                  onChange={() => onResponseChange(true)}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value="false"
                  checked={response?.value === false}
                  onChange={() => onResponseChange(false)}
                  className="form-radio text-indigo-600"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          )}

          {question.type === 'scale' && (
            <div className="space-y-2">
              <input
                type="range"
                min={question.options?.min || 1}
                max={question.options?.max || 5}
                step={question.options?.step || 1}
                value={response?.value || question.options?.min || 1}
                onChange={(e) => onResponseChange(parseInt(e.target.value))}
                className="w-full"
              />
              {question.options?.labels && (
                <div className="flex justify-between text-xs text-gray-500">
                  {question.options.labels.map((label: string, index: number) => (
                    <span key={index}>{label}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {question.type === 'multi_choice' && (
            <select
              value={response?.value || ''}
              onChange={(e) => onResponseChange(e.target.value)}
              className="input"
            >
              <option value="">Select an option</option>
              {question.options?.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}

          {question.type === 'text' && (
            <textarea
              value={response?.value || ''}
              onChange={(e) => onResponseChange(e.target.value)}
              className="input"
              rows={3}
              placeholder="Enter your response..."
            />
          )}

          {question.type === 'date' && (
            <input
              type="date"
              value={response?.value || ''}
              onChange={(e) => onResponseChange(e.target.value)}
              className="input"
            />
          )}

          {/* Optional Evidence Upload */}
          {response?.value && (
            <div className="mt-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Supporting Evidence (Optional)
                </label>
                {question.evidence_description && (
                  <button
                    type="button"
                    onClick={onToggleHelp}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    View Guidelines
                  </button>
                )}
              </div>
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500 transition-colors duration-200">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">
                    Click to upload supporting files
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files
                      if (files) {
                        onResponseChange(
                          response?.value,
                          Array.from(files)
                        )
                      }
                    }}
                    multiple
                    accept={question.evidence_requirements?.required_files?.map(ext => `.${ext}`)?.join(',') || '*'}
                  />
                </label>
              </div>
              {response?.evidence && response.evidence.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                  <ul className="mt-1 space-y-1">
                    {response.evidence.map((file, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}