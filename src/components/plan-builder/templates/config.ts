import type { PlanType } from '../PlanTemplateSelector'
import type { PlanScope } from '../PlanScopeSelector'

export interface TemplateConfig {
  title: string
  sections: {
    id: string
    title: string
    required: boolean
    description?: string
    fields: Array<{
      id: string
      label: string
      type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email' | 'tel' | 'component'
      required: boolean
      options?: string[]
      placeholder?: string
      description?: string
      component?: string
      showWhen?: (scope: PlanScope) => boolean
    }>
  }[]
  defaultValues: Record<string, any>
  pdfTemplate: {
    title: string
    sections: Array<{
      title: string
      fields: string[]
    }>
  }
}

export const TEMPLATE_CONFIGS: Record<PlanType, TemplateConfig> = {
  'bcp': {
    title: 'Business Continuity Plan',
    sections: [
      {
        id: 'plan_overview',
        title: 'Plan Overview',
        required: true,
        description: 'Basic information about the business continuity plan',
        fields: [
          {
            id: 'planTitle',
            label: 'Plan Title',
            type: 'text',
            required: true,
            placeholder: 'e.g., ACM Corporation Business Continuity Plan'
          },
          {
            id: 'version',
            label: 'Version',
            type: 'text',
            required: true,
            placeholder: 'e.g., 1.0'
          },
          {
            id: 'lastReviewed',
            label: 'Last Reviewed',
            type: 'date',
            required: true
          },
          {
            id: 'nextReview',
            label: 'Next Review',
            type: 'date',
            required: true
          }
        ]
      },
      {
        id: 'organization_details',
        title: 'Organization Details',
        required: true,
        description: 'Information about the organization',
        fields: [
          {
            id: 'orgName',
            label: 'Organization Name',
            type: 'text',
            required: true
          },
          {
            id: 'department',
            label: 'Department',
            type: 'text',
            required: true,
            showWhen: (scope) => scope === 'department'
          },
          {
            id: 'location',
            label: 'Primary Location',
            type: 'text',
            required: true
          },
          {
            id: 'scope',
            label: 'Plan Scope',
            type: 'textarea',
            required: true,
            placeholder: 'Define the scope of this business continuity plan...'
          }
        ]
      },
      {
        id: 'team_information',
        title: 'Team Information',
        required: true,
        description: 'Plan ownership and approval details',
        fields: [
          {
            id: 'planOwner',
            label: 'Plan Owner',
            type: 'text',
            required: true
          },
          {
            id: 'planApprover',
            label: 'Plan Approver',
            type: 'text',
            required: true
          },
          {
            id: 'lastApproved',
            label: 'Last Approved Date',
            type: 'date',
            required: true
          },
          {
            id: 'teamMembers',
            label: 'Team Members',
            type: 'textarea',
            required: true,
            placeholder: 'List team members and their roles...'
          }
        ]
      },
      {
        id: 'contact_information',
        title: 'Contact Information',
        required: true,
        description: 'Primary and alternate contact details',
        fields: [
          {
            id: 'primaryContact',
            label: 'Primary Contact Name',
            type: 'text',
            required: true
          },
          {
            id: 'primaryEmail',
            label: 'Primary Contact Email',
            type: 'email',
            required: true
          },
          {
            id: 'primaryPhone',
            label: 'Primary Contact Phone',
            type: 'tel',
            required: true
          },
          {
            id: 'alternateContact',
            label: 'Alternate Contact Name',
            type: 'text',
            required: true
          },
          {
            id: 'alternateEmail',
            label: 'Alternate Contact Email',
            type: 'email',
            required: true
          },
          {
            id: 'alternatePhone',
            label: 'Alternate Contact Phone',
            type: 'tel',
            required: true
          }
        ]
      },
      {
        id: 'critical_functions',
        title: 'Critical Functions',
        required: true,
        description: 'Critical business functions and dependencies',
        fields: [
          {
            id: 'criticalFunctions',
            label: 'Critical Functions',
            type: 'component',
            required: true,
            component: 'CriticalFunctions'
          }
        ]
      },
      {
        id: 'recovery_strategies',
        title: 'Recovery Strategies',
        required: true,
        description: 'Recovery strategies for critical functions',
        fields: [
          {
            id: 'recoveryStrategies',
            label: 'Recovery Strategies',
            type: 'component',
            required: true,
            component: 'RecoveryStrategies'
          }
        ]
      },
      {
        id: 'communication_plan',
        title: 'Communication Plan',
        required: true,
        description: 'Communication procedures during incidents',
        fields: [
          {
            id: 'communicationPlan',
            label: 'Communication Plan',
            type: 'component',
            required: true,
            component: 'CommunicationPlan'
          }
        ]
      },
      {
        id: 'recovery_procedures',
        title: 'Recovery Procedures',
        required: true,
        description: 'Step-by-step recovery procedures',
        fields: [
          {
            id: 'recoveryProcedures',
            label: 'Recovery Procedures',
            type: 'component',
            required: true,
            component: 'RecoveryProcedures'
          }
        ]
      },
      {
        id: 'testing_maintenance',
        title: 'Testing & Maintenance',
        required: true,
        description: 'Plan testing and maintenance schedule',
        fields: [
          {
            id: 'testingMaintenance',
            label: 'Testing & Maintenance',
            type: 'component',
            required: true,
            component: 'TestingMaintenance'
          }
        ]
      }
    ],
    defaultValues: {
      planTitle: '',
      version: '1.0',
      lastReviewed: new Date().toISOString().split('T')[0],
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      orgName: '',
      department: '',
      location: '',
      scope: '',
      planOwner: '',
      planApprover: '',
      lastApproved: new Date().toISOString().split('T')[0],
      teamMembers: '',
      primaryContact: '',
      primaryEmail: '',
      primaryPhone: '',
      alternateContact: '',
      alternateEmail: '',
      alternatePhone: '',
      criticalFunctions: [],
      recoveryStrategies: [],
      communicationPlan: [],
      recoveryProcedures: [],
      testingMaintenance: {
        frequency: 'Annually',
        lastTest: new Date().toISOString().split('T')[0],
        nextTest: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        scope: ''
      }
    },
    pdfTemplate: {
      title: 'Business Continuity Plan',
      sections: [
        {
          title: 'Plan Overview',
          fields: ['planTitle', 'version', 'lastReviewed', 'nextReview']
        },
        {
          title: 'Organization Details',
          fields: ['orgName', 'department', 'location', 'scope']
        },
        {
          title: 'Team Information',
          fields: ['planOwner', 'planApprover', 'lastApproved', 'teamMembers']
        },
        {
          title: 'Contact Information',
          fields: [
            'primaryContact', 'primaryEmail', 'primaryPhone',
            'alternateContact', 'alternateEmail', 'alternatePhone'
          ]
        }
      ]
    }
  },
  // Add configurations for other plan types...
} as const

export function getTemplateConfig(type: PlanType): TemplateConfig {
  return TEMPLATE_CONFIGS[type]
}