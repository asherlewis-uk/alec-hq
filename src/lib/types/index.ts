export type AssetCategory = "VEHICLE" | "RIG" | "PERIPHERAL" | "NETWORK";
export type AssetStatus = "ACTIVE" | "STORED" | "SOLD" | "WISHLIST";
export type ComponentCondition =
  | "STOCK"
  | "UPGRADED"
  | "AFTERMARKET"
  | "WORN"
  | "FAILED";
export type LogType =
  | "MAINTENANCE"
  | "UPGRADE"
  | "REPAIR"
  | "INSPECTION"
  | "NOTE";
export type WishlistPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  coverImage?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  notes?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Component {
  id: string;
  assetId: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  specs?: Record<string, string> | null;
  condition: ComponentCondition;
  installedDate?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface AssetLog {
  id: string;
  assetId: string;
  type: LogType;
  title: string;
  description?: string | null;
  date: string;
  mileage?: number | null;
  cost?: number | null;
  performedBy?: string | null;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  assetId: string;
  name: string;
  brand?: string | null;
  url?: string | null;
  estimatedPrice?: number | null;
  priority: WishlistPriority;
  notes?: string | null;
  createdAt: string;
}

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// ─── Dual-Workspace Catalog Types (Phase 1) ─────────────────

export interface CatalogAsset {
  id: string;
  slug?: string | null;
  name: string;
  category: AssetCategory;
  summary?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  coverImage?: string | null;
  specs?: Record<string, string> | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceAssetLink {
  id: string;
  workspaceId: string;
  catalogAssetId: string;
  localStatus: AssetStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CatalogComponent {
  id: string;
  catalogAssetId: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  specs?: Record<string, string> | null;
  condition: ComponentCondition;
  installedDate?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface WorkspaceConfiguration {
  id: string;
  workspaceId: string;
  name: string;
  kind: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigurationSlot {
  id: string;
  workspaceId: string;
  configurationId: string;
  slotKey: string;
  label: string;
  sortOrder: number;
  createdAt: string;
}

export interface SlotAssignment {
  id: string;
  workspaceId: string;
  configurationSlotId: string;
  catalogAssetId: string;
  workspaceAssetLinkId?: string | null;
  installedAt?: string | null;
  removedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface WorkspaceLog {
  id: string;
  workspaceId: string;
  workspaceAssetLinkId?: string | null;
  slotAssignmentId?: string | null;
  type: LogType;
  title: string;
  description?: string | null;
  date: string;
  mileage?: number | null;
  cost?: number | null;
  performedBy?: string | null;
  createdAt: string;
}

export interface WorkspaceWishlistItem {
  id: string;
  workspaceId: string;
  catalogAssetId?: string | null;
  name: string;
  brand?: string | null;
  url?: string | null;
  estimatedPrice?: number | null;
  priority: WishlistPriority;
  notes?: string | null;
  createdAt: string;
}

export interface WorkspaceSummary {
  id: string;
  slug: string;
  name: string;
}
