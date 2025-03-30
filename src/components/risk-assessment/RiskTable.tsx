import React, { useState } from 'react'
import { 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Shield,
  Edit2,
  Trash2,
  FileText
} from 'lucide-react'
import clsx from 'clsx'

interface Risk {
  id: string
  title: string
  category: string
  likelihood: string
  impact: string
  score: number
  status: string
  owner: string
  lastUpdated: string
  description: string
  controls: string[]
  treatment: string
}

export function RiskTable() {
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null)

  // Sample data - replace with actual data from API
  const risks: Risk[] = [
    {
      id: '1',
      title: 'Data Center Outage',
      category: 'it',
      likelihood: 'possible',
      impact: 'critical',
      score: 85,
      status: 'open',
      owner: 'IT Director',
      lastUpdated: '2025-03-19',
      description: 'Complete loss of primary data center services',
      controls: [
        'Redundant power systems',
        'Backup generators',
        'UPS systems'
      ],
      treatment: 'mitigate'
    },
    {
      id: '2',
      title: 'Supply Chain Disruption',
      category: 'supply_chain',
      likelihood: 'likely',
      impact: 'high',
      score: 75,
      status: 'in_progress',
      owner: 'Operations Manager',
      lastUpdated: '2025-03-18',
      description: 'Critical supplier unable to deliver components',
      controls: [
        'Multiple suppliers',
        'Safety stock',
        'Alternative materials'
      ],
      treatment: 'mitigate'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'treated':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-orange-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Risk Register</h2>
        </div>
        <button className="btn-primary">
          Add Risk
        </button>
      </div>

      <div className="space-y-4">
        {risks.map(risk => (
          <div key={risk.id} className="border border-gray-200 rounded-lg">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                    className="text-gray-500 hover:text-gray-700 mr-2"
                  >
                    {expandedRisk === risk.id ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {risk.title}
                      </h3>
                      <span className={clsx(
                        'ml-2 px-2 py-1 text-xs font-medium rounded-full',
                        getStatusColor(risk.status)
                      )}>
                        {risk.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Shield className="w-4 h-4 mr-1" />
                      Risk Score: 
                      <span className={clsx('ml-1 font-medium', getScoreColor(risk.score))}>
                        {risk.score}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="p-1 text-indigo-600 hover:text-indigo-900">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button className="p-1 text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {expandedRisk === risk.id && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Description</h4>
                      <p className="mt-1 text-sm text-gray-600">{risk.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Current Controls</h4>
                      <ul className="mt-1 space-y-1">
                        {risk.controls.map((control, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <Shield className="w-4 h-4 mr-2 text-indigo-500" />
                            {control}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Risk Details</h4>
                      <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Likelihood:</span>
                          <span className="ml-2 text-gray-900 capitalize">{risk.likelihood}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Impact:</span>
                          <span className="ml-2 text-gray-900 capitalize">{risk.impact}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Owner:</span>
                          <span className="ml-2 text-gray-900">{risk.owner}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <span className="ml-2 text-gray-900">{risk.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Treatment Strategy</h4>
                      <p className="mt-1 text-sm text-gray-600 capitalize">{risk.treatment}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}