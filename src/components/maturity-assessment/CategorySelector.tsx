import React from 'react'
import { Target, CheckCircle, Info } from 'lucide-react'
import clsx from 'clsx'

interface Category {
  id: string
  name: string
  description: string
  weight: number
}

interface CategorySelectorProps {
  categories: Category[]
  activeCategory: Category | null
  questions: Record<string, any[]>
  responses: Record<string, any>
  onCategorySelect: (category: Category) => void
}

export function CategorySelector({
  categories,
  activeCategory,
  questions,
  responses,
  onCategorySelect
}: CategorySelectorProps) {
  const calculateProgress = (categoryId: string) => {
    const categoryQuestions = questions[categoryId] || []
    if (categoryQuestions.length === 0) return 0

    const answeredCount = categoryQuestions.filter(q => {
      // Check if question should be shown based on maturity level dependencies
      if (q.maturity_level > 1) {
        // Find previous level questions in same category
        const previousLevelQuestions = categoryQuestions.filter(
          pq => pq.maturity_level === q.maturity_level - 1
        )
        
        // Only show if all previous level questions are answered positively
        const canShowQuestion = previousLevelQuestions.every(pq => {
          const response = responses[pq.id]?.value
          if (pq.type === 'boolean') return response === true
          if (pq.type === 'scale') return response >= 4 // High score on scale
          if (pq.type === 'multi_choice') {
            const options = pq.options?.options || []
            return response === options[options.length - 1] // Last/best option
          }
          return true
        })
        
        if (!canShowQuestion) return false
      }

      return responses[q.id]?.value !== undefined
    }).length

    return Math.round((answeredCount / categoryQuestions.length) * 100)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {categories.map(category => {
        const progress = calculateProgress(category.id)
        const isComplete = progress === 100
        
        return (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category)}
            className={clsx(
              "p-6 rounded-lg border-2 transition-all duration-200 text-left hover:shadow-md",
              activeCategory?.id === category.id
                ? "border-indigo-600 bg-indigo-50"
                : isComplete
                ? "border-green-200 hover:border-green-300"
                : "border-gray-200 hover:border-indigo-300"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Target className={clsx(
                  "w-5 h-5 mr-2",
                  activeCategory?.id === category.id ? "text-indigo-600" : "text-gray-400"
                )} />
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              </div>
              {isComplete && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{category.description}</p>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                    {progress}% Complete
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${progress}%` }}
                  className={clsx(
                    "shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500",
                    isComplete ? "bg-green-500" : "bg-indigo-500"
                  )}
                />
              </div>
            </div>

            {category.weight > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <Info className="w-4 h-4 mr-1" />
                Weight: {category.weight}%
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}