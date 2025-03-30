import React, { useState, useEffect } from 'react'
import { FileText, Save, Download, Building2, Users, Phone, Calendar, AlertTriangle, Shield, Printer } from 'lucide-react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { useAuthStore } from '../../lib/store'
import { getTemplateConfig } from './templates'
import { generatePlan } from '../../lib/planGenerator'
import type { PlanType } from './PlanTemplateSelector'
import type { PlanScope } from './PlanScopeSelector'
import { DocumentEditor } from './DocumentEditor'
import {
  StepProgress,
  StepNavigation,
  CriticalFunctions,
  RecoveryStrategies,
  CommunicationPlan,
  RecoveryProcedures,
  TestingMaintenance
} from './sections'

interface BCPBuilderProps {
  templateType: PlanType
  scope: PlanScope
  onBack: () => void
}

export function BCPBuilder({ templateType, scope, onBack }: BCPBuilderProps) {
  const { organization, profile } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [documentContent, setDocumentContent] = useState<string>('')
  
  // Get template configuration
  const templateConfig = getTemplateConfig(templateType)
  
  // Initialize form data with template defaults
  const [formData, setFormData] = useState(templateConfig.defaultValues)

  const handleSave = async () => {
    try {
      setSaving(true)
      // TODO: Save to database
      window.toast?.success('Plan saved successfully')
    } catch (error) {
      console.error('Error saving plan:', error)
      window.toast?.error('Failed to save plan')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateDocument = async () => {
    if (!organization) return

    try {
      setGenerating(true)
      const content = await generatePlan({
        type: templateType,
        scope,
        formData,
        organization: {
          name: organization.name,
          industry: organization.industry
        }
      })
      setDocumentContent(content)
      setShowEditor(true)
      window.toast?.success('Document generated successfully')
    } catch (error) {
      console.error('Error generating document:', error)
      window.toast?.error('Failed to generate document')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveDocument = async (content: string) => {
    try {
      setDocumentContent(content)
      // Save to database
      window.toast?.success('Document saved successfully')
    } catch (error) {
      console.error('Error saving document:', error)
      window.toast?.error('Failed to save document')
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    // Add header
    doc.setFontSize(20)
    doc.text(templateConfig.pdfTemplate.title, 20, 20)
    
    doc.setFontSize(12)
    doc.text(`Organization: ${organization?.name}`, 20, 30)
    
    // Convert HTML content to PDF
    // This is a simplified version - you may want to use a more robust HTML-to-PDF conversion
    const div = document.createElement('div')
    div.innerHTML = documentContent
    const text = div.textContent || ''
    
    doc.setFontSize(12)
    const lines = doc.splitTextToSize(text, 170)
    doc.text(lines, 20, 50)

    doc.save(`${organization?.name}_${templateConfig.title.replace(/\s+/g, '_')}.pdf`)
  }

  const canProceed = () => {
    const currentSection = templateConfig.sections[currentStep]
    if (!currentSection) return false

    return currentSection.fields.every(field => {
      // Skip fields that shouldn't be shown for current scope
      if (field.showWhen && !field.showWhen(scope)) {
        return true
      }
      return !field.required || (formData[field.id] && formData[field.id].toString().trim() !== '')
    })
  }

  const handleComplete = async () => {
    try {
      setSaving(true)
      // First save the plan
      await handleSave()
      // Then generate the document
      await handleGenerateDocument()
    } finally {
      setSaving(false)
    }
  }

  const renderField = (field: typeof templateConfig.sections[0]['fields'][0]) => {
    // Skip fields that shouldn't be shown for current scope
    if (field.showWhen && !field.showWhen(scope)) {
      return null
    }

    // Handle special component fields
    if (field.type === 'component') {
      switch (field.component) {
        case 'CriticalFunctions':
          return (
            <CriticalFunctions
              functions={formData[field.id] || []}
              onChange={(functions) => setFormData({ ...formData, [field.id]: functions })}
            />
          )
        case 'RecoveryStrategies':
          return (
            <RecoveryStrategies
              strategies={formData[field.id] || []}
              onChange={(strategies) => setFormData({ ...formData, [field.id]: strategies })}
            />
          )
        case 'CommunicationPlan':
          return (
            <CommunicationPlan
              communications={formData[field.id] || []}
              onChange={(communications) => setFormData({ ...formData, [field.id]: communications })}
            />
          )
        case 'RecoveryProcedures':
          return (
            <RecoveryProcedures
              procedures={formData[field.id] || []}
              onChange={(procedures) => setFormData({ ...formData, [field.id]: procedures })}
            />
          )
        case 'TestingMaintenance':
          return (
            <TestingMaintenance
              testingSchedule={formData[field.id] || {
                frequency: 'Annually',
                lastTest: new Date().toISOString().split('T')[0],
                nextTest: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                scope: ''
              }}
              onChange={(schedule) => setFormData({ ...formData, [field.id]: schedule })}
            />
          )
        default:
          return null
      }
    }

    // Handle regular form fields
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            type={field.type}
            value={formData[field.id] || ''}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="input"
            required={field.required}
            placeholder={field.placeholder}
          />
        )
      
      case 'textarea':
        return (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="input"
            rows={3}
            required={field.required}
            placeholder={field.placeholder}
          />
        )
      
      case 'select':
        return (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="select"
            required={field.required}
          >
            <option value="">Select...</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      
      case 'date':
        return (
          <input
            type="date"
            value={formData[field.id] || ''}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="input"
            required={field.required}
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={formData[field.id] || ''}
            onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
            className="input"
            required={field.required}
          />
        )
      
      default:
        return null
    }
  }

  const renderSection = () => {
    const section = templateConfig.sections[currentStep]
    if (!section) return null

    return (
      <div className="space-y-6">
        {section.description && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">{section.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {section.fields.map(field => {
            // Skip fields that shouldn't be shown for current scope
            if (field.showWhen && !field.showWhen(scope)) {
              return null
            }

            return (
              <div key={field.id} className="form-group">
                {field.type !== 'component' && (
                  <label className="form-label">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                {renderField(field)}
                {field.description && (
                  <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (showEditor) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{templateConfig.title}</h1>
            <p className="mt-1 text-gray-600">
              {organization?.name}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowEditor(false)}
              className="btn-secondary"
            >
              Back to Form
            </button>
          </div>
        </div>

        <DocumentEditor
          initialContent={documentContent}
          onSave={handleSaveDocument}
          onExportPDF={handleExportPDF}
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{templateConfig.title}</h1>
          <p className="mt-1 text-gray-600">
            {organization?.name}
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={onBack}
            className="btn-secondary"
          >
            Back to Templates
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-secondary"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleGenerateDocument}
            disabled={generating}
            className="btn-primary"
          >
            <FileText className="w-5 h-5 mr-2" />
            {generating ? 'Generating...' : 'Generate Document'}
          </button>
        </div>
      </div>

      <StepProgress 
        steps={templateConfig.sections.map(s => ({
          title: s.title,
          icon: FileText // You can map different icons based on section type
        }))}
        currentStep={currentStep}
      />

      <div className="mt-8">
        {renderSection()}
      </div>

      <StepNavigation
        currentStep={currentStep}
        totalSteps={templateConfig.sections.length}
        onPrevious={() => setCurrentStep(currentStep - 1)}
        onNext={() => setCurrentStep(currentStep + 1)}
        canProceed={canProceed()}
        isLastStep={currentStep === templateConfig.sections.length - 1}
        onComplete={handleComplete}
      />
    </div>
  )
}