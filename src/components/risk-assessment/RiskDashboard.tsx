import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  TrendingUp, 
  BarChart3, 
  Shield,
  Building2,
  Download,
  Printer,
  Info
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../lib/store'
import { RiskHeatmap } from './RiskHeatmap'
import { RiskTable } from './RiskTable'
import { RiskTrends } from './RiskTrends'
import clsx from 'clsx'

interface RiskStats {
  totalRisks: number
  criticalRisks: number
  highRisks: number
  mediumRisks: number
  lowRisks: number
  avgScore: number
  trendPercentage: number
  byCategory: Record<string, {
    count: number
    score: number
    trend: number
  }>
}

export function RiskDashboard() {
  const { organization } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<RiskStats | null>(null)
  const [activeView, setActiveView] = useState<'heatmap' | 'table' | 'trends'>('heatmap')

  useEffect(() => {
    if (organization?.id) {
      fetchRiskStats()
    }
  }, [organization?.id])

  const fetchRiskStats = async () => {
    try {
      setLoading(true)
      // Fetch risk findings
      const { data: findings, error: findingsError } = await supabase
        .from('risk_findings')
        .select(`
          *,
          risk_assessments!inner(organization_id),
          risk_categories(*)
        `)
        .eq('risk_assessments.organization_id', organization?.id)

      if (findingsError) throw findingsError

      // Calculate statistics
      const stats: RiskStats = {
        totalRisks: findings?.length || 0,
        criticalRisks: findings?.filter(f => f.impact === 'critical').length || 0,
        highRisks: findings?.filter(f => f.impact === 'high').length || 0,
        mediumRisks: findings?.filter(f => f.impact === 'medium').length || 0,
        lowRisks: findings?.filter(f => f.impact === 'low').length || 0,
        avgScore: findings?.reduce((acc, f) => acc + f.inherent_risk_score, 0) / findings?.length || 0,
        trendPercentage: 0,
        byCategory: {}
      }

      // Calculate category stats
      findings?.forEach(finding => {
        const category = finding.risk_categories.type
        if (!stats.byCategory[category]) {
          stats.byCategory[category] = {
            count: 0,
            score: 0,
            trend: 0
          }
        }
        stats.byCategory[category].count++
        stats.byCategory[category].score += finding.inherent_risk_score
      })

      // Calculate averages
      Object.keys(stats.byCategory).forEach(category => {
        stats.byCategory[category].score /= stats.byCategory[category].count
      })

      setStats(stats)
    } catch (error) {
      console.error('Error fetching risk stats:', error)
      window.toast?.error('Failed to fetch risk statistics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading risk analysis...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Risk Assessment</h1>
            <p className="mt-1 text-gray-600">
              Comprehensive risk analysis and monitoring
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Critical Risks</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {stats?.criticalRisks}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Require immediate attention
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">High Risks</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {stats?.highRisks}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Significant impact potential
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Risk Score</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(stats?.avgScore || 0)}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Overall risk rating
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-600">Treated Risks</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {stats?.totalRisks - (stats?.criticalRisks + stats?.highRisks)}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Effectively managed
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveView('heatmap')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeView === 'heatmap'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Risk Heatmap
          </button>
          <button
            onClick={() => setActiveView('table')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeView === 'table'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Risk Register
          </button>
          <button
            onClick={() => setActiveView('trends')}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeView === 'trends'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            Risk Trends
          </button>
        </div>

        {/* Active View */}
        {activeView === 'heatmap' && <RiskHeatmap  organization={organization}/>}
        {activeView === 'table' && <RiskTable />}
        {activeView === 'trends' && <RiskTrends />}

      </div>
    </div>
  )
}