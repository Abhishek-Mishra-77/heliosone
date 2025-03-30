import React, { useState } from 'react'
import { PlanTemplateSelector, type PlanType } from '../components/plan-builder/PlanTemplateSelector'
import { PlanScopeSelector, type PlanScope } from '../components/plan-builder/PlanScopeSelector'
import { BCPBuilder } from '../components/plan-builder/BCPBuilder'

interface SelectedPlan {
  type: PlanType
  scope?: PlanScope
}

export function BCPBuilderPage() {
  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan | null>(null)

  const handleTemplateSelect = (template: { id: PlanType }) => {
    setSelectedPlan({ type: template.id })
  }

  const handleScopeSelect = (scope: PlanScope) => {
    if (selectedPlan) {
      setSelectedPlan({ ...selectedPlan, scope })
    }
  }

  const handleBack = () => {
    if (selectedPlan?.scope) {
      // Go back to scope selection
      setSelectedPlan({ type: selectedPlan.type })
    } else {
      // Go back to template selection
      setSelectedPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      {!selectedPlan ? (
        <PlanTemplateSelector onSelect={handleTemplateSelect} />
      ) : !selectedPlan.scope ? (
        <PlanScopeSelector 
          planType={selectedPlan.type}
          onSelect={handleScopeSelect}
          onBack={() => setSelectedPlan(null)}
        />
      ) : (
        <BCPBuilder 
          templateType={selectedPlan.type}
          scope={selectedPlan.scope}
          onBack={handleBack}
        />
      )}
    </div>
  )
}