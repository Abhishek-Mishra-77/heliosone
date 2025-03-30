import React from 'react'
import { ArrowLeft, ArrowRight, Save } from 'lucide-react'

interface NavigationProps {
  currentIndex: number
  totalCategories: number
  saving?: boolean
  onPrevious: () => void
  onNext: () => void
  onSave: () => void
}

export function Navigation({
  currentIndex,
  totalCategories,
  saving = false,
  onPrevious,
  onNext,
  onSave
}: NavigationProps) {
  return (
    <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className={`btn-secondary ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Previous Section
      </button>

      {currentIndex === totalCategories - 1 ? (
        <button
          onClick={onSave}
          disabled={saving}
          className={`btn-primary ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Saving...' : 'Complete Assessment'}
        </button>
      ) : (
        <button
          onClick={onNext}
          className="btn-primary"
        >
          Next Section
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      )}
    </div>
  )
}