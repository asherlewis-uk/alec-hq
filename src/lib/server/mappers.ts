import type {
  Asset,
  AssetLog,
  Component,
  CreateAssetInput,
  CreateAssetLogInput,
  CreateComponentInput,
  CreateWishlistInput,
  UpdateAssetInput,
  WishlistItem,
} from "@/lib/types";
import type { Database, Json } from "@/lib/types/database";

type AssetRow = Database["public"]["Tables"]["assets"]["Row"];
type AssetInsert = Database["public"]["Tables"]["assets"]["Insert"];
type AssetUpdate = Database["public"]["Tables"]["assets"]["Update"];

type ComponentRow = Database["public"]["Tables"]["components"]["Row"];
type ComponentInsert = Database["public"]["Tables"]["components"]["Insert"];

type AssetLogRow = Database["public"]["Tables"]["asset_logs"]["Row"];
type AssetLogInsert = Database["public"]["Tables"]["asset_logs"]["Insert"];

type WishlistRow = Database["public"]["Tables"]["wishlist_items"]["Row"];
type WishlistInsert = Database["public"]["Tables"]["wishlist_items"]["Insert"];

export function mapAssetRow(row: AssetRow): Asset {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    status: row.status,
    coverImage: row.cover_image,
    purchaseDate: row.purchase_date,
    purchasePrice: row.purchase_price,
    notes: row.notes,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAssetInsert(input: CreateAssetInput): AssetInsert {
  return {
    name: input.name,
    category: input.category,
    status: input.status,
    cover_image: input.coverImage ?? null,
    purchase_date: input.purchaseDate ?? null,
    purchase_price: input.purchasePrice ?? null,
    notes: input.notes ?? null,
    is_public: input.isPublic,
  };
}

export function mapAssetUpdate(input: UpdateAssetInput): AssetUpdate {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.coverImage !== undefined ? { cover_image: input.coverImage } : {}),
    ...(input.purchaseDate !== undefined ? { purchase_date: input.purchaseDate } : {}),
    ...(input.purchasePrice !== undefined ? { purchase_price: input.purchasePrice } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.isPublic !== undefined ? { is_public: input.isPublic } : {}),
    updated_at: new Date().toISOString(),
  };
}

function toSpecsJson(specs?: Record<string, string> | null): Json | null {
  return specs ?? null;
}

export function mapComponentRow(row: ComponentRow): Component {
  return {
    id: row.id,
    assetId: row.asset_id,
    name: row.name,
    brand: row.brand,
    model: row.model,
    specs: (row.specs as Record<string, string> | null) ?? null,
    condition: row.condition,
    installedDate: row.installed_date,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function mapComponentInsert(assetId: string, input: CreateComponentInput): ComponentInsert {
  return {
    asset_id: assetId,
    name: input.name,
    brand: input.brand ?? null,
    model: input.model ?? null,
    specs: toSpecsJson(input.specs),
    condition: input.condition,
    installed_date: input.installedDate ?? null,
    notes: input.notes ?? null,
  };
}

export function mapAssetLogRow(row: AssetLogRow): AssetLog {
  return {
    id: row.id,
    assetId: row.asset_id,
    type: row.type,
    title: row.title,
    description: row.description,
    date: row.date,
    mileage: row.mileage,
    cost: row.cost,
    performedBy: row.performed_by,
    createdAt: row.created_at,
  };
}

export function mapAssetLogInsert(assetId: string, input: CreateAssetLogInput): AssetLogInsert {
  return {
    asset_id: assetId,
    type: input.type,
    title: input.title,
    description: input.description ?? null,
    date: input.date,
    mileage: input.mileage ?? null,
    cost: input.cost ?? null,
    performed_by: input.performedBy ?? null,
  };
}

export function mapWishlistRow(row: WishlistRow): WishlistItem {
  return {
    id: row.id,
    assetId: row.asset_id,
    name: row.name,
    brand: row.brand,
    url: row.url,
    estimatedPrice: row.estimated_price,
    priority: row.priority,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export function mapWishlistInsert(assetId: string, input: CreateWishlistInput): WishlistInsert {
  return {
    asset_id: assetId,
    name: input.name,
    brand: input.brand ?? null,
    url: input.url ?? null,
    estimated_price: input.estimatedPrice ?? null,
    priority: input.priority,
    notes: input.notes ?? null,
  };
}
