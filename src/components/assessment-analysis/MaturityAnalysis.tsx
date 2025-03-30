import React from 'react'
import { 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  Shield,
  CheckCircle2,
  TrendingUp,
  Download,
  Printer,
  AlertTriangle
} from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { generateReport } from '../../lib/reports'
import clsx from 'clsx'

interface MaturityStats {
  overallScore: number
  overallTrend: number
  lastAssessmentDate: string | null
  completedAssessments: number
  categoryScores: Record<string, {
    score: number
    trend: number
    level: number
    evidenceCompliance: number
  }>
  levelDistribution: {
    level1: number
    level2: number
    level3: number
    level4: number
    level5: number
  }
  trendData: Array<{
    date: string
    score: number
    level: number
  }>
}

interface MaturityAnalysisProps {
  stats: MaturityStats | null
  loading?: boolean
  organizationName?: string
}

export function MaturityAnalysis({ stats, loading, organizationName }: MaturityAnalysisProps) {
  const handleExportPDF = () => {
    if (!stats || !organizationName) return

    const doc = generateReport({
      title: 'Maturity Analysis Report',
      organization: organizationName,
      date: new Date(),
      type: 'maturity',
      data: stats
    })

    doc.save('maturity-analysis-report.pdf')
  }

  const handleGenerateReport = () => {
    if (!stats || !organizationName) return

    const doc = generateReport({
      title: 'Maturity Analysis Report',
      organization: organizationName,
      date: new Date(),
      type: 'maturity',
      data: stats
    })

    // Open in new window
    const pdfDataUri = doc.output('datauristring')
    window.open(pdfDataUri)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading maturity analysis...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
        <p className="text-gray-600 mb-4">Complete a maturity assessment to view analysis</p>
      </div>
    )
  }

  // Calculate average maturity level
  const calculateAverageLevel = () => {
    const { levelDistribution } = stats
    const totalLevels = Object.values(levelDistribution).reduce((a, b) => a + b, 0)
    if (totalLevels === 0) return 0

    const weightedSum = (
      levelDistribution.level1 +
      levelDistribution.level2 * 2 +
      levelDistribution.level3 * 3 +
      levelDistribution.level4 * 4 +
      levelDistribution.level5 * 5
    )

    return Math.round(weightedSum / totalLevels)
  }

  const averageLevel = calculateAverageLevel()

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-indigo-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Maturity Score</span>
            </div>
            <span className="text-2xl font-bold text-indigo-600">
              {stats.overallScore}%
            </span>
          </div>
          <div className="mt-2 flex items-center text-sm">
            {stats.overallTrend > 0 ? (
              <>
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+{stats.overallTrend}%</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-600">{stats.overallTrend}%</span>
              </>
            )}
            <span className="text-gray-500 ml-2">vs last assessment</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Assessments</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {stats.completedAssessments}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.lastAssessmentDate ? (
              `Last: ${new Date(stats.lastAssessmentDate).toLocaleDateString()}`
            ) : 'No assessments completed'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Average Level</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {averageLevel}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Out of 5 maturity levels
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Improvement</span>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {Object.values(stats.categoryScores).filter(s => s.trend > 0).length}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Categories improving
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Category Analysis</h2>
          <RouterLink 
            to="/bcdr/maturity" 
            className="text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </RouterLink>
        </div>
        <div className="space-y-4">
          {Object.entries(stats.categoryScores).map(([category, data]) => (
            <div key={category} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{category}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Level {data.level}</span>
                  <span className="text-sm font-medium text-gray-700">{data.score}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={clsx(
                    "h-full rounded-full transition-all duration-300",
                    data.level >= 4 ? "bg-green-500" :
                    data.level >= 3 ? "bg-yellow-500" :
                    "bg-red-500"
                  )}
                  style={{ width: `${data.score}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div
                      key={level}
                      className={clsx(
                        'w-2 h-2 rounded-full',
                        level <= data.level ? 'bg-indigo-600' : 'bg-gray-200'
                      )}
                    />
                  ))}
                  <span className="ml-2">Maturity Level {data.level}</span>
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
            </div>
          ))}
        </div>
      </div>

      {/* Maturity Level Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Maturity Level Distribution</h2>
        <div className="space-y-4">
          {[5, 4, 3, 2, 1].map(level => {
            const count = stats.levelDistribution[`level${level}` as keyof typeof stats.levelDistribution]
            const total = Object.values(stats.levelDistribution).reduce((a, b) => a + b, 0)
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0
            
            return (
              <div key={level} className="flex items-center space-x-4">
                <div className="w-24 text-sm font-medium text-gray-700">
                  Level {level}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={clsx(
                        "h-full rounded-full transition-all duration-300",
                        level >= 4 ? "bg-green-500" :
                        level >= 3 ? "bg-yellow-500" :
                        "bg-red-500"
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-500 text-right">
                  {percentage}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Maturity Improvement Recommendations</h2>
          <RouterLink 
            to="/bcdr/recommendations" 
            className="text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </RouterLink>
        </div>
        <div className="space-y-4">
          {Object.entries(stats.categoryScores)
            .filter(([_, data]) => data.level < 3)
            .map(([category, data]) => (
              <div key={category} className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="flex items-center text-yellow-800 font-medium mb-2">
                  <Target className="w-4 h-4 mr-2" />
                  {category}
                </div>
                <p className="text-sm text-yellow-700">
                  Current maturity level ({data.level}) is below target. Focus on improving {category.toLowerCase()} 
                  processes and documentation to reach at least level 3 maturity.
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}