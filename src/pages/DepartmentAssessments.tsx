import React, { useState, useEffect } from 'react'
import { 
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Building2,
  Save,
  Info,
  HelpCircle,
  Upload
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/store'
import { format } from 'date-fns'
import clsx from 'clsx'

interface QuestionnaireAssignment {
  id: string
  template_id: string
  department_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'expired'
  due_date: string
  completed_at: string | null
  template: {
    name: string
    description: string
    department_type: string
  }
  department: {
    name: string
  }
}

interface Question {
  id: string
  template_id: string
  question: string
  description: string
  type: 'boolean' | 'scale' | 'text' | 'date' | 'multi_choice'
  options: any
  weight: number
  order_index: number
  maturity_level: number
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

interface QuestionResponse {
  value: any
  evidence?: File[]
}

export function DepartmentAssessments() {
  const { profile } = useAuthStore()
  const [assignments, setAssignments] = useState<QuestionnaireAssignment[]>([])
  const [questions, setQuestions] = useState<Record<string, Question[]>>({})
  const [responses, setResponses] = useState<Record<string, Record<string, QuestionResponse>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeAssignment, setActiveAssignment] = useState<QuestionnaireAssignment | null>(null)
  const [showHelp, setShowHelp] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    total: number
    completed: number
    required: number
    requiredCompleted: number
  }>({ total: 0, completed: 0, required: 0, requiredCompleted: 0 })

  useEffect(() => {
    if (profile?.id) {
      fetchAssignments()
    }
  }, [profile?.id])

  async function fetchAssignments() {
    try {
      setLoading(true)
      const { data: assignmentData, error: assignmentError } = await supabase
        .rpc('get_user_questionnaire_assignments', {
          p_user_id: profile?.id
        })

      if (assignmentError) throw assignmentError
      setAssignments(assignmentData || [])

      // Fetch questions for each template
      for (const assignment of assignmentData || []) {
        const { data: questionData, error: questionError } = await supabase
          .from('department_questions')
          .select('*')
          .eq('template_id', assignment.template_id)
          .order('order_index')

        if (questionError) throw questionError
        setQuestions(prev => ({
          ...prev,
          [assignment.template_id]: questionData || []
        }))

        // Fetch existing responses
        const { data: responseData } = await supabase
          .from('department_question_responses')
          .select('*')
          .eq('department_assessment_id', assignment.id)

        if (responseData) {
          setResponses(prev => ({
            ...prev,
            [assignment.id]: responseData.reduce((acc, r) => ({
              ...acc,
              [r.question_id]: {
                value: r.response.value,
                evidence: r.evidence_links || []
              }
            }), {})
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
      window.toast?.error('Failed to fetch assignments')
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (assignmentId: string) => {
    const assignmentResponses = responses[assignmentId] || {}
    const templateId = assignments.find(a => a.id === assignmentId)?.template_id
    const templateQuestions = questions[templateId || ''] || []

    const total = templateQuestions.length
    const completed = Object.keys(assignmentResponses).length
    const required = templateQuestions.filter(q => q.evidence_required).length
    const requiredCompleted = templateQuestions
      .filter(q => q.evidence_required)
      .filter(q => assignmentResponses[q.id]?.value !== undefined).length

    setProgress({ total, completed, required, requiredCompleted })
  }

  const startAssessment = async (assignment: QuestionnaireAssignment) => {
    try {
      const { error } = await supabase
        .from('department_questionnaire_assignments')
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', assignment.id)

      if (error) throw error

      setAssignments(prev => prev.map(a => 
        a.id === assignment.id ? { ...a, status: 'in_progress' } : a
      ))
      setActiveAssignment(assignment)
      calculateProgress(assignment.id)

      window.toast?.success('Assessment started')
    } catch (error) {
      console.error('Error starting assessment:', error)
      window.toast?.error('Failed to start assessment')
    }
  }

  const submitAssessment = async () => {
    if (!activeAssignment || !profile?.id) return

    try {
      setSaving(true)
      const assignmentResponses = responses[activeAssignment.id] || {}
      const templateId = activeAssignment.template_id
      const templateQuestions = questions[templateId] || []

      const missingRequired = templateQuestions.some(question => {
        const response = assignmentResponses[question.id]
        return !response?.value && question.evidence_required
      })

      if (missingRequired) {
        window.toast?.error('Please answer all required questions')
        return
      }

      // Process and format responses
      const formattedResponses = Object.entries(assignmentResponses).map(([questionId, response]) => ({
        department_assessment_id: activeAssignment.id,
        question_id: questionId,
        response: { value: response.value },
        evidence_links: response.evidence || [],
        created_by: profile.id
      }))

      const { error: responseError } = await supabase
        .from('department_question_responses')
        .upsert(formattedResponses)

      if (responseError) throw responseError

      const { error: assignmentError } = await supabase
        .from('department_questionnaire_assignments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', activeAssignment.id)

      if (assignmentError) throw assignmentError

      setAssignments(prev => prev.map(a => 
        a.id === activeAssignment.id ? { 
          ...a, 
          status: 'completed',
          completed_at: new Date().toISOString()
        } : a
      ))

      setActiveAssignment(null)
      window.toast?.success('Assessment submitted successfully')
    } catch (error) {
      console.error('Error submitting assessment:', error)
      window.toast?.error('Failed to submit assessment')
    } finally {
      setSaving(false)
    }
  }

  const handleResponseChange = (questionId: string, value: any, evidence?: File[]) => {
    if (!activeAssignment) return

    setResponses(prev => ({
      ...prev,
      [activeAssignment.id]: {
        ...prev[activeAssignment.id],
        [questionId]: {
          value,
          evidence: evidence || prev[activeAssignment.id]?.[questionId]?.evidence
        }
      }
    }))

    calculateProgress(activeAssignment.id)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessments...</p>
        </div>
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Department Assignments</h3>
          <p className="text-gray-600">You are not currently assigned to any departments.</p>
          <p className="text-gray-600">Please contact your administrator to get department access.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <ClipboardList className="w-8 h-8 text-indigo-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Department Assessments</h1>
            <p className="mt-1 text-gray-600">Complete your assigned department questionnaires</p>
          </div>
        </div>

        {activeAssignment ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{activeAssignment.template.name}</h2>
                <p className="mt-1 text-gray-600">Department: {activeAssignment.department.name}</p>
              </div>
              <button
                onClick={() => {
                  setActiveAssignment(null)
                }}
                className="btn-secondary"
              >
                Back to Assignments
              </button>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Overall Progress</span>
                <span>{Math.round((progress.completed / progress.total) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{progress.completed} of {progress.total} questions answered</span>
                <span>{progress.requiredCompleted} of {progress.required} required questions completed</span>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {questions[activeAssignment.template_id]?.map(question => (
                <div key={question.id} className="bg-white rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">
                          {question.question}
                        </span>
                        {question.evidence_required && (
                          <span className="ml-2 text-xs text-red-500">*</span>
                        )}
                        <button
                          onClick={() => setShowHelp(showHelp === question.id ? null : question.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <HelpCircle className="w-4 h-4" />
                        </button>
                      </div>

                      {showHelp === question.id && (
                        <div className="mt-2 p-4 bg-indigo-50 rounded-lg">
                          <div className="flex items-start">
                            <Info className="w-5 h-5 text-indigo-600 mt-0.5 mr-2" />
                            <div>
                              <h4 className="text-sm font-medium text-indigo-900">Guidance</h4>
                              <p className="mt-1 text-sm text-indigo-800">{question.description}</p>
                              {question.evidence_required && question.evidence_description && (
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium text-indigo-900">Required Evidence</h5>
                                  <p className="text-sm text-indigo-800">{question.evidence_description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4">
                        {question.type === 'boolean' && (
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`question_${question.id}`}
                                value="true"
                                checked={responses[activeAssignment.id]?.[question.id]?.value === true}
                                onChange={() => handleResponseChange(question.id, true)}
                                className="form-radio text-indigo-600"
                              />
                              <span className="ml-2">Yes</span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`question_${question.id}`}
                                value="false"
                                checked={responses[activeAssignment.id]?.[question.id]?.value === false}
                                onChange={() => handleResponseChange(question.id, false)}
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
                              value={responses[activeAssignment.id]?.[question.id]?.value || question.options?.min || 1}
                              onChange={(e) => handleResponseChange(question.id, parseInt(e.target.value))}
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
                            className="input"
                            value={responses[activeAssignment.id]?.[question.id]?.value || ''}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
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
                            className="input"
                            rows={3}
                            placeholder="Enter your response..."
                            value={responses[activeAssignment.id]?.[question.id]?.value || ''}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                          />
                        )}

                        {question.type === 'date' && (
                          <input
                            type="date"
                            className="input"
                            value={responses[activeAssignment.id]?.[question.id]?.value || ''}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                          />
                        )}

                        {/* Optional Evidence Upload */}
                        {question.evidence_required && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Supporting Evidence
                            </label>
                            <input
                              type="file"
                              className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                              onChange={(e) => {
                                const files = e.target.files
                                if (files) {
                                  handleResponseChange(
                                    question.id,
                                    responses[activeAssignment.id]?.[question.id]?.value,
                                    Array.from(files)
                                  )
                                }
                              }}
                              multiple
                              accept={question.evidence_requirements?.required_files?.map(ext => `.${ext}`)?.join(',') || '*'}
                            />
                            {question.evidence_description && (
                              <p className="mt-1 text-sm text-gray-500">
                                {question.evidence_description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={submitAssessment}
                disabled={saving}
                className="btn-primary"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Submitting...' : 'Submit Assessment'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map(assignment => (
              <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-indigo-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assignment.template.name}
                      </h3>
                      <span className={clsx(
                        "ml-2 px-2 py-1 text-xs font-medium rounded-full",
                        {
                          'bg-yellow-100 text-yellow-800': assignment.status === 'pending',
                          'bg-blue-100 text-blue-800': assignment.status === 'in_progress',
                          'bg-green-100 text-green-800': assignment.status === 'completed',
                          'bg-red-100 text-red-800': assignment.status === 'expired'
                        }
                      )}>
                        {assignment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Due {format(new Date(assignment.due_date), 'MMM d, yyyy')}
                      <span className="mx-2">•</span>
                      Department: {assignment.department.name}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {assignment.template.description}
                    </p>
                  </div>
                  {assignment.status === 'pending' && (
                    <button 
                      onClick={() => startAssessment(assignment)}
                      className="btn-primary"
                    >
                      Start Assessment
                    </button>
                  )}
                  {assignment.status === 'in_progress' && (
                    <button 
                      onClick={() => setActiveAssignment(assignment)}
                      className="btn-primary"
                    >
                      Continue Assessment
                    </button>
                  )}
                  {assignment.status === 'completed' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DepartmentAssessments