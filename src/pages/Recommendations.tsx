import React, { useState, useEffect } from 'react'
import { 
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  Calendar
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/store'
import { format } from 'date-fns'
import type { Database } from '../lib/database.types'
import clsx from 'clsx'

type Recommendation = Database['public']['Tables']['bcdr_recommendations']['Row']
type Initiative = Database['public']['Tables']['improvement_initiatives']['Row']
type Metric = Database['public']['Tables']['improvement_metrics']['Row']

export function Recommendations() {
  const { organization, profile } = useAuthStore()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [initiatives, setInitiatives] = useState<Record<string, Initiative[]>>({})
  const [metrics, setMetrics] = useState<Record<string, Metric[]>>({})
  const [loading, setLoading] = useState(true)
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set())
  const [expandedInitiatives, setExpandedInitiatives] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState<'all' | 'strategic' | 'tactical' | 'operational'>('all')

  useEffect(() => {
    if (organization?.id) {
      fetchRecommendations()
    }
  }, [organization?.id])

  async function fetchRecommendations() {
    try {
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('bcdr_recommendations')
        .select('*')
        .eq('organization_id', organization?.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (recommendationsError) throw recommendationsError
      setRecommendations(recommendationsData || [])

      // Fetch initiatives for each recommendation
      for (const rec of recommendationsData || []) {
        const { data: initiativesData, error: initiativesError } = await supabase
          .from('improvement_initiatives')
          .select('*')
          .eq('recommendation_id', rec.id)
          .order('created_at', { ascending: false })

        if (initiativesError) throw initiativesError
        setInitiatives(prev => ({
          ...prev,
          [rec.id]: initiativesData || []
        }))

        // Fetch metrics for each initiative
        for (const init of initiativesData || []) {
          const { data: metricsData, error: metricsError } = await supabase
            .from('improvement_metrics')
            .select('*')
            .eq('initiative_id', init.id)
            .order('created_at', { ascending: false })

          if (metricsError) throw metricsError
          setMetrics(prev => ({
            ...prev,
            [init.id]: metricsData || []
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  function toggleRecommendation(recId: string) {
    setExpandedRecommendations(prev => {
      const next = new Set(prev)
      if (next.has(recId)) {
        next.delete(recId)
      } else {
        next.add(recId)
      }
      return next
    })
  }

  function toggleInitiative(initId: string) {
    setExpandedInitiatives(prev => {
      const next = new Set(prev)
      if (next.has(initId)) {
        next.delete(initId)
      } else {
        next.add(initId)
      }
      return next
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-indigo-100 text-indigo-800'
      case 'on_hold':
      case 'deferred':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRecommendations = activeCategory === 'all'
    ? recommendations
    : recommendations.filter(r => r.category === activeCategory)

  if (!profile?.role?.includes('admin') && !profile?.role?.includes('bcdr_manager')) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Recommendations & Improvements
            </h1>
            <p className="mt-2 text-gray-600">
              Track and manage BCDR program improvements based on assessment findings
            </p>
          </div>
          <div className="flex space-x-2">
            {(['all', 'strategic', 'tactical', 'operational'] as const).map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading recommendations...</p>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations</h3>
            <p className="text-gray-600">Complete assessments to generate recommendations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map(recommendation => (
              <div key={recommendation.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleRecommendation(recommendation.id)}
                        className="text-gray-500 hover:text-gray-700 mr-2"
                      >
                        {expandedRecommendations.has(recommendation.id) ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {recommendation.title}
                          </h3>
                          <span className={clsx(
                            'ml-2 px-2 py-1 text-xs font-medium rounded-full',
                            getPriorityColor(recommendation.priority)
                          )}>
                            {recommendation.priority.toUpperCase()}
                          </span>
                          <span className={clsx(
                            'ml-2 px-2 py-1 text-xs font-medium rounded-full',
                            getStatusColor(recommendation.status)
                          )}>
                            {recommendation.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {recommendation.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {recommendation.target_date && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          Due {format(new Date(recommendation.target_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </div>
                  </div>

                  {expandedRecommendations.has(recommendation.id) && (
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Impact Areas</h4>
                          <div className="space-y-1">
                            {recommendation.impact_areas.map((area, index) => (
                              <div key={index} className="flex items-center text-sm">
                                <Target className="w-4 h-4 text-gray-400 mr-2" />
                                {area}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Implementation</h4>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              Effort: {recommendation.estimated_effort}
                            </div>
                            <div className="flex items-center text-sm">
                              <AlertTriangle className="w-4 h-4 text-gray-400 mr-2" />
                              Complexity: {recommendation.implementation_complexity}
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Benefits & Risks</h4>
                          <div className="space-y-2">
                            {recommendation.benefits?.map((benefit, index) => (
                              <div key={index} className="flex items-center text-sm text-green-600">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                {benefit}
                              </div>
                            ))}
                            {recommendation.risks?.map((risk, index) => (
                              <div key={index} className="flex items-center text-sm text-red-600">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                {risk}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Initiatives */}
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-4">Improvement Initiatives</h4>
                        <div className="space-y-4">
                          {initiatives[recommendation.id]?.map(initiative => (
                            <div key={initiative.id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center">
                                    <h5 className="font-medium text-gray-900">{initiative.name}</h5>
                                    <span className={clsx(
                                      'ml-2 px-2 py-1 text-xs font-medium rounded-full',
                                      getStatusColor(initiative.status)
                                    )}>
                                      {initiative.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{initiative.description}</p>
                                </div>
                                <button
                                  onClick={() => toggleInitiative(initiative.id)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {expandedInitiatives.has(initiative.id) ? (
                                    <ChevronDown className="w-5 h-5" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5" />
                                  )}
                                </button>
                              </div>

                              {expandedInitiatives.has(initiative.id) && (
                                <div className="mt-4 space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h6 className="text-sm font-medium text-gray-700 mb-2">Progress</h6>
                                      <div className="relative pt-1">
                                        <div className="flex mb-2 items-center justify-between">
                                          <div>
                                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                              {initiative.progress_percentage || 0}%
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex h-2 mb-4 overflow-hidden bg-indigo-200 rounded">
                                          <div
                                            style={{ width: `${initiative.progress_percentage || 0}%` }}
                                            className="flex flex-col justify-center bg-indigo-500 rounded"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h6 className="text-sm font-medium text-gray-700 mb-2">Budget</h6>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                          <span className="text-sm">
                                            Allocated: ${initiative.budget_allocated?.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                          <span className="text-sm">
                                            Spent: ${initiative.budget_spent?.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Metrics */}
                                  <div>
                                    <h6 className="text-sm font-medium text-gray-700 mb-2">Metrics</h6>
                                    <div className="space-y-2">
                                      {metrics[initiative.id]?.map(metric => (
                                        <div key={metric.id} className="bg-gray-50 p-3 rounded-lg">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <span className="font-medium text-sm">{metric.metric_name}</span>
                                              <div className="text-xs text-gray-500 mt-1">
                                                {metric.description}
                                              </div>
                                            </div>
                                            <div className="text-sm">
                                              <div className="flex items-center space-x-2">
                                                <span className="text-gray-500">Current:</span>
                                                <span className="font-medium">
                                                  {JSON.stringify(metric.current_value)}
                                                  {metric.unit_of_measure && ` ${metric.unit_of_measure}`}
                                                </span>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <span className="text-gray-500">Target:</span>
                                                <span className="font-medium">
                                                  {JSON.stringify(metric.target_value)}
                                                  {metric.unit_of_measure && ` ${metric.unit_of_measure}`}
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}