import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function useAssessmentCompletion() {
  const [showCompletion, setShowCompletion] = useState(false)
  const navigate = useNavigate()

  const checkPreviousAssessment = async (organizationId: string, assessmentType: string) => {
    const { data: assessments } = await supabase
      .from('bcdr_assessments')
      .select('id, status')
      .eq('organization_id', organizationId)
      .eq('bcdr_assessment_type', assessmentType)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)

    return assessments && assessments.length > 0
  }

  const handleAssessmentComplete = async (
    organizationId: string,
    assessmentType: string,
    onComplete?: () => void
  ) => {
    const hasCompleted = await checkPreviousAssessment(organizationId, assessmentType)

    if (hasCompleted) {
      window.toast?.error('An assessment has already been completed. Please wait for the next assessment period.')
      // navigate('/bcdr/assessment-analysis')
      return
    }

    setShowCompletion(true)
    if (onComplete) {
      onComplete()
    }

    // Show success message
    const messages = {
      resiliency: 'Resiliency assessment completed successfully!',
      gap: 'Gap analysis completed successfully!',
      maturity: 'Maturity assessment completed successfully!'
    }
    window.toast?.success(messages[assessmentType as keyof typeof messages])
  }

  return {
    showCompletion,
    setShowCompletion,
    handleAssessmentComplete
  }
}