// Core domain types matching Supabase schema
export type AssetCategory = 'VEHICLE' | 'RIG' | 'PERIPHERAL' | 'NETWORK'
export type AssetStatus = 'ACTIVE' | 'STORED' | 'SOLD' | 'WISHLIST'
export type ComponentCondition = 'STOCK' | 'UPGRADED' | 'AFTERMARKET' | 'WORN' | 'FAILED'
export type LogType = 'MAINTENANCE' | 'UPGRADE' | 'REPAIR' | 'INSPECTION' | 'NOTE'
export type WishlistPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  status: AssetStatus
  coverImage?: string
  purchaseDate?: string
  purchasePrice?: number
  notes?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface Component {
  id: string
  assetId: string
  name: string
  brand?: string
  model?: string
  specs?: Record<string, string>
  condition: ComponentCondition
  installedDate?: string
  notes?: string
  createdAt?: string
}

export interface AssetLog {
  id: string
  assetId: string
  type: LogType
  title: string
  description?: string
  date: string
  mileage?: number
  cost?: number
  performedBy?: string
  createdAt?: string
}

export interface WishlistItem {
  id: string
  assetId: string
  name: string
  brand?: string
  url?: string
  estimatedPrice?: number
  priority: WishlistPriority
  notes?: string
  createdAt?: string
}

export interface DashboardStats {
  totalAssets: number
  maintenanceDue: number
  wishlistCount: number
  recentAssets: Asset[]
}