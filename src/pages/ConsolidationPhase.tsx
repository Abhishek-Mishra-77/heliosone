import React, { useState, useEffect } from 'react'
import { 
  GitMerge,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  ChevronRight,
  ChevronDown,
  Calendar,
  ThumbsUp,
  RefreshCw,
  X
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/store'
import { format } from 'date-fns'
import clsx from 'clsx'

interface ConsolidationPhase {
  id: string
  assessment_id: string
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'completed'
  start_date: string
  target_completion_date: string | null
  actual_completion_date: string | null
  owner_id: string
  approver_id: string | null
  summary: string | null
  methodology: string | null
  created_at: string
  updated_at: string
  owner: {
    full_name: string
    email: string
  }
  approver?: {
    full_name: string
    email: string
  }
  department_assessment: {
    id: string
    department_id: string
    status: string
    department: {
      name: string
    }
  }
}

interface ConflictingResponse {
  question_id: string
  user_id: string
  response: any
  user: {
    full_name: string
    email: string
  }
  question: {
    question: string
    description: string
  }
}

export function ConsolidationPhase() {
  const { organization, profile } = useAuthStore()
  const [consolidations, setConsolidations] = useState<ConsolidationPhase[]>([])
  const [conflictingResponses, setConflictingResponses] = useState<Record<string, ConflictingResponse[]>>({})
  const [loading, setLoading] = useState(true)
  const [expandedConsolidations, setExpandedConsolidations] = useState<Set<string>>(new Set())
  const [showResolutionModal, setShowResolutionModal] = useState(false)
  const [selectedConflict, setSelectedConflict] = useState<{
    consolidationId: string
    questionId: string
  } | null>(null)

  useEffect(() => {
    if (organization?.id) {
      fetchConsolidations()
    }
  }, [organization?.id])

  async function fetchConsolidations() {
    try {
      setLoading(true)

      // Fetch department assessments with conflicts
      const { data: departmentAssessments, error: assessmentError } = await supabase
        .from('department_assessments')
        .select(`
          id,
          department_id,
          status,
          department:departments(name),
          responses:department_question_responses(
            question_id,
            response,
            created_by,
            user:users(full_name, email),
            question:department_questions(question, description)
          )
        `)
        .eq('organization_id', organization?.id)
        .eq('status', 'in_progress')

      if (assessmentError) throw assessmentError

      // Identify assessments with conflicting responses
      const assessmentsWithConflicts = departmentAssessments?.filter(assessment => {
        const responsesByQuestion: Record<string, any[]> = {}
        assessment.responses.forEach((response: any) => {
          if (!responsesByQuestion[response.question_id]) {
            responsesByQuestion[response.question_id] = []
          }
          responsesByQuestion[response.question_id].push(response)
        })

        return Object.values(responsesByQuestion).some(responses => 
          responses.length > 1 && !responses.every(r => 
            JSON.stringify(r.response) === JSON.stringify(responses[0].response)
          )
        )
      })

      // Create or fetch consolidation phases for conflicting assessments
      for (const assessment of assessmentsWithConflicts || []) {
        const { data: existing } = await supabase
          .from('consolidation_phases')
          .select('id')
          .eq('assessment_id', assessment.id)
          .maybeSingle()

        if (!existing) {
          await supabase
            .from('consolidation_phases')
            .insert({
              assessment_id: assessment.id,
              organization_id: organization?.id,
              status: 'in_progress',
              owner_id: profile?.id,
              start_date: new Date().toISOString(),
              summary: `Consolidation required for conflicting responses in ${assessment.department.name}`
            })
        }

        // Store conflicting responses
        const conflicts: ConflictingResponse[] = []
        const responsesByQuestion: Record<string, any[]> = {}
        
        assessment.responses.forEach((response: any) => {
          if (!responsesByQuestion[response.question_id]) {
            responsesByQuestion[response.question_id] = []
          }
          responsesByQuestion[response.question_id].push(response)
        })

        Object.entries(responsesByQuestion).forEach(([questionId, responses]) => {
          if (responses.length > 1 && !responses.every(r => 
            JSON.stringify(r.response) === JSON.stringify(responses[0].response)
          )) {
            conflicts.push(...responses.map(r => ({
              question_id: questionId,
              user_id: r.created_by,
              response: r.response,
              user: r.user,
              question: r.question
            })))
          }
        })

        setConflictingResponses(prev => ({
          ...prev,
          [assessment.id]: conflicts
        }))
      }

      // Fetch all consolidation phases
      const { data: consolidationData, error: consolidationError } = await supabase
        .from('consolidation_phases')
        .select(`
          *,
          owner:owner_id(full_name, email),
          approver:approver_id(full_name, email),
          department_assessment:department_assessments(
            id,
            department_id,
            status,
            department:departments(name)
          )
        `)
        .eq('organization_id', organization?.id)
        .order('created_at', { ascending: false })

      if (consolidationError) throw consolidationError
      setConsolidations(consolidationData || [])

    } catch (error) {
      console.error('Error fetching consolidation data:', error)
      window.toast?.error('Failed to fetch consolidation data')
    } finally {
      setLoading(false)
    }
  }

  const handleConflictResolution = async (
    consolidationId: string,
    questionId: string,
    resolution: 'accept' | 'redo' | 'consolidate',
    selectedResponse?: any
  ) => {
    try {
      const consolidation = consolidations.find(c => c.id === consolidationId)
      if (!consolidation) return

      switch (resolution) {
        case 'accept':
          // Accept the selected response
          await supabase
            .from('department_question_responses')
            .update({
              response: selectedResponse,
              updated_at: new Date().toISOString()
            })
            .eq('question_id', questionId)
            .eq('department_assessment_id', consolidation.assessment_id)

          window.toast?.success('Response accepted')
          break

        case 'redo':
          // Clear responses and request redo
          await supabase
            .from('department_question_responses')
            .delete()
            .eq('question_id', questionId)
            .eq('department_assessment_id', consolidation.assessment_id)

          window.toast?.success('Question marked for redo')
          break

        case 'consolidate':
          // Update with consolidated response
          await supabase
            .from('department_question_responses')
            .update({
              response: selectedResponse,
              updated_at: new Date().toISOString()
            })
            .eq('question_id', questionId)
            .eq('department_assessment_id', consolidation.assessment_id)

          window.toast?.success('Responses consolidated')
          break
      }

      // Check if all conflicts are resolved
      const remainingConflicts = conflictingResponses[consolidation.assessment_id]
        .filter(c => c.question_id !== questionId)

      if (remainingConflicts.length === 0) {
        // Update consolidation phase status
        await supabase
          .from('consolidation_phases')
          .update({
            status: 'completed',
            actual_completion_date: new Date().toISOString()
          })
          .eq('id', consolidationId)

        // Update department assessment status
        await supabase
          .from('department_assessments')
          .update({
            status: 'completed'
          })
          .eq('id', consolidation.assessment_id)
      }

      // Refresh data
      await fetchConsolidations()

    } catch (error) {
      console.error('Error resolving conflict:', error)
      window.toast?.error('Failed to resolve conflict')
    }
  }

  if (!profile?.role?.includes('admin') && !profile?.role?.includes('bcdr_manager')) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <GitMerge className="w-8 h-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Consolidation Phase</h1>
              <p className="mt-1 text-gray-600">
                Review and resolve conflicting responses in department assessments
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading consolidation phases...</p>
          </div>
        ) : consolidations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <GitMerge className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Conflicts to Resolve</h3>
            <p className="text-gray-600">All department assessments are in sync</p>
          </div>
        ) : (
          <div className="space-y-4">
            {consolidations.map(consolidation => (
              <div key={consolidation.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => setExpandedConsolidations(prev => {
                          const next = new Set(prev)
                          if (next.has(consolidation.id)) {
                            next.delete(consolidation.id)
                          } else {
                            next.add(consolidation.id)
                          }
                          return next
                        })}
                        className="text-gray-500 hover:text-gray-700 mr-2"
                      >
                        {expandedConsolidations.has(consolidation.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {consolidation.department_assessment.department.name} - Conflict Resolution
                          </h3>
                          <span className={clsx(
                            "ml-2 px-2 py-1 text-xs font-medium rounded-full",
                            {
                              'bg-yellow-100 text-yellow-800': consolidation.status === 'in_progress',
                              'bg-green-100 text-green-800': consolidation.status === 'completed',
                              'bg-blue-100 text-blue-800': consolidation.status === 'review'
                            }
                          )}>
                            {consolidation.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          Started {format(new Date(consolidation.start_date), 'MMM d, yyyy')}
                          {consolidation.target_completion_date && (
                            <>
                              <span className="mx-2">•</span>
                              <Clock className="w-4 h-4 mr-1" />
                              Due {format(new Date(consolidation.target_completion_date), 'MMM d, yyyy')}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedConsolidations.has(consolidation.id) && (
                    <div className="mt-4 space-y-4">
                      {conflictingResponses[consolidation.department_assessment.id]?.map((conflict, index) => (
                        <div key={`${conflict.question_id}-${index}`} className="bg-gray-50 rounded-lg p-4">
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900">{conflict.question.question}</h4>
                            <p className="text-sm text-gray-600 mt-1">{conflict.question.description}</p>
                          </div>

                          <div className="space-y-3">
                            {conflictingResponses[consolidation.department_assessment.id]
                              .filter(c => c.question_id === conflict.question_id)
                              .map((response, responseIndex) => (
                                <div key={responseIndex} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                                  <div>
                                    <div className="font-medium text-gray-900">{response.user.full_name}</div>
                                    <div className="text-sm text-gray-600">{response.user.email}</div>
                                    <div className="text-sm text-gray-700 mt-1">
                                      Response: {JSON.stringify(response.response.value)}
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleConflictResolution(
                                        consolidation.id,
                                        conflict.question_id,
                                        'accept',
                                        response.response
                                      )}
                                      className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                                      title="Accept this response"
                                    >
                                      <ThumbsUp className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            }
                          </div>

                          <div className="mt-4 flex justify-end space-x-4">
                            <button
                              onClick={() => handleConflictResolution(
                                consolidation.id,
                                conflict.question_id,
                                'redo'
                              )}
                              className="flex items-center px-3 py-2 text-sm font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Request Redo
                            </button>
                            <button
                              onClick={() => {
                                setSelectedConflict({
                                  consolidationId: consolidation.id,
                                  questionId: conflict.question_id
                                })
                                setShowResolutionModal(true)
                              }}
                              className="flex items-center px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                            >
                              <GitMerge className="w-4 h-4 mr-2" />
                              Consolidate Responses
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && selectedConflict && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Consolidate Responses</h2>
              <button
                onClick={() => {
                  setShowResolutionModal(false)
                  setSelectedConflict(null)
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Consolidation form would go here */}
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-lg"
                placeholder="Enter consolidated response..."
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowResolutionModal(false)
                  setSelectedConflict(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle consolidation
                  setShowResolutionModal(false)
                  setSelectedConflict(null)
                }}
                className="btn-primary"
              >
                Save Consolidated Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}