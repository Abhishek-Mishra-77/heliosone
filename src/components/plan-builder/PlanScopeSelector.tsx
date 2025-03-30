import React from 'react'
import { Building2, Users } from 'lucide-react'
import clsx from 'clsx'

export type PlanScope = 'organization' | 'department'

interface PlanScopeSelectorProps {
  planType: string
  onSelect: (scope: PlanScope) => void
  onBack: () => void
}

export function PlanScopeSelector({ planType, onSelect, onBack }: PlanScopeSelectorProps) {
  // These plan types can only be organization-wide
  const orgOnlyPlans = ['crisis', 'incident', 'policy']
  const isOrgOnly = orgOnlyPlans.includes(planType)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Select Plan Scope</h2>
      
      {isOrgOnly ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            This type of plan can only be created at the organization level.
          </p>
        </div>
      ) : (
        <p className="text-gray-600 mb-6">
          Choose whether this plan will be for the entire organization or a specific department.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onSelect('organization')}
          className={clsx(
            'p-6 rounded-lg border-2 transition-all duration-200 text-left group',
            'hover:shadow-md hover:border-indigo-500 hover:bg-indigo-50'
          )}
        >
          <div className="flex items-center mb-4">
            <Building2 className="w-6 h-6 text-indigo-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Organization-wide</h3>
          </div>
          <p className="text-sm text-gray-600">
            Create a plan that applies to the entire organization. This is suitable for company-wide policies and procedures.
          </p>
        </button>

        {!isOrgOnly && (
          <button
            onClick={() => onSelect('department')}
            className={clsx(
              'p-6 rounded-lg border-2 transition-all duration-200 text-left group',
              'hover:shadow-md hover:border-indigo-500 hover:bg-indigo-50'
            )}
          >
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-indigo-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Department-specific</h3>
            </div>
            <p className="text-sm text-gray-600">
              Create a plan for a specific department or business unit. This allows for customized procedures and requirements.
            </p>
          </button>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={onBack}
          className="btn-secondary"
        >
          Back to Templates
        </button>
      </div>
    </div>
  )
}