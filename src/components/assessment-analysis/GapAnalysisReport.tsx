import React from 'react'
import { 
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Download,
  Printer,
  Info
} from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { generateReport } from '../../lib/reports'
import clsx from 'clsx'

interface GapAnalysisStats {
  totalAssessments: number
  completedAssessments: number
  averageScore: number
  criticalGaps: number
  highGaps: number
  mediumGaps: number
  lowGaps: number
  complianceScore: number
  lastAssessmentDate: string | null
  categoryScores: Record<string, {
    score: number
    trend: number
    evidenceCompliance: number
  }>
  trendData: Array<{
    date: string
    score: number
    gaps: number
  }>
}

interface GapAnalysisReportProps {
  stats: GapAnalysisStats | null
  loading?: boolean
  organizationName?: string
}

export function GapAnalysisReport({ stats, loading, organizationName }: GapAnalysisReportProps) {
  const handleExportPDF = () => {
    if (!stats || !organizationName) return

    const doc = generateReport({
      title: 'Gap Analysis Report',
      organization: organizationName,
      date: new Date(),
      type: 'gap',
      data: stats
    })

    doc.save('gap-analysis-report.pdf')
  }

  const handleGenerateReport = () => {
    if (!stats || !organizationName) return

    const doc = generateReport({
      title: 'Gap Analysis Report',
      organization: organizationName,
      date: new Date(),
      type: 'gap',
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
        <p className="mt-4 text-gray-600">Loading gap analysis...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
        <p className="text-gray-600 mb-4">Complete a gap analysis assessment to view analysis</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex justify-end space-x-4">
        <button 
          onClick={handleExportPDF}
          className="btn-secondary"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Analysis
        </button>
        <button 
          onClick={handleGenerateReport}
          className="btn-primary"
        >
          <Printer className="w-5 h-5 mr-2" />
          Generate Report
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <GitCompare className="w-5 h-5 text-indigo-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Overall Score</span>
            </div>
            <span className="text-2xl font-bold text-indigo-600">
              {stats.averageScore}%
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Based on {stats.completedAssessments} assessments
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Critical Gaps</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">
              {stats.criticalGaps}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            High priority gaps identified
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">High Gaps</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {stats.highGaps}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Significant gaps to address
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Compliance</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {stats.complianceScore}%
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Overall compliance score
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Category Analysis</h2>
          <RouterLink 
            to="/bcdr/gap-analysis" 
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
                <div className="flex items-center">
                  <span className={clsx(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    data.evidenceCompliance >= 80 ? "bg-green-100 text-green-800" :
                    data.evidenceCompliance >= 60 ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  )}>
                    {data.evidenceCompliance}% Evidence
                  </span>
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

      {/* Gap Distribution */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Gap Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-red-900">Critical</span>
              <span className="text-lg font-semibold text-red-900">{stats.criticalGaps}</span>
            </div>
            <div className="text-sm text-red-700">Require immediate attention</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-orange-900">High</span>
              <span className="text-lg font-semibold text-orange-900">{stats.highGaps}</span>
            </div>
            <div className="text-sm text-orange-700">Significant impact</div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-yellow-900">Medium</span>
              <span className="text-lg font-semibold text-yellow-900">{stats.mediumGaps}</span>
            </div>
            <div className="text-sm text-yellow-700">Moderate impact</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-900">Low</span>
              <span className="text-lg font-semibold text-green-900">{stats.lowGaps}</span>
            </div>
            <div className="text-sm text-green-700">Minor impact</div>
          </div>
        </div>
      </div>
    </div>
  )
}