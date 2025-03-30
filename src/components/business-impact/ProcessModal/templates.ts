import { v4 as uuidv4 } from 'uuid'
import type { BusinessProcess } from '../../../types/business-impact'

// Helper function to generate template process with UUID
const createTemplateProcess = (process: Omit<BusinessProcess, 'id'>): BusinessProcess => ({
  id: uuidv4(),
  ...process
})

export const PROCESS_TEMPLATES: Record<string, {
  name: string
  processes: BusinessProcess[]
}> = {
  financial: {
    name: 'Financial Services',
    processes: [
      createTemplateProcess({
        name: 'Financial Accounting',
        description: 'Core financial accounting and reporting processes',
        owner: 'Finance Director',
        priority: 'critical',
        category: 'Finance',
        dependencies: ['ERP System', 'Banking Systems', 'Financial Database'],
        stakeholders: ['CFO', 'Finance Team', 'Auditors'],
        criticalPeriods: ['Month-end', 'Quarter-end', 'Year-end'],
        alternativeProcedures: 'Manual ledger entries and offline backup systems',
        rto: 4, // 4 hours
        rpo: 1, // 1 hour
        mtd: 8, // 8 hours
        revenueImpact: {
          daily: 50000,
          weekly: 350000,
          monthly: 1500000
        },
        operationalImpact: {
          score: 90,
          details: 'Severe impact on financial operations and reporting'
        },
        reputationalImpact: {
          score: 85,
          details: 'High visibility to stakeholders and regulators'
        },
        costs: {
          direct: 25000,
          indirect: 15000,
          recovery: 10000
        },
        applications: [
          {
            name: 'ERP System',
            type: 'internal',
            criticality: 'critical',
            description: 'Core financial management system'
          },
          {
            name: 'Banking Portal',
            type: 'external',
            criticality: 'critical',
            provider: 'Bank',
            description: 'Banking operations platform'
          }
        ],
        infrastructureDependencies: [
          {
            name: 'Financial Database',
            type: 'database',
            description: 'Primary financial data storage'
          }
        ],
        externalDependencies: [
          {
            name: 'Banking Services',
            type: 'service',
            provider: 'Bank',
            description: 'Core banking services'
          }
        ],
        dataRequirements: {
          classification: 'confidential',
          backupFrequency: 'hourly',
          retentionPeriod: '7 years',
          compliance: ['SOX', 'GAAP']
        }
      }),
      createTemplateProcess({
        name: 'Treasury Management',
        description: 'Cash management and liquidity operations',
        owner: 'Treasury Manager',
        priority: 'critical',
        category: 'Finance',
        dependencies: ['Treasury System', 'Banking Platforms'],
        stakeholders: ['CFO', 'Treasury Team', 'Banking Partners'],
        criticalPeriods: ['Daily Close', 'Payment Processing Windows'],
        alternativeProcedures: 'Manual banking operations and contingency funding',
        rto: 2, // 2 hours
        rpo: 0.5, // 30 minutes
        mtd: 4, // 4 hours
        revenueImpact: {
          daily: 75000,
          weekly: 525000,
          monthly: 2250000
        },
        operationalImpact: {
          score: 95,
          details: 'Critical impact on cash management and liquidity'
        },
        reputationalImpact: {
          score: 90,
          details: 'Direct impact on financial stability'
        },
        costs: {
          direct: 35000,
          indirect: 20000,
          recovery: 15000
        },
        applications: [
          {
            name: 'Treasury Management System',
            type: 'internal',
            criticality: 'critical',
            description: 'Treasury operations platform'
          }
        ],
        infrastructureDependencies: [
          {
            name: 'Treasury Database',
            type: 'database',
            description: 'Treasury data storage'
          }
        ],
        externalDependencies: [
          {
            name: 'Banking Services',
            type: 'service',
            provider: 'Bank',
            description: 'Banking operations'
          }
        ],
        dataRequirements: {
          classification: 'confidential',
          backupFrequency: 'real-time',
          retentionPeriod: '7 years',
          compliance: ['SOX', 'Basel III']
        }
      })
    ]
  },
  it: {
    name: 'Information Technology',
    processes: [
      createTemplateProcess({
        name: 'Data Center Operations',
        description: 'Core infrastructure and systems management',
        owner: 'IT Director',
        priority: 'critical',
        category: 'IT',
        dependencies: ['Power Systems', 'Network Infrastructure', 'Cooling Systems'],
        stakeholders: ['CIO', 'IT Team', 'All Departments'],
        criticalPeriods: ['24/7'],
        alternativeProcedures: 'Failover to backup data center',
        rto: 1, // 1 hour
        rpo: 0.25, // 15 minutes
        mtd: 2, // 2 hours
        revenueImpact: {
          daily: 100000,
          weekly: 700000,
          monthly: 3000000
        },
        operationalImpact: {
          score: 95,
          details: 'Critical impact on all business operations'
        },
        reputationalImpact: {
          score: 90,
          details: 'Severe impact on service delivery'
        },
        costs: {
          direct: 50000,
          indirect: 30000,
          recovery: 20000
        },
        applications: [
          {
            name: 'DCIM',
            type: 'internal',
            criticality: 'critical',
            description: 'Data Center Infrastructure Management'
          }
        ],
        infrastructureDependencies: [
          {
            name: 'Primary Data Center',
            type: 'server',
            description: 'Main data center facility'
          }
        ],
        externalDependencies: [
          {
            name: 'Power Provider',
            type: 'service',
            provider: 'Utility Company',
            description: 'Primary power supply'
          }
        ],
        dataRequirements: {
          classification: 'confidential',
          backupFrequency: 'continuous',
          retentionPeriod: '1 year',
          compliance: ['ISO 27001', 'NIST']
        }
      })
    ]
  },
  operations: {
    name: 'Operations',
    processes: [
      createTemplateProcess({
        name: 'Supply Chain Management',
        description: 'End-to-end supply chain operations',
        owner: 'Operations Director',
        priority: 'high',
        category: 'Operations',
        dependencies: ['ERP System', 'Inventory Management', 'Logistics Systems'],
        stakeholders: ['Operations Team', 'Suppliers', 'Customers'],
        criticalPeriods: ['Peak Seasons', 'Shipping Windows'],
        alternativeProcedures: 'Manual inventory tracking and alternative suppliers',
        rto: 4, // 4 hours
        rpo: 2, // 2 hours
        mtd: 8, // 8 hours
        revenueImpact: {
          daily: 60000,
          weekly: 420000,
          monthly: 1800000
        },
        operationalImpact: {
          score: 85,
          details: 'Significant impact on product availability'
        },
        reputationalImpact: {
          score: 80,
          details: 'Customer satisfaction impact'
        },
        costs: {
          direct: 30000,
          indirect: 20000,
          recovery: 15000
        },
        applications: [
          {
            name: 'SCM System',
            type: 'internal',
            criticality: 'high',
            description: 'Supply Chain Management System'
          }
        ],
        infrastructureDependencies: [
          {
            name: 'Inventory Database',
            type: 'database',
            description: 'Inventory tracking system'
          }
        ],
        externalDependencies: [
          {
            name: 'Logistics Provider',
            type: 'service',
            provider: 'Shipping Company',
            description: 'Primary logistics service'
          }
        ],
        dataRequirements: {
          classification: 'internal',
          backupFrequency: 'hourly',
          retentionPeriod: '2 years',
          compliance: ['ISO 9001']
        }
      })
    ]
  }
}