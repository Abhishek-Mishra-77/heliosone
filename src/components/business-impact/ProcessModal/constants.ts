// Constants for the ProcessModal component
export const APPLICATION_TYPES = [
  { value: 'internal', label: 'Internal Application' },
  { value: 'external', label: 'External Application' },
  { value: 'cloud', label: 'Cloud Service' },
] as const;

export const INFRASTRUCTURE_TYPES = [
  { value: 'server', label: 'Server' },
  { value: 'database', label: 'Database' },
  { value: 'network', label: 'Network Component' },
  { value: 'storage', label: 'Storage' },
  { value: 'other', label: 'Other' },
] as const;

export const EXTERNAL_DEPENDENCY_TYPES = [
  { value: 'vendor', label: 'Vendor' },
  { value: 'service', label: 'Service' },
  { value: 'api', label: 'API' },
  { value: 'other', label: 'Other' },
] as const;

export const DATA_CLASSIFICATIONS = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'confidential', label: 'Confidential' },
  { value: 'restricted', label: 'Restricted' },
] as const;

// Enhanced supply chain categories
export const SUPPLY_CHAIN_CATEGORIES = [
  { value: 'critical_supplier', label: 'Critical Supplier' },
  { value: 'logistics', label: 'Logistics Provider' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'raw_materials', label: 'Raw Materials Supplier' },
] as const;

// Cross-border operation types
export const CROSS_BORDER_TYPES = [
  { value: 'data_transfer', label: 'Data Transfer' },
  { value: 'service_delivery', label: 'Service Delivery' },
  { value: 'physical_goods', label: 'Physical Goods Movement' },
  { value: 'financial', label: 'Financial Transactions' },
] as const;

// Environmental impact categories
export const ENVIRONMENTAL_IMPACT_TYPES = [
  { value: 'energy', label: 'Energy Consumption' },
  { value: 'emissions', label: 'Carbon Emissions' },
  { value: 'waste', label: 'Waste Generation' },
  { value: 'water', label: 'Water Usage' },
  { value: 'materials', label: 'Material Resources' },
] as const;