import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  ArrowRight // Added missing icon
} from 'lucide-react'
import { useAuthStore } from '../lib/store'

const FEATURES = [
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

export function Landing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleModuleClick = (moduleId: string, route: string) => {
    if (moduleId === 'bcdr') {
      navigate(route)
    } else {
      window.toast?.info('This module is coming soon!')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-indigo-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Helios</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth" className="btn-primary">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Business Resilience</span>
              <span className="block text-indigo-600">Reimagined</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Helios delivers comprehensive business resilience solutions to help organizations prepare, respond, and thrive in the face of disruption.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link to="/auth" className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                  Start Free Trial
                </Link>
              </div>
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                <a href="#features" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Comprehensive Business Resilience Platform
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Everything you need to build, maintain, and improve your business resilience program.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.id} className="pt-6">
                    <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                      <div className="-mt-6">
                        <div>
                          <span className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{feature.name}</h3>
                        <p className="mt-5 text-base text-gray-500">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Start your free trial today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Experience the power of Helios risk-free for 30 days.
          </p>
          <Link
            to="/auth"
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto"
          >
            Sign up for free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Contact Us
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2025 Helios. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}