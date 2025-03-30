import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  AlertCircle,
  Calendar,
  Activity,
  FileText,
  TrendingUp,
  Lightbulb
} from 'lucide-react'
import { useAssessmentStore, useAuthStore } from '../lib/store'
import clsx from 'clsx'
import { format } from 'date-fns'

export function DashboardPage() {
  const { organization, profile } = useAuthStore()
  const { assessments, fetchAssessments } = useAssessmentStore()
  const isPlatformAdmin = profile?.role === 'super_admin'

  useEffect(() => {
    fetchAssessments()
  }, [])

  const stats = [
    {
      name: 'Current Resiliency Score',
      value: '78%',
      change: '+2.3%',
      changeType: 'positive',
      icon: Shield,
      description: 'Overall organizational readiness',
      trend: [65, 70, 72, 75, 78],
    },
    {
      name: 'Critical Gaps',
      value: '3',
      change: '-2',
      changeType: 'positive',
      icon: AlertTriangle,
      description: 'High-priority items requiring attention',
      severity: 'medium',
    },
    {
      name: 'Completed Assessments',
      value: assessments.filter(a => a.status === 'completed').length.toString(),
      icon: CheckCircle,
      description: 'Total assessments completed',
      lastCompleted: '2 days ago',
    },
    {
      name: 'Next Review Due',
      value: '12 days',
      icon: Clock,
      description: 'Time until next required assessment',
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    },
  ]

  const recentActivities = [
    { type: 'assessment', name: 'Maturity Assessment', date: '2 days ago', score: 85 },
    { type: 'gap', name: 'New Critical Gap Identified', date: '3 days ago', priority: 'high' },
    { type: 'review', name: 'Quarterly Review', date: '1 week ago', status: 'completed' },
    { type: 'update', name: 'Recovery Plan Updated', date: '2 weeks ago', version: '2.1' },
  ]

  const upcomingTasks = [
    { name: 'Review Incident Response Plan', due: '3 days', priority: 'high' },
    { name: 'Update Emergency Contact List', due: '1 week', priority: 'medium' },
    { name: 'Conduct Tabletop Exercise', due: '2 weeks', priority: 'high' },
    { name: 'Vendor Assessment Review', due: '3 weeks', priority: 'medium' },
  ]

  return (
    <div className="space-y-6">
      {/* BCDR Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Business Continuity & Disaster Recovery
            </h1>
            <p className="mt-1 text-gray-600">
              {organization?.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">BCDR Maturity Score</div>
              <div className="text-3xl font-bold text-indigo-600">78%</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            to="/scoring"
            className="card-gradient from-blue-500 to-blue-600 p-4 text-white hover:from-blue-600 hover:to-blue-700 group"
          >
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5" />
              <ArrowUpRight className="w-4 h-4 transform transition-transform group-hover:translate-x-0.5" />
            </div>
            <h3 className="font-semibold">Resiliency Scoring</h3>
            <p className="text-sm text-white/90 mt-1">Evaluate program maturity</p>
          </Link>

          <Link
            to="/gap-analysis"
            className="card-gradient from-orange-500 to-orange-600 p-4 text-white hover:from-orange-600 hover:to-orange-700 group"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-5 h-5" />
              <ArrowUpRight className="w-4 h-4 transform transition-transform group-hover:translate-x-0.5" />
            </div>
            <h3 className="font-semibold">Gap Analysis</h3>
            <p className="text-sm text-white/90 mt-1">Identify improvement areas</p>
          </Link>

          <Link
            to="/business-impact-analysis"
            className="card-gradient from-indigo-500 to-indigo-600 p-4 text-white hover:from-indigo-600 hover:to-indigo-700 group"
          >
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5" />
              <ArrowUpRight className="w-4 h-4 transform transition-transform group-hover:translate-x-0.5" />
            </div>
            <h3 className="font-semibold">Business Impact</h3>
            <p className="text-sm text-white/90 mt-1">Analyze process impacts</p>
          </Link>

          <Link
            to="/recommendations"
            className="card-gradient from-purple-500 to-purple-600 p-4 text-white hover:from-purple-600 hover:to-purple-700 group"
          >
            <div className="flex items-center justify-between mb-2">
              <Lightbulb className="w-5 h-5" />
              <ArrowUpRight className="w-4 h-4 transform transition-transform group-hover:translate-x-0.5" />
            </div>
            <h3 className="font-semibold">Recommendations</h3>
            <p className="text-sm text-white/90 mt-1">View improvement actions</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.name} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  {stat.change && (
                    <span
                      className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        stat.changeType === 'positive' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      )}
                    >
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 mr-1" />
                      )}
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  {stat.trend && (
                    <div className="ml-2 flex items-center">
                      {stat.trend.map((value, i) => (
                        <div
                          key={i}
                          className="w-1 mx-0.5 rounded-full bg-indigo-200"
                          style={{ height: `${value * 0.4}px` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">{stat.description}</p>
                {stat.severity && (
                  <span
                    className={clsx(
                      'mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      {
                        'bg-red-100 text-red-800': stat.severity === 'high',
                        'bg-yellow-100 text-yellow-800': stat.severity === 'medium',
                        'bg-green-100 text-green-800': stat.severity === 'low',
                      }
                    )}
                  >
                    {stat.severity.toUpperCase()} Priority
                  </span>
                )}
                {stat.dueDate && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(stat.dueDate, 'MMM d, yyyy')}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className="mr-4">
                    {activity.type === 'assessment' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {activity.type === 'gap' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    {activity.type === 'review' && <Clock className="w-5 h-5 text-blue-500" />}
                    {activity.type === 'update' && <TrendingUp className="w-5 h-5 text-indigo-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
                {activity.score && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {activity.score}%
                  </span>
                )}
                {activity.priority && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {activity.priority.toUpperCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.name}</p>
                    <p className="text-xs text-gray-500">Due in {task.due}</p>
                  </div>
                </div>
                <span
                  className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    {
                      'bg-red-100 text-red-800': task.priority === 'high',
                      'bg-yellow-100 text-yellow-800': task.priority === 'medium',
                    }
                  )}
                >
                  {task.priority.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}