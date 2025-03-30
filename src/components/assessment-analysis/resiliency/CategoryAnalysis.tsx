import React from 'react'
import { 
  ArrowUpRight, 
  ArrowDownRight,
  ChevronRight,
  AlertTriangle,
  Lightbulb
} from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import clsx from 'clsx'

interface CategoryAnalysisProps {
  categoryScores: Record<string, {
    score: number
    trend: number
    evidenceCompliance: number
    criticalFindings: number
    details: string
    recommendations: Array<{
      title: string
      description: string
      priority: 'critical' | 'high' | 'medium' | 'low'
    }>
  }> | null | undefined
  onCategoryClick: (category: string) => void
}

export function CategoryAnalysis({ categoryScores, onCategoryClick }: CategoryAnalysisProps) {
  if (!categoryScores) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Category Analysis</h2>
            <RouterLink 
              to="/bcdr/scoring" 
              className="text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </RouterLink>
          </div>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
            <p className="text-gray-600">Complete a resiliency assessment to view category analysis</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Category Analysis</h2>
          <RouterLink 
            to="/bcdr/scoring" 
            className="text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </RouterLink>
        </div>
        <div className="space-y-4">
          {Object.entries(categoryScores).map(([category, data]) => (
            <button
              key={category}
              onClick={() => onCategoryClick(category)}
              className="w-full bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{category}</span>
                  {data.recommendations?.some(r => r.priority === 'critical') && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Critical Recommendations
                    </span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">{data.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={clsx(
                    "h-full rounded-full transition-all duration-300",
                    data.score >= 80 ? "bg-green-500" :
                    data.score >= 60 ? "bg-yellow-500" :
                    "bg-red-500"
                  )}
                  style={{ width: `${data.score}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <span className={clsx(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    data.evidenceCompliance >= 80 ? "bg-green-100 text-green-800" :
                    data.evidenceCompliance >= 60 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  )}>
                    {data.evidenceCompliance}% Evidence
                  </span>
                  {data.criticalFindings > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {data.criticalFindings} Critical
                    </span>
                  )}
                  {data.recommendations?.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      <Lightbulb className="w-3 h-3 mr-1" />
                      {data.recommendations.length} Recommendations
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  {data.trend > 0 ? (
                    <>
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-600">+{data.trend}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-red-600">{data.trend}%</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Critical Recommendations</h2>
          <RouterLink 
            to="/bcdr/recommendations" 
            className="text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </RouterLink>
        </div>
        <div className="space-y-4">
          {Object.entries(categoryScores)
            .filter(([_, data]) => data.recommendations?.some(r => r.priority === 'critical'))
            .map(([category, data]) => (
              <div key={category} className="bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="flex items-center text-red-800 font-medium mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {category}
                </div>
                <div className="space-y-2">
                  {data.recommendations
                    ?.filter(r => r.priority === 'critical')
                    .map((rec, index) => (
                      <div key={index} className="text-sm text-red-700">
                        • {rec.title}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          {Object.entries(categoryScores)
            .filter(([_, data]) => data.recommendations?.some(r => r.priority === 'high'))
            .map(([category, data]) => (
              <div key={category} className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                <div className="flex items-center text-orange-800 font-medium mb-2">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  {category}
                </div>
                <div className="space-y-2">
                  {data.recommendations
                    ?.filter(r => r.priority === 'high')
                    .map((rec, index) => (
                      <div key={index} className="text-sm text-orange-700">
                        • {rec.title}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}