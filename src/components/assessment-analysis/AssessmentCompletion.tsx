import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

interface AssessmentCompletionProps {
  type: 'resiliency' | 'gap' | 'maturity'
  onClose: () => void
}

export function AssessmentCompletion({ type, onClose }: AssessmentCompletionProps) {
  const navigate = useNavigate()

  const getTitle = () => {
    switch (type) {
      case 'resiliency':
        return 'Resiliency Scoring Complete'
      case 'gap':
        return 'Gap Analysis Complete'
      case 'maturity':
        return 'Maturity Assessment Complete'
    }
  }

  const getMessage = () => {
    switch (type) {
      case 'resiliency':
        return 'Your resiliency assessment has been completed and saved. You can view the results in the Assessment Analysis section.'
      case 'gap':
        return 'Your gap analysis has been completed and saved. You can view the identified gaps and recommendations in the Assessment Analysis section.'
      case 'maturity':
        return 'Your maturity assessment has been completed and saved. You can view your maturity levels and recommendations in the Assessment Analysis section.'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
            {getTitle()}
          </h3>
          <p className="text-center text-gray-600 mb-6">
            {getMessage()}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/bcdr/assessment-analysis')}
              className="btn-primary"
            >
              View Analysis
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}