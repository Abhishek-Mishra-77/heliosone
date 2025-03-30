import React from 'react'
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
  Info
} from 'lucide-react'
import { useAuthStore } from '../lib/store'
import clsx from 'clsx'

const MODULES = [
  {
    id: 'bcdr',
    name: 'BCDR',
    description: 'Business Continuity & Disaster Recovery',
    icon: Shield,
    route: '/bcdr',
    active: true
  },
  {
    id: 'adm',
    name: 'ADM',
    description: 'Application & Dependency Mapping',
    icon: Server,
    route: '/adm',
    active: false
  },
  {
    id: 'assets',
    name: 'Assets Manager',
    description: 'IT Asset Management',
    icon: FileText,
    route: '/assets',
    active: false
  },
  {
    id: 'compliance',
    name: 'Compliance',
    description: 'Regulatory Compliance Management',
    icon: BookOpen,
    route: '/compliance',
    active: false
  },
  {
    id: 'docvault',
    name: 'BCDR Vault',
    description: 'Documentation and Knowledge Vault',
    icon: FileText,
    route: '/docvault',
    active: false
  },
  {
    id: 'dcmigration',
    name: 'DC Migration Manager',
    description: 'Data Center Migration',
    icon: Truck,
    route: '/dcmigration',
    active: false
  }
]

export function ContinuousResilience() {
  const navigate = useNavigate()
  const { organization } = useAuthStore()

  const handleModuleClick = (moduleId: string, route: string) => {
    if (moduleId === 'bcdr') {
      navigate(route)
    } else {
      window.toast.info('This module is coming soon!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Organization Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Continuous Resilience Platform
            </h1>
            <p className="mt-1 text-gray-600">
              {organization?.name}
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-indigo-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-indigo-900">Getting Started</h3>
              <p className="mt-1 text-sm text-indigo-800">
                Complete the assessments in the BCDR module to determine your organization's resilience score. 
                Start with Maturity Assessment, Gap Analysis, and Business Impact Analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Building2 className="w-4 h-4 mr-1" />
              Departments
            </div>
            <div className="text-2xl font-bold text-gray-900">-</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Users className="w-4 h-4 mr-1" />
              Active Users
            </div>
            <div className="text-2xl font-bold text-gray-900">-</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Activity className="w-4 h-4 mr-1" />
              Active Modules
            </div>
            <div className="text-2xl font-bold text-gray-900">1/6</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              Last Assessment
            </div>
            <div className="text-2xl font-bold text-gray-900">-</div>
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
                  "text-left card-gradient p-6 text-white transition-all duration-200",
                  module.active 
                    ? "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transform hover:-translate-y-1"
                    : "from-gray-400 to-gray-500 opacity-75 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 mr-2" />
                    <h2 className="text-xl font-semibold">{module.name}</h2>
                  </div>
                  {module.active && (
                    <ArrowUpRight className="w-5 h-5 transform group-hover:translate-x-1" />
                  )}
                </div>
                <p className="text-sm text-white/90 mb-4">{module.description}</p>

                {!module.active && (
                  <div className="mt-4 text-sm text-white/75">
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