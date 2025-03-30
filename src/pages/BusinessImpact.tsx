import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  FileSearch, 
  Building2,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertTriangle,
  Save,
  Plus
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../lib/store'
import type { BusinessProcess } from '../types/business-impact'
import { TabNavigation } from '../components/business-impact/TabNavigation'
import { OverviewMetrics } from '../components/business-impact/OverviewMetrics'
import { ProcessAssessment } from '../components/business-impact/ProcessAssessment'
import { ImpactAssessment } from '../components/business-impact/ImpactAssessment'
import { TimeMetrics } from '../components/business-impact/TimeMetrics'
import { ProcessModal } from '../components/business-impact/ProcessModal'
import { TemplateModal } from '../components/business-impact/TemplateModal'
import { SaveProgressButton } from '../components/assessment/SaveProgressButton'
import { useAssessmentProgress } from '../hooks/useAssessmentProgress'
import { PROCESS_TEMPLATES } from '../components/business-impact/ProcessModal/templates'
import clsx from 'clsx'

const WORKFLOW_STEPS = [
  {
    id: 'process',
    title: 'Process Assessment',
    description: 'Document critical business processes',
    tab: 'process'
  },
  {
    id: 'impact',
    title: 'Impact Assessment', 
    description: 'Evaluate impact across different areas',
    tab: 'impact'
  },
  {
    id: 'time',
    title: 'Time Metrics',
    description: 'Define recovery time objectives',
    tab: 'time'
  }
] as const

