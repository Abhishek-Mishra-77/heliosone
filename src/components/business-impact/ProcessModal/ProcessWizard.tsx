import React, { useState } from 'react'
import { 
  FileText, 
  Network, 
  Database, 
  Globe,
  Leaf,
  ArrowRight,
  ArrowLeft,
  Info,
  HelpCircle
} from 'lucide-react'
import type { BusinessProcess } from '../../../types/business-impact'
import { BasicInformation } from './BasicInformation'
import { DependencyMapping } from './DependencyMapping'
import { DataRequirements } from './DataRequirements'
import { AdditionalImpacts } from './AdditionalImpacts'
import { v4 as uuidv4 } from 'uuid'
import clsx from 'clsx'

interface ProcessWizardProps {
  show: boolean
  process?: BusinessProcess
  onClose: () => void
  onSave: (process: BusinessProcess) => void
}

const WIZARD_STEPS = [
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Process details and classification',
    icon: FileText,
    helpText: `
      This step collects fundamental information about the business process:
      - Process name and description
      - Priority level and category
      - Process owner and stakeholders
      - Critical periods and alternative procedures

      Industry Standards:
      - ISO 22301:2019 Section 8.2.2 - Business Impact Analysis
      - NIST SP 800-34 Section 3.2 - Business Impact Analysis
    `
  },
  {
    id: 'dependencies',
    title: 'Dependencies',
    description: 'Applications, infrastructure, and external dependencies',
    icon: Network,
    helpText: `
      Map all dependencies required for process operation:
      - Application dependencies (internal/external)
      - Infrastructure components
      - External service providers
      - Third-party relationships

      Industry Standards:
      - ISO 22301:2019 Section 8.2.3 - Resource Requirements
      - NIST SP 800-34 Section 3.4.2 - System Resource Requirements
    `
  },
  {
    id: 'data',
    title: 'Data Requirements',
    description: 'Data classification and protection requirements',
    icon: Database,
    helpText: `
      Define data management requirements:
      - Data classification level
      - Backup frequency needs
      - Retention requirements
      - Compliance obligations

      Industry Standards:
      - ISO 22301:2019 Section 8.2.4 - Information and Data Requirements
      - NIST SP 800-34 Section 3.4.3 - Data Backup Requirements
    `
  },
  {
    id: 'impacts',
    title: 'Additional Impacts',
    description: 'Supply chain, cross-border, and environmental impacts',
    icon: Globe,
    helpText: `
      Assess additional impact areas:
      - Supply chain dependencies and risks
      - Cross-border operational impacts
      - Environmental considerations
      - Regulatory implications

      Industry Standards:
      - ISO 22301:2019 Section 8.2.2 - Impact Categories
      - NIST SP 800-34 Section 3.2.3 - Impact Assessment
    `
  }
]

export function ProcessWizard({
  show,
  process,
  onClose,
  onSave
}: ProcessWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const [formData, setFormData] = useState<Partial<BusinessProcess>>(
    process || {
      id: uuidv4(),
      priority: 'medium',
      dependencies: [],
      stakeholders: [],
      criticalPeriods: [],
      costs: {
        direct: 0,
        indirect: 0,
        recovery: 0
      },
      applications: [],
      infrastructureDependencies: [],
      externalDependencies: [],
      dataRequirements: {
        classification: 'internal',
        backupFrequency: 'daily',
        retentionPeriod: '30 days'
      },
      supplyChainImpact: {
        dependencies: [],
        score: 0,
        details: ''
      },
      crossBorderOperations: {
        regions: [],
        operationTypes: [],
        regulatoryRequirements: [],
        score: 0,
        details: ''
      },
      environmentalImpact: {
        types: [],
        metrics: {},
        score: 0,
        details: '',
        mitigationStrategies: []
      }
    }
  )

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onSave(formData as BusinessProcess)
  }

  const validateStep = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return !!(formData.name && formData.description && formData.owner && formData.category)
      case 1: // Dependencies
        return true // Optional step
      case 2: // Data Requirements
        return !!(formData.dataRequirements?.classification && formData.dataRequirements?.backupFrequency)
      case 3: // Additional Impacts
        return true // Optional step
      default:
        return false
    }
  }

  if (!show) return null

  const currentStepData = WIZARD_STEPS[currentStep]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {process ? "Edit Process" : "Add Process"}
            </h2>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-gray-400 hover:text-gray-600"
              title="Show help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="mt-4 flex items-center space-x-4">
            {WIZARD_STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className={clsx(
                    'flex-1',
                    index !== WIZARD_STEPS.length - 1 && 'relative'
                  )}
                >
                  <div className="flex items-center">
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        index === currentStep
                          ? 'bg-indigo-600 text-white'
                          : index < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-900">
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index !== WIZARD_STEPS.length - 1 && (
                    <div
                      className={clsx(
                        'absolute top-4 w-full h-0.5',
                        index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {/* Help Panel */}
          {showHelp && (
            <div className="mb-6 bg-indigo-50 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-indigo-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-indigo-900 mb-2">
                    Help & Guidelines
                  </h4>
                  <div className="text-sm text-indigo-800 whitespace-pre-line">
                    {currentStepData.helpText}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 0 && (
              <BasicInformation 
                formData={formData} 
                setFormData={setFormData} 
              />
            )}

            {currentStep === 1 && (
              <DependencyMapping 
                formData={formData} 
                setFormData={setFormData} 
              />
            )}

            {currentStep === 2 && (
              <DataRequirements 
                formData={formData} 
                setFormData={setFormData} 
              />
            )}

            {currentStep === 3 && (
              <AdditionalImpacts
                formData={formData}
                setFormData={setFormData}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={currentStep === 0 ? onClose : handleBack}
              className="btn-secondary"
            >
              {currentStep === 0 ? (
                'Cancel'
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateStep()}
              className={clsx(
                'btn-primary',
                !validateStep() && 'opacity-50 cursor-not-allowed'
              )}
            >
              {currentStep === WIZARD_STEPS.length - 1 ? (
                'Complete'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}