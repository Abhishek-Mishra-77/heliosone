import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Users, 
  Activity,
  Settings,
  TrendingUp,
  Shield,
  Server,
  Bell,
  ChevronRight,
  BarChart3,
  Clock
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

interface PlatformStats {
  totalOrganizations: number
  activeOrganizations: number
  totalUsers: number
  activeUsers: number
  averageScore: number
  totalAssessments: number
}

interface RecentActivity {
  id: string
  type: 'organization_added' | 'user_added' | 'assessment_completed' | 'module_activated'
  organizationName: string
  details: string
  timestamp: string
}

export function PlatformDashboard() {
  const [stats, setStats] = useState<PlatformStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalUsers: 0,
    activeUsers: 0,
    averageScore: 0,
    totalAssessments: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlatformStats()
    fetchRecentActivity()
  }, [])

  const fetchPlatformStats = async () => {
    try {
      // Fetch organizations
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id')
      
      // Fetch users
      const { data: users } = await supabase
        .from('users')
        .select('id')

      // Fetch assessments
      const { data: assessments } = await supabase
        .from('bcdr_assessments')
        .select('score')
        .not('score', 'is', null)

      setStats({
        totalOrganizations: orgs?.length || 0,
        activeOrganizations: orgs?.length || 0,
        totalUsers: users?.length || 0,
        activeUsers: users?.length || 0,
        averageScore: assessments?.reduce((acc, curr) => acc + curr.score, 0) / (assessments?.length || 1),
        totalAssessments: assessments?.length || 0
      })
    } catch (error) {
      console.error('Error fetching platform stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // This would be replaced with actual activity tracking
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'organization_added',
          organizationName: 'Acme Corp',
          details: 'New organization onboarded',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'assessment_completed',
          organizationName: 'TechCorp',
          details: 'BCDR Maturity Assessment completed',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      setRecentActivity(mockActivity)
    } catch (error) {
      console.error('Error fetching recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
            <p className="mt-1 text-gray-600">Monitor and manage the Helios platform</p>
          </div>
          <div className="flex space-x-4">
            <Link to="/admin/settings" className="btn-secondary">
              <Settings className="w-4 h-4 mr-2" />
              Platform Settings
            </Link>
            <button className="btn-primary">
              <Bell className="w-4 h-4 mr-2" />
              Send Announcement
            </button>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Organizations</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{stats.totalOrganizations}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.activeOrganizations}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
            <Link 
              to="/admin/organizations"
              className="flex items-center mt-4 text-sm text-indigo-600 hover:text-indigo-700"
            >
              View Organizations
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Users</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
            <Link 
              to="/admin/users"
              className="flex items-center mt-4 text-sm text-blue-600 hover:text-blue-700"
            >
              View Users
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Assessments</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalAssessments}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
                <div className="text-sm text-gray-500">Avg Score</div>
              </div>
            </div>
            <button 
              className="flex items-center mt-4 text-sm text-purple-600 hover:text-purple-700"
            >
              View Analytics
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Module Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Module Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <div className="font-medium">BCDR</div>
                  <div className="text-sm text-gray-500">12 active orgs</div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Live
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Server className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium">ADM</div>
                  <div className="text-sm text-gray-500">Coming Q2 2025</div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Beta
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <div className="font-medium">Assets</div>
                  <div className="text-sm text-gray-500">Coming Q3 2025</div>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Alpha
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Platform Activity</h3>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  {activity.type === 'organization_added' && (
                    <Building2 className="w-5 h-5 text-blue-600 mr-3" />
                  )}
                  {activity.type === 'assessment_completed' && (
                    <BarChart3 className="w-5 h-5 text-green-600 mr-3" />
                  )}
                  <div>
                    <div className="font-medium">{activity.organizationName}</div>
                    <div className="text-sm text-gray-500">{activity.details}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">
                    {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}