export function BusinessImpact() {
  const { organization, profile } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'process' | 'impact' | 'time'>('process')
  const [processes, setProcesses] = useState<BusinessProcess[]>([])
  const [selectedProcess, setSelectedProcess] = useState<BusinessProcess | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exerciseStarted, setExerciseStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const { savedProgress, saving: savingProgress, saveProgress } = useAssessmentProgress('business_impact')

  const isAdmin = profile?.role === 'admin'
  const isPlatformAdmin = profile?.role === 'super_admin'
  const isDepartmentHead = profile?.role === 'department_head'
  const isTeamMember = ['assessor', 'viewer'].includes(profile?.role || '')

  // Redirect team members to BIA Analysis
  useEffect(() => {
    if (isTeamMember) {
      navigate('/bcdr/business-impact/analysis')
    }
  }, [isTeamMember, navigate])

  useEffect(() => {
    if (organization?.id) {
      fetchProcesses()
    }
  }, [organization?.id])

  async function fetchProcesses() {
    try {
      setLoading(true)
      setError(null)

      if (!organization?.id) {
        throw new Error('Organization data not available')
      }

      let query = supabase
        .from('business_processes')
        .select('*')
        .eq('organization_id', organization.id)

      // Department heads can only see their department's processes
      if (isDepartmentHead) {
        const { data: departmentUser } = await supabase
          .from('department_users')
          .select('department_id')
          .eq('user_id', profile?.id)
          .single()

        if (departmentUser) {
          query = query.eq('department_id', departmentUser.department_id)
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Convert snake_case to camelCase for frontend
      const processesWithCamelCase = (data || []).map(process => ({
        ...process,
        criticalPeriods: process.critical_periods,
        alternativeProcedures: process.alternative_procedures,
        revenueImpact: process.revenue_impact,
        operationalImpact: process.operational_impact,
        reputationalImpact: process.reputational_impact,
        infrastructureDependencies: process.infrastructure_dependencies,
        externalDependencies: process.external_dependencies,
        dataRequirements: process.data_requirements,
        supplyChainImpact: process.supply_chain_impact,
        crossBorderOperations: process.cross_border_operations,
        environmentalImpact: process.environmental_impact,
        // Remove snake_case versions
        critical_periods: undefined,
        alternative_procedures: undefined,
        revenue_impact: undefined,
        operational_impact: undefined,
        reputational_impact: undefined,
        infrastructure_dependencies: undefined,
        external_dependencies: undefined,
        data_requirements: undefined,
        supply_chain_impact: undefined,
        cross_border_operations: undefined,
        environmental_impact: undefined
      }))

      setProcesses(processesWithCamelCase)
      setExerciseStarted(data && data.length > 0)
    } catch (error) {
      console.error('Error fetching processes:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch processes')
      window.toast?.error('Failed to fetch processes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleProcessUpdate = (index: number, updatedProcess: BusinessProcess) => {
    const updatedProcesses = [...processes]
    updatedProcesses[index] = updatedProcess
    setProcesses(updatedProcesses)
  }

  const handleDeleteProcess = async (processId: string) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('business_processes')
        .delete()
        .eq('id', processId)

      if (error) throw error

      setProcesses(processes.filter(p => p.id !== processId))
      window.toast?.success('Process deleted successfully')
    } catch (error) {
      console.error('Error deleting process:', error)
      window.toast?.error('Failed to delete process')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (templateKey: string) => {
    const template = PROCESS_TEMPLATES[templateKey as keyof typeof PROCESS_TEMPLATES]
    if (!template) return

    setProcesses(prev => [...prev, ...template.processes])
    setShowTemplateModal(false)
    setExerciseStarted(true)
  }

  const saveAssessment = async () => {
    if (!organization?.id || !profile?.id) {
      window.toast?.error('Organization or user data not available')
      return
    }
    
    try {
      setSaving(true)
      setError(null)

      // Get department ID if department head
      let departmentId = null
      if (isDepartmentHead) {
        const { data: departmentUser } = await supabase
          .from('department_users')
          .select('department_id')
          .eq('user_id', profile.id)
          .single()

        if (departmentUser) {
          departmentId = departmentUser.department_id
        }
      }

      // Convert processes to snake_case format for DB
      const processesToSave = processes.map(process => ({
        name: process.name,
        description: process.description,
        owner: process.owner,
        priority: process.priority,
        category: process.category,
        dependencies: process.dependencies,
        stakeholders: process.stakeholders,
        critical_periods: process.criticalPeriods,
        alternative_procedures: process.alternativeProcedures,
        rto: process.rto,
        rpo: process.rpo,
        mtd: process.mtd,
        revenue_impact: process.revenueImpact,
        operational_impact: process.operationalImpact,
        reputational_impact: process.reputationalImpact,
        costs: process.costs,
        applications: process.applications,
        infrastructure_dependencies: process.infrastructureDependencies,
        external_dependencies: process.externalDependencies,
        data_requirements: process.dataRequirements,
        supply_chain_impact: process.supplyChainImpact,
        cross_border_operations: process.crossBorderOperations,
        environmental_impact: process.environmentalImpact,
        organization_id: organization.id,
        department_id: departmentId,
        owner_id: profile.id
      }))

      // Save process data
      const { error: processError } = await supabase
        .from('business_processes')
        .upsert(processesToSave)

      if (processError) throw processError

      window.toast?.success('Business processes saved successfully')
      navigate('/bcdr/business-impact/analysis')
    } catch (error) {
      console.error('Error saving processes:', error)
      setError(error instanceof Error ? error.message : 'Failed to save processes')
      window.toast?.error('Failed to save processes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleNext = () => {
    if (currentStep < WORKFLOW_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
      setActiveTab(WORKFLOW_STEPS[currentStep + 1].tab)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setActiveTab(WORKFLOW_STEPS[currentStep - 1].tab)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Process Assessment
        return processes.length > 0
      case 1: // Impact Assessment
        return processes.every(p => p.operationalImpact.score > 0)
      case 2: // Time Metrics
        return processes.every(p => p.rto > 0 && p.rpo > 0)
      default:
        return false
    }
  }

  // Only allow access to org admins and department heads
  if (!isAdmin && !isPlatformAdmin && !isDepartmentHead) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">
            You don't have permission to create or modify business processes.
            Please contact your administrator for access.
          </p>
          <Link 
            to="/bcdr/business-impact/analysis"
            className="mt-4 inline-flex items-center btn-primary"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            View BIA Analysis
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading business impact analysis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading BIA</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  fetchProcesses()
                }}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Business Impact Analysis
            </h1>
            <p className="mt-2 text-gray-600">
              {isAdmin || isPlatformAdmin
                ? "Review and manage organization-wide business impact analysis"
                : "Document and assess business process impacts and recovery requirements"}
            </p>
          </div>
        </div>

        {!exerciseStarted ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <FileSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start BIA Exercise</h3>
            <p className="text-gray-600 mb-6">
              {isAdmin || isPlatformAdmin
                ? "Begin by reviewing or creating business process assessments"
                : "Begin by identifying and documenting your critical business processes"}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowTemplateModal(true)}
                className="btn-secondary"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Load from Template
              </button>
              <button
                onClick={() => setShowProcessModal(true)}
                className="btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Process Manually
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Process Overview */}
            <OverviewMetrics processes={processes} />

            {/* Workflow Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">BIA Progress</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {WORKFLOW_STEPS.length}
                  </span>
                  <SaveProgressButton
                    onClick={() => saveProgress(processes, activeTab)}
                    saving={savingProgress}
                    lastSaved={savedProgress?.lastUpdated}
                  />
                </div>
              </div>
              <div className="relative">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${((currentStep + 1) / WORKFLOW_STEPS.length) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {WORKFLOW_STEPS.map((step, index) => (
                    <div
                      key={step.id}
                      className={clsx(
                        "p-4 rounded-lg border-2 transition-all",
                        index === currentStep
                          ? "border-indigo-600 bg-indigo-50"
                          : index < currentStep
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200"
                      )}
                    >
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Step Content */}
            <div className="mb-8">
              {activeTab === 'process' && (
                <ProcessAssessment
                  processes={processes}
                  onAddProcess={() => setShowProcessModal(true)}
                  onEditProcess={(process) => {
                    setSelectedProcess(process)
                    setShowProcessModal(true)
                  }}
                  onDeleteProcess={handleDeleteProcess}
                  onShowTemplateModal={() => setShowTemplateModal(true)}
                />
              )}

              {activeTab === 'impact' && processes.length > 0 && (
                <ImpactAssessment
                  processes={processes}
                  onUpdateProcess={handleProcessUpdate}
                />
              )}

              {activeTab === 'time' && processes.length > 0 && (
                <TimeMetrics
                  processes={processes}
                  onUpdateProcess={handleProcessUpdate}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                onClick={handleBack}
                className="btn-secondary"
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Previous Step
              </button>

              {currentStep === WORKFLOW_STEPS.length - 1 ? (
                <button
                  onClick={saveAssessment}
                  disabled={loading || saving || !canProceed()}
                  className={clsx(
                    "btn-primary",
                    (loading || saving || !canProceed()) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {saving ? 'Saving...' : 'Complete BIA'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={clsx(
                    "btn-primary",
                    !canProceed() && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Next Step
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {showProcessModal && (
        <ProcessModal
          show={showProcessModal}
          process={selectedProcess}
          onClose={() => {
            setShowProcessModal(false)
            setSelectedProcess(null)
          }}
          onSave={(process) => {
            if (selectedProcess) {
              setProcesses(processes.map(p => 
                p.id === selectedProcess.id ? process : p
              ))
            } else {
              setProcesses([...processes, process])
            }
            setShowProcessModal(false)
            setSelectedProcess(null)
          }}
        />
      )}

      {showTemplateModal && (
        <TemplateModal
          show={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSelect={handleTemplateSelect}
        />
      )}
    </div>
  )
}