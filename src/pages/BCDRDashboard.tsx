import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Shield,
  Server,
  FileText,
  BookOpen,
  Truck,
  ArrowUpRight,
  Building2,
  Users,
  Activity,
  TrendingUp,
  Info,
  BarChart3
} from 'lucide-react'
import { useAuthStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import clsx from 'clsx'
import ResiliencyScoring from './ResiliencyScoring';
import { MaturityAnalysis } from '../components/assessment-analysis/MaturityAnalysis';
import GapAnalysis from './GapAnalysis';

const MODULES = [
  {
    id: 'scoring',
    name: 'Resiliency Scoring',
    description: 'Evaluate program maturity and resilience',
    icon: Shield,
    route: '/bcdr/scoring',
    active: true,
    stats: null
  },
  {
    id: 'gap',
    name: 'Gap Analysis',
    description: 'Identify and track improvement areas',
    icon: TrendingUp,
    route: '/bcdr/gap-analysis',
    active: true,
    stats: null
  },
  {
    id: 'maturity',
    name: 'Maturity Assessment',
    description: 'Assess program maturity level',
    icon: Activity,
    route: '/bcdr/maturity',
    active: true,
    stats: null
  },
  {
    id: 'bia',
    name: 'Business Impact Analysis',
    description: 'Analyze process impacts and recovery',
    icon: Building2,
    route: '/bcdr/business-impact',
    active: true,
    stats: null
  },
  {
    id: 'departments',
    name: 'Departments',
    description: 'Department-level assessments',
    icon: Users,
    route: '/bcdr/departments',
    active: true,
    stats: null
  },
  {
    id: 'analysis',
    name: 'Assessment Analysis',
    description: 'Review and analyze assessment results',
    icon: BarChart3,
    route: '/bcdr/assessment-analysis',
    active: true,
    stats: null
  }
]

interface DashboardStats {
  activeUsers: number
  criticalProcesses: number
  lastAssessment: string | null
}

export function BCDRDashboard() {
  const navigate = useNavigate()
  const { organization } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    activeUsers: 0,
    criticalProcesses: 0,
    lastAssessment: null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organization?.id) {
      fetchQuestionsData1()
      fetchDashboardStats()
    }
  }, [organization?.id])

  const fetchDashboardStats = async () => {
    try {
      // Fetch active users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', organization?.id)

      if (usersError) throw usersError

      // Fetch critical processes
      const { data: processes, error: processesError } = await supabase
        .from('business_processes')
        .select('id')
        .eq('organization_id', organization?.id)
        .eq('priority', 'critical')

      if (processesError) throw processesError

      // Fetch last assessment
      const { data: assessments, error: assessmentsError } = await supabase
        .from('bcdr_assessments')
        .select('assessment_date')
        .eq('organization_id', organization?.id)
        .order('assessment_date', { ascending: false })
        .limit(1)

      if (assessmentsError) throw assessmentsError

      setStats({
        activeUsers: users?.length || 0,
        criticalProcesses: processes?.length || 0,
        lastAssessment: assessments?.[0]?.assessment_date || null
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      window.toast?.error('Failed to fetch dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestionsData1 = async () => {
    try {
      // Fetch the questions directly from the 'resiliency_questions' table
      const { data: ResiliencyQuestions, error: questionError1 } = await supabase
        .from("resiliency_questions")
        .select("*")
        .order("order_index");

      const { data: MaturityQuestions, error: questionError2 } = await supabase
        .from("maturity_assessment_questions")
        .select("*")
        .order("maturity_level", { ascending: true })
        .order("order_index");

      const { data: GapAnalysisQuestions, error: questionError3 } = await supabase
        .from("gap_analysis_questions")
        .select("*")
        .order("order_index");
      // Set the questions state
      // console.log(ResiliencyQuestions , " ResiliencyQuestions")
      // console.log(MaturityQuestions , " MaturityQuestions")
      console.log(GapAnalysisQuestions, " GapAnalysisQuestions")
    } catch (error) {
      console.error("Error fetching questions data:", error);
    };
  }

  const handleModuleClick = (moduleId: string, route: string) => {
    navigate(route)
  }

  return (
    <div className="space-y-6">
      {/* Organization Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              BCDR Dashboard
            </h1>
            <p className="mt-1 text-gray-600">
              {organization?.name}
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-gray-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Getting Started</h3>
              <p className="mt-1 text-sm text-gray-600">
                Complete the assessments to determine your organization's resilience score.
                Start with Maturity Assessment, Gap Analysis, and Business Impact Analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Building2 className="w-4 h-4 mr-1" />
              Critical Processes
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '-' : stats.criticalProcesses}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Users className="w-4 h-4 mr-1" />
              Active Users
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '-' : stats.activeUsers}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              Last Assessment
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? '-' : stats.lastAssessment ?
                new Date(stats.lastAssessment).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                }) :
                '-'
              }
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map(module => {
            const Icon = module.icon
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.id, module.route)}
                disabled={!module.active}
                className={clsx(
                  "text-left p-6 rounded-lg border-2 transition-all duration-200",
                  module.active
                    ? "border-gray-200 hover:border-indigo-500 hover:shadow-md bg-white"
                    : "border-gray-200 opacity-75 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 text-gray-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">{module.name}</h2>
                  </div>
                  {module.active && (
                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>

                {module.stats ? (
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Score</div>
                      <div className="text-2xl font-bold text-gray-900">{module.stats.score}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Trend</div>
                      <div className="text-sm font-medium text-gray-900">{module.stats.trend}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-sm text-gray-500">
                    No assessments completed
                  </div>
                )}

                {!module.active && (
                  <div className="mt-4 text-sm text-gray-500">
                    Coming soon
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}