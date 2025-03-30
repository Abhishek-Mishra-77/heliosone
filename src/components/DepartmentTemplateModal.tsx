import React from 'react'
import { 
  Building2, 
  Server, 
  DollarSign, 
  Users, 
  Briefcase,
  Shield,
  Factory,
  Truck,
  HeartPulse,
  ChevronRight,
  X
} from 'lucide-react'
import clsx from 'clsx'

export interface DepartmentTemplate {
  id: string
  name: string
  description: string
  type: 'department' | 'business_unit' | 'team' | 'division'
  icon: React.ElementType
  category: string
  standardRefs: string[]
}

const DEPARTMENT_TEMPLATES: DepartmentTemplate[] = [
  {
    id: 'it',
    name: 'Information Technology',
    description: 'IT infrastructure, operations, and service delivery',
    type: 'department',
    icon: Server,
    category: 'Technology',
    standardRefs: ['ISO 27001', 'ITIL', 'COBIT']
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Financial operations and accounting',
    type: 'department',
    icon: DollarSign,
    category: 'Finance',
    standardRefs: ['SOX', 'IFRS', 'GAAP']
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Personnel management and workplace safety',
    type: 'department',
    icon: Users,
    category: 'Administration',
    standardRefs: ['ISO 45001', 'OSHA']
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Business operations and process management',
    type: 'department',
    icon: Briefcase,
    category: 'Operations',
    standardRefs: ['ISO 9001', 'Six Sigma']
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Physical and information security',
    type: 'department',
    icon: Shield,
    category: 'Security',
    standardRefs: ['ISO 27001', 'NIST CSF']
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    description: 'Production and quality control',
    type: 'department',
    icon: Factory,
    category: 'Operations',
    standardRefs: ['ISO 9001', 'ISO 14001']
  },
  {
    id: 'logistics',
    name: 'Logistics',
    description: 'Supply chain and distribution',
    type: 'department',
    icon: Truck,
    category: 'Operations',
    standardRefs: ['ISO 28000', 'CSCMP']
  },
  {
    id: 'healthcare',
    name: 'Healthcare Services',
    description: 'Healthcare delivery and patient care',
    type: 'department',
    icon: HeartPulse,
    category: 'Healthcare',
    standardRefs: ['HIPAA', 'JCI', 'ISO 13485']
  }
]

interface DepartmentTemplateModalProps {
  show: boolean
  onClose: () => void
  onSelect: (template: DepartmentTemplate) => void
}

export function DepartmentTemplateModal({ 
  show, 
  onClose, 
  onSelect 
}: DepartmentTemplateModalProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Select Department Template</h2>
            <p className="mt-1 text-sm text-gray-600">
              Choose from industry-standard department templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEPARTMENT_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="flex items-start p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
              >
                <template.icon className="w-6 h-6 text-indigo-600 mt-1" />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-medium text-gray-900">
                      {template.name}
                    </h3>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={clsx(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                      template.category === 'Technology' && "bg-blue-100 text-blue-800",
                      template.category === 'Finance' && "bg-green-100 text-green-800",
                      template.category === 'Administration' && "bg-purple-100 text-purple-800",
                      template.category === 'Operations' && "bg-orange-100 text-orange-800",
                      template.category === 'Security' && "bg-red-100 text-red-800",
                      template.category === 'Healthcare' && "bg-pink-100 text-pink-800"
                    )}>
                      {template.category}
                    </span>
                    {template.standardRefs.map(ref => (
                      <span key={ref} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}