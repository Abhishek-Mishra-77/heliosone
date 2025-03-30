import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from 'docx'
import { saveAs } from 'file-saver'
import type { PlanType } from '../components/plan-builder/PlanTemplateSelector'
import type { PlanScope } from '../components/plan-builder/PlanScopeSelector'
import { planTemplates } from './planTemplates'
import mammoth from 'mammoth'

interface PlanData {
  type: PlanType
  scope: PlanScope
  formData: Record<string, any>
  organization: {
    name: string
    industry?: string
  }
}

export async function generatePlan(data: PlanData): Promise<string> {
  // Get the template for this plan type
  const template = planTemplates[data.type]
  if (!template) {
    throw new Error(`No template found for plan type: ${data.type}`)
  }

  // Replace template variables with actual data
  let content = template.template
  
  // Replace basic variables
  content = content.replace(/{{organization}}/g, data.organization.name)
  content = content.replace(/{{version}}/g, data.formData.version || '1.0')
  content = content.replace(/{{lastReviewed}}/g, data.formData.lastReviewed || new Date().toLocaleDateString())
  content = content.replace(/{{nextReview}}/g, data.formData.nextReview || '')
  content = content.replace(/{{scope}}/g, data.formData.scope || '')
  content = content.replace(/{{planOwner}}/g, data.formData.planOwner || '')
  content = content.replace(/{{planApprover}}/g, data.formData.planApprover || '')

  // Handle department-specific content
  if (data.scope === 'department') {
    content = content.replace(/{{department}}/g, data.formData.department || '')
  } else {
    // Remove department-specific sections
    content = content.replace(/{{#if department}}.*{{\/if}}/gs, '')
  }

  // Handle arrays and objects
  const handleArray = (array: any[], template: string) => {
    return array.map(item => {
      let section = template
      Object.keys(item).forEach(key => {
        section = section.replace(new RegExp(`{{${key}}}`, 'g'), item[key])
      })
      return section
    }).join('\n')
  }

  // Replace critical functions
  if (data.formData.criticalFunctions?.length) {
    const criticalFunctionsTemplate = content.match(/{{#each criticalFunctions}}(.*?){{\/each}}/s)?.[1]
    if (criticalFunctionsTemplate) {
      const criticalFunctionsContent = handleArray(data.formData.criticalFunctions, criticalFunctionsTemplate)
      content = content.replace(/{{#each criticalFunctions}}.*?{{\/each}}/s, criticalFunctionsContent)
    }
  }

  // Replace recovery strategies
  if (data.formData.recoveryStrategies?.length) {
    const recoveryStrategiesTemplate = content.match(/{{#each recoveryStrategies}}(.*?){{\/each}}/s)?.[1]
    if (recoveryStrategiesTemplate) {
      const recoveryStrategiesContent = handleArray(data.formData.recoveryStrategies, recoveryStrategiesTemplate)
      content = content.replace(/{{#each recoveryStrategies}}.*?{{\/each}}/s, recoveryStrategiesContent)
    }
  }

  // Replace communication plan
  if (data.formData.communicationPlan?.length) {
    const communicationPlanTemplate = content.match(/{{#each communicationPlan}}(.*?){{\/each}}/s)?.[1]
    if (communicationPlanTemplate) {
      const communicationPlanContent = handleArray(data.formData.communicationPlan, communicationPlanTemplate)
      content = content.replace(/{{#each communicationPlan}}.*?{{\/each}}/s, communicationPlanContent)
    }
  }

  // Replace recovery procedures
  if (data.formData.recoveryProcedures?.length) {
    const recoveryProceduresTemplate = content.match(/{{#each recoveryProcedures}}(.*?){{\/each}}/s)?.[1]
    if (recoveryProceduresTemplate) {
      const recoveryProceduresContent = handleArray(data.formData.recoveryProcedures, recoveryProceduresTemplate)
      content = content.replace(/{{#each recoveryProcedures}}.*?{{\/each}}/s, recoveryProceduresContent)
    }
  }

  // Replace testing & maintenance
  if (data.formData.testingMaintenance) {
    Object.keys(data.formData.testingMaintenance).forEach(key => {
      content = content.replace(
        new RegExp(`{{testingMaintenance.${key}}}`, 'g'), 
        data.formData.testingMaintenance[key]
      )
    })
  }

  // Clean up any remaining template variables
  content = content.replace(/{{.*?}}/g, '')

  return content
}

export async function generateWordDocument(content: string, fileName: string) {
  // Convert HTML to Word document using mammoth
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: content,
          style: 'Normal'
        })
      ]
    }]
  })

  // Generate and save the document
  const blob = await Packer.toBlob(doc)
  saveAs(blob, fileName)
}