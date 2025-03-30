import React from 'react'
import { 
  FileText, 
  AlertTriangle, 
  Users, 
  Building2, 
  Truck, 
  MessageSquare,
  Shield,
  HardDrive,
  Laptop,
  Phone
} from 'lucide-react'
import clsx from 'clsx'

export type PlanType = 
  | 'bcp' 
  | 'bia' 
  | 'risk' 
  | 'crisis' 
  | 'incident' 
  | 'emergency' 
  | 'supply-chain'
  | 'remote-work'
  | 'communication'
  | 'policy'

interface PlanTemplate {
  id: PlanType
  name: string
  description: string
  icon: React.ElementType
  standards: string[]
}

const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'bcp',
    name: 'Business Continuity Plan',
    description: 'Comprehensive plan for maintaining business operations during disruptions',
    icon: FileText,
    standards: ['ISO 22301', 'NIST SP 800-34', 'BCI GPG']
  },
  {
    id: 'bia',
    name: 'Business Impact Analysis',
    description: 'Analysis of critical business functions and impact of disruption',
    icon: Building2,
    standards: ['ISO 22301', 'NIST SP 800-34']
  },
  {
    id: 'risk',
    name: 'Risk Assessment Report',
    description: 'Evaluation of threats, vulnerabilities and risk levels',
    icon: AlertTriangle,
    standards: ['ISO 31000', 'NIST SP 800-30']
  },
  {
    id: 'crisis',
    name: 'Crisis Management Plan',
    description: 'Procedures for managing and responding to crisis situations',
    icon: Shield,
    standards: ['ISO 22301', 'NFPA 1600']
  },
  {
    id: 'incident',
    name: 'Incident Response Plan',
    description: 'Procedures for detecting, responding to and resolving incidents',
    icon: HardDrive,
    standards: ['ISO 27001', 'NIST SP 800-61']
  },
  {
    id: 'emergency',
    name: 'Emergency Response Plan',
    description: 'Procedures for responding to immediate threats to safety',
    icon: AlertTriangle,
    standards: ['NFPA 1600', 'OSHA 1910.38']
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain Continuity',
    description: 'Plan for managing supply chain disruptions and vendor issues',
    icon: Truck,
    standards: ['ISO 28000', 'ISO 22301']
  },
  {
    id: 'remote-work',
    name: 'Remote Work Plan',
    description: 'Guidelines and procedures for remote work operations',
    icon: Laptop,
    standards: ['ISO 27001', 'NIST SP 800-46']
  },
  {
    id: 'communication',
    name: 'Communication Plan',
    description: 'Procedures for internal and external communications',
    icon: Phone,
    standards: ['ISO 22301', 'NFPA 1600']
  },
  {
    id: 'policy',
    name: 'BCDR Policy',
    description: 'High-level policy defining BCDR objectives and requirements',
    icon: FileText,
    standards: ['ISO 22301', 'NIST SP 800-34']
  }
]

interface PlanTemplateSelectorProps {
  onSelect: (template: PlanTemplate) => void
}

export function PlanTemplateSelector({ onSelect }: PlanTemplateSelectorProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Select Plan Template</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLAN_TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={clsx(
              'p-6 rounded-lg border-2 border-gray-200 hover:border-indigo-500',
              'transition-all duration-200 text-left group',
              'hover:shadow-md hover:bg-indigo-50'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <template.icon className="w-6 h-6 text-indigo-600" />
              <div className="flex space-x-1">
                {template.standards.map(standard => (
                  <span 
                    key={standard}
                    className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700"
                  >
                    {standard}
                  </span>
                ))}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600">
              {template.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}