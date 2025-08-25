export type DeviceCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED'

export type JobSheetStatus = 
  | 'CREATED' 
  | 'IN_DIAGNOSIS' 
  | 'AWAITING_APPROVAL' 
  | 'APPROVED' 
  | 'IN_PROGRESS' 
  | 'PARTS_ORDERED' 
  | 'TESTING' 
  | 'COMPLETED' 
  | 'DELIVERED' 
  | 'CANCELLED'

export interface DeviceFormData {
  _brand: string
  model: string
  serialNumber?: string
  yearManufactured?: number
  category: string
  subcategory?: string
  color?: string
  condition: DeviceCondition
  specifications?: Record<string, unknown>
  purchaseDate?: string
  warrantyExpiry?: string
}

export interface Device extends DeviceFormData {
  _id: string
  customerId: string
  createdAt: string
  updatedAt: string
}

export interface JobSheet {
  id: string
  jobNumber: string
  bookingId: string
  deviceId: string
  technicianId?: string
  problemDescription: string
  diagnosisNotes?: string
  repairActions?: Record<string, unknown>
  _estimatedHours: number
  actualHours?: number
  laborCost: number
  partsCost?: number
  totalCost?: number
  status: JobSheetStatus
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  qualityChecks?: Record<string, unknown>
  testingResults?: Record<string, unknown>
  beforePhotos?: string[]
  afterPhotos?: string[]
  warrantyCoverage?: string
  customerApprovalRequired: boolean
  customerApprovedAt?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface JobSheetPart {
  id: string
  jobSheetId: string
  partName: string
  partNumber?: string
  quantity: number
  unitCost: number
  totalCost: number
  supplier?: string
  createdAt: string
}