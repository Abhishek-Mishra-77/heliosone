import React from 'react'
import clsx from 'clsx'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  canProceed: boolean
  isLastStep?: boolean
  onComplete?: () => void
}

export function StepNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  canProceed,
  isLastStep,
  onComplete
}: StepNavigationProps) {
  return (
    <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
      <button
        onClick={onPrevious}
        disabled={currentStep === 0}
        className={clsx(
          'btn-secondary',
          currentStep === 0 && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Previous
      </button>

      {isLastStep ? (
        <button
          onClick={onComplete}
          disabled={!canProceed}
          className={clsx(
            'btn-primary',
            !canProceed && 'opacity-50 cursor-not-allowed'
          )}
        >
          Complete Plan
        </button>
      ) : (
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={clsx(
            'btn-primary',
            !canProceed && 'opacity-50 cursor-not-allowed'
          )}
        >
          Next
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      )}
    </div>
  )
}