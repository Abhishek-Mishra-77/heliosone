import React from 'react'
import { TrendingUp, Calendar, AlertTriangle } from 'lucide-react'

interface TrendPoint {
  date: string
  score: number
  criticalRisks: number
  highRisks: number
}

export function RiskTrends() {
  // Sample data - replace with actual data from API
  const trends: TrendPoint[] = [
    { date: '2025-01', score: 65, criticalRisks: 3, highRisks: 5 },
    { date: '2025-02', score: 58, criticalRisks: 2, highRisks: 4 },
    { date: '2025-03', score: 52, criticalRisks: 1, highRisks: 3 }
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-5 h-5 text-indigo-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Risk Trends</h2>
      </div>

      <div className="space-y-6">
        {/* Risk Score Trend */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Risk Score Trend</h3>
          <div className="h-40 relative">
            {/* Simplified trend visualization - replace with proper chart library */}
            <div className="absolute inset-0 flex items-end justify-between">
              {trends.map((point, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center"
                >
                  <div 
                    className="w-16 bg-indigo-500 rounded-t"
                    style={{ height: `${point.score}%` }}
                  />
                  <div className="mt-2 text-xs text-gray-600">
                    {new Date(point.date).toLocaleDateString(undefined, { month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Distribution Trend */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-4">Risk Distribution Trend</h3>
          <div className="space-y-4">
            {trends.map((point, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {new Date(point.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{point.criticalRisks}</span>
                      <span className="text-xs text-gray-500 ml-1">Critical</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{point.highRisks}</span>
                      <span className="text-xs text-gray-500 ml-1">High</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <div 
                    className="h-2 bg-red-500 rounded-l"
                    style={{ width: `${(point.criticalRisks / (point.criticalRisks + point.highRisks)) * 100}%` }}
                  />
                  <div 
                    className="h-2 bg-orange-500 rounded-r"
                    style={{ width: `${(point.highRisks / (point.criticalRisks + point.highRisks)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}