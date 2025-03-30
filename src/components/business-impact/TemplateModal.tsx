import React from 'react'
import { 
  Building2, 
  Server, 
  Settings, 
  ShoppingCart, 
  Briefcase, 
  HeartPulse, 
  Truck, 
  Factory 
} from 'lucide-react'

interface TemplateModalProps {
  show: boolean
  onClose: () => void
  onSelect: (templateKey: string) => void
}

export function TemplateModal({ show, onClose, onSelect }: TemplateModalProps) {
  if (!show) return null

  return (
    <div className="modal">
      <div className="modal-content max-w-4xl">
        <h2 className="modal-header">Select Process Template</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onSelect('financial')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center">
              <Building2 className="w-6 h-6 text-indigo-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Financial Services</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Core financial processes including accounting, treasury, and payroll operations
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('it')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center">
              <Server className="w-6 h-6 text-indigo-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Information Technology</h3>
                <p className="text-sm text-gray-500 mt-1">
                  IT infrastructure and systems including data centers and network operations
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('operations')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center">
              <Settings className="w-6 h-6 text-indigo-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Operations</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Supply chain and production management processes
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('sales')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center">
              <ShoppingCart className="w-6 h-6 text-indigo-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Sales & Customer Service</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Order processing and customer support operations
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('hr')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center">
              <Briefcase className="w-6 h-6 text-indigo-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Human Resources</h3>
                <p className="text-sm text-gray-500 mt-1">
                  HR operations including recruitment, benefits, and employee services
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('healthcare')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center">
              <HeartPulse className="w-6 h-6 text-indigo-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Healthcare</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Healthcare delivery and patient care operations
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('logistics')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center">
              <Truck className="w-6 h-6 text-indigo-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Logistics</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Transportation and distribution operations
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelect('manufacturing')}
            className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center">
              <Factory className="w-6 h-6 text-indigo-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manufacturing</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Production and quality control processes
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="modal-footer">
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