import React from 'react'
import { 
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  Users,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Download,
  Printer
} from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import { generateReport } from '../../lib/reports'
import clsx from 'clsx'

interface DepartmentStats {
  totalDepartments: number
  assessedDepartments: number
  overallScore: number
  overallTrend: number
  lastAssessmentDate: string | null
  departmentScores: Record<string, {
    score: number
    trend: number
    completionRate: number
    criticalFindings: number
    status: 'completed' | 'in_progress' | 'pending' | 'overdue'
    evidenceCompliance: number
  }>
  assessmentTypes: Record<string, {
    completed: number
    total: number
    averageScore: number
  }>
}

interface DepartmentAnalysisProps {
  stats: DepartmentStats | null
  loading?: boolean
  organizationName?: string
}

export function DepartmentAnalysis({ stats, loading, organizationName }: DepartmentAnalysisProps) {
  const handleExportPDF = () => {
    if (!stats || !organizationName) return

    const doc = generateReport({
      title: 'Department Analysis Report',
      organization: organizationName,
      date: new Date(),
      type: 'department',
      data: stats
    })

    doc.save('department-analysis-report.pdf')
  }

  const handleGenerateReport = () => {
    if (!stats || !organizationName) return

    const doc = generateReport({
      title: 'Department Analysis Report',
      organization: organizationName,
      date: new Date(),
      type: 'department',
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
        <p className="mt-4 text-gray-600">Loading department analysis...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
        <p className="text-gray-600 mb-4">Complete department assessments to view analysis</p>
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
              <Building2 className="w-5 h-5 text-indigo-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Departments</span>
            </div>
            <span className="text-2xl font-bold text-indigo-600">
              {stats.assessedDepartments}/{stats.totalDepartments}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Departments assessed
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Overall Score</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">
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

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Critical Findings</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">
              {Object.values(stats.departmentScores).reduce((acc, dept) => 
                acc + dept.criticalFindings, 0
              )}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Across all departments
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Completion</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {Math.round((stats.assessedDepartments / stats.totalDepartments) * 100)}%
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Assessment completion rate
          </div>
        </div>
      </div>

      {/* Department Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Department Analysis</h2>
          <RouterLink 
            to="/bcdr/departments" 
            className="text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </RouterLink>
        </div>
        <div className="space-y-4">
          {Object.entries(stats.departmentScores).length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No department data available</p>
            </div>
          ) : (
            Object.entries(stats.departmentScores).map(([department, data]) => (
              <div key={department} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{department}</span>
                    <span className={clsx(
                      "ml-2 px-2 py-0.5 rounded-full text-xs font-medium",
                      {
                        'bg-green-100 text-green-800': data.status === 'completed',
                        'bg-blue-100 text-blue-800': data.status === 'in_progress',
                        'bg-yellow-100 text-yellow-800': data.status === 'pending',
                        'bg-red-100 text-red-800': data.status === 'overdue'
                      }
                    )}>
                      {data.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">{data.score}%</span>
                  </div>
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
                    <span className="text-gray-600">Completion: {data.completionRate}%</span>
                    {data.criticalFindings > 0 && (
                      <span className="text-red-600 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {data.criticalFindings} critical
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assessment Type Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Assessment Type Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(stats.assessmentTypes).length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg md:col-span-3">
              <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No assessment type data available</p>
            </div>
          ) : (
            Object.entries(stats.assessmentTypes).map(([type, data]) => (
              <div key={type} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{type}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {data.completed}/{data.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(data.completed / data.total) * 100}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Avg Score: {data.averageScore}%
                  </span>
                  <span className="text-gray-500">
                    {Math.round((data.completed / data.total) * 100)}% Complete
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Department Recommendations</h2>
          <RouterLink 
            to="/bcdr/recommendations" 
            className="text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </RouterLink>
        </div>
        <div className="space-y-4">
          {Object.entries(stats.departmentScores)
            .filter(([_, data]) => data.score < 60 || data.criticalFindings > 0)
            .map(([department, data]) => (
              <div key={department} className="bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="flex items-center text-red-800 font-medium mb-2">
                  <Building2 className="w-4 h-4 mr-2" />
                  {department}
                </div>
                <p className="text-sm text-red-700">
                  {data.criticalFindings > 0 ? 
                    `${data.criticalFindings} critical findings require immediate attention. ` : ''}
                  Current score ({data.score}%) indicates significant gaps in departmental resilience.
                  Focus on completing remaining assessments and addressing identified issues.
                </p>
              </div>
            ))}
          {Object.entries(stats.departmentScores)
            .filter(([_, data]) => data.status === 'overdue')
            .map(([department, data]) => (
              <div key={`${department}-overdue`} className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                <div className="flex items-center text-yellow-800 font-medium mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {department}
                </div>
                <p className="text-sm text-yellow-700">
                  Department assessment is overdue. Current completion rate is {data.completionRate}%.
                  Prioritize completing the remaining assessment components.
                </p>
              </div>
            ))}
          {Object.entries(stats.departmentScores).length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No recommendations available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}