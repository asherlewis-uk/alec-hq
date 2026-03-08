export type AssetCategory = "VEHICLE" | "RIG" | "PERIPHERAL" | "NETWORK";
export type AssetStatus = "ACTIVE" | "STORED" | "SOLD" | "WISHLIST";
export type ComponentCondition = "STOCK" | "UPGRADED" | "AFTERMARKET" | "WORN" | "FAILED";
export type LogType = "MAINTENANCE" | "UPGRADE" | "REPAIR" | "INSPECTION" | "NOTE";
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

export interface CreateAssetInput {
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  isPublic: boolean;
  coverImage?: string | null;
  purchaseDate?: string | null;
  purchasePrice?: number | null;
  notes?: string | null;
}

export type UpdateAssetInput = Partial<CreateAssetInput>;

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

export interface CreateComponentInput {
  name: string;
  brand?: string | null;
  model?: string | null;
  specs?: Record<string, string> | null;
  condition: ComponentCondition;
  installedDate?: string | null;
  notes?: string | null;
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

export interface CreateAssetLogInput {
  type: LogType;
  title: string;
  description?: string | null;
  date: string;
  mileage?: number | null;
  cost?: number | null;
  performedBy?: string | null;
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

export interface CreateWishlistInput {
  name: string;
  brand?: string | null;
  url?: string | null;
  estimatedPrice?: number | null;
  priority: WishlistPriority;
  notes?: string | null;
}

export interface DashboardStats {
  totalAssets: number;
  maintenanceDue: number;
  wishlistCount: number;
  recentAssets: Asset[];
}

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
