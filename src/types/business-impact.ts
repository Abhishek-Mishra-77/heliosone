export interface BusinessProcess {
  id: string
  name: string
  description: string
  owner: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: string
  dependencies: string[]
  stakeholders: string[]
  critical_periods: string[] // Changed to match DB
  alternative_procedures: string // Changed to match DB
  rto: number
  rpo: number
  mtd: number
  revenue_impact: { // Changed to match DB
    daily: number
    weekly: number
    monthly: number
  }
  operational_impact: { // Changed to match DB
    score: number
    details: string
  }
  reputational_impact: { // Changed to match DB
    score: number
    details: string
  }
  costs: {
    direct: number
    indirect: number
    recovery: number
  }
  applications: Array<{
    name: string
    type: 'internal' | 'external' | 'cloud'
    criticality: 'critical' | 'high' | 'medium' | 'low'
    provider?: string
    description?: string
  }>
  infrastructure_dependencies: Array<{ // Changed to match DB
    name: string
    type: 'server' | 'database' | 'network' | 'storage' | 'other'
    description: string
  }>
  external_dependencies: Array<{ // Changed to match DB
    name: string
    type: 'vendor' | 'service' | 'api' | 'other'
    provider: string
    contract?: string
    description: string
  }>
  data_requirements: { // Changed to match DB
    classification: 'public' | 'internal' | 'confidential' | 'restricted'
    backup_frequency: string
    retention_period: string
    compliance?: string[]
  }
  supply_chain_impact?: { // Changed to match DB
    dependencies: Array<{
      type: 'critical_supplier' | 'logistics' | 'distributor' | 'manufacturer' | 'raw_materials'
      name: string
      location: string
      alternative_suppliers: number
      lead_time: string
      contract_value: number
      risk_level: 'critical' | 'high' | 'medium' | 'low'
    }>
    score: number
    details: string
  }
  cross_border_operations?: { // Changed to match DB
    regions: string[]
    operation_types: Array<'data_transfer' | 'service_delivery' | 'physical_goods' | 'financial'>
    regulatory_requirements: string[]
    score: number
    details: string
  }
  environmental_impact?: { // Changed to match DB
    types: Array<'energy' | 'emissions' | 'waste' | 'water' | 'materials'>
    metrics: {
      energy_consumption?: number
      carbon_emissions?: number
      waste_generation?: number
      water_usage?: number
      material_usage?: number
    }
    score: number
    details: string
    mitigation_strategies: string[]
  }
  organization_id?: string
  assessment_id?: string
  created_at?: string
  updated_at?: string
}

export interface ImpactAssessment {
  financial: {
    score: number
    direct_costs: number
    indirect_costs: number
    total_impact: number
  }
  operational: {
    score: number
    affected_departments: string[]
    service_disruption: string
    workarounds: string
  }
  reputational: {
    score: number
    stakeholder_impact: string
    media_exposure: string
    regulatory_compliance: string
  }
}