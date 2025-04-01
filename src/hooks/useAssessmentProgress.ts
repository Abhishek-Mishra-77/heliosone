import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/store'

interface SavedProgress {
  responses: Record<string, any>
  activeCategory: string | null
  lastUpdated: string
}

export function useAssessmentProgress(assessmentType: 'resiliency' | 'gap' | 'maturity' | 'business_impact' | 'department') {
  const { organization, profile } = useAuthStore()
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (organization?.id) {
      loadProgress()
    }
  }, [organization?.id])

  const loadProgress = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: assessment, error: assessmentError } = await supabase
        .from('bcdr_assessments')
        .select('*')
        .eq('organization_id', organization?.id)
        .eq('bcdr_assessment_type', assessmentType)
        .eq('status', 'in_progress')
        .maybeSingle()

      if (assessmentError) throw assessmentError

      if (assessment) {
        const { data: responses, error: responsesError } = await supabase
          .from(`${assessmentType}_responses`)
          .select('*')
          .eq('assessment_id', assessment.id)

        if (responsesError) throw responsesError

        setSavedProgress({
          responses: responses?.reduce((acc, r) => ({
            ...acc,
            [r.question_id]: {
              value: r.response.value,
              evidence: r.evidence_links
            }
          }), {}),
          activeCategory: assessment.current_category,
          lastUpdated: assessment.updated_at
        })
      }
    } catch (error) {
      console.error('Error loading progress:', error)
      setError(error instanceof Error ? error.message : 'Failed to load progress')
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async (
    responses: Record<string, any>,
    activeCategory: string | null
  ) => {

    try {
      if (!organization?.id || !profile?.id) {
        throw new Error('Organization or user data not available')
      }

      setSaving(true)
      setError(null)

      // Get or create in-progress assessment
      let assessmentId = null
      const { data: existingAssessment } = await supabase
        .from('bcdr_assessments')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('bcdr_assessment_type', assessmentType)
        .eq('status', 'in_progress')
        .maybeSingle()

      if (existingAssessment) {
        assessmentId = existingAssessment.id
      } else {
        const { data: newAssessment, error: createError } = await supabase
          .from('bcdr_assessments')
          .insert({
            organization_id: organization.id,
            created_by: profile.id,
            bcdr_assessment_type: assessmentType,
            status: 'in_progress',
            current_category: activeCategory
          })
          .select()
          .single()

        if (createError) throw createError
        assessmentId = newAssessment.id
      }

      // Update assessment
      const { error: updateError } = await supabase
        .from('bcdr_assessments')
        .update({
          current_category: activeCategory,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessmentId)

      if (updateError) throw updateError

      // Save responses
      const { error: responsesError } = await supabase
        .from(`${assessmentType}_responses`)
        .upsert(
          Object.entries(responses).map(([questionId, response]) => ({
            assessment_id: assessmentId,
            question_id: questionId,
            response: { value: response.value },
            evidence_links: response.evidence?.map(file => file.name) || [],
            created_by: profile.id
          }))
        )

      if (responsesError) throw responsesError

      window.toast?.success('Progress saved successfully')
    } catch (error) {
      console.error('Error saving progress:', error)
      setError(error instanceof Error ? error.message : 'Failed to save progress')
      window.toast?.error('Failed to save progress')
    } finally {
      setSaving(false)
    }
  }

  return {
    savedProgress,
    saving,
    loading,
    error,
    saveProgress,
    loadProgress
  }
}