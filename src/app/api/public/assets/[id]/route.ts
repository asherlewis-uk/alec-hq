import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import {
  mapCatalogAssetRow,
  mapCatalogComponentRow,
} from "@/lib/server/mappers";
import { getServiceSupabase } from "@/lib/server/supabase";
import { isValidUUID } from "@/lib/server/validation";
import type { Asset, Component } from "@/lib/types";

export const runtime = "nodejs";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params;
  if (!isValidUUID(id)) {
    return apiError(400, "INVALID_ID", "The provided ID is not a valid UUID.");
  }
  const supabase = getServiceSupabase();

  const { data: catalogAsset, error: assetError } = await supabase
    .from("catalog_assets")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();

  if (assetError)
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch public asset.",
      assetError.message,
    );
  if (!catalogAsset) return apiError(404, "NOT_FOUND", "Asset not found.");

  const { data: catalogComponents, error: componentsError } = await supabase
    .from("catalog_components")
    .select("*")
    .eq("catalog_asset_id", id)
    .order("created_at", { ascending: false });

  if (componentsError)
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch public components.",
      componentsError.message,
    );

  // Map catalog models to legacy Asset/Component shapes for the public share UI
  const ca = mapCatalogAssetRow(catalogAsset);
  const asset: Asset = {
    id: ca.id,
    name: ca.name,
    category: ca.category,
    status: "ACTIVE",
    coverImage: ca.coverImage,
    notes: ca.summary,
    isPublic: ca.isPublic,
    createdAt: ca.createdAt,
    updatedAt: ca.updatedAt,
  };

  const components: Component[] = (catalogComponents ?? []).map((row) => {
    const cc = mapCatalogComponentRow(row);
    return {
      id: cc.id,
      assetId: cc.catalogAssetId,
      name: cc.name,
      brand: cc.brand,
      model: cc.model,
      specs: cc.specs,
      condition: cc.condition,
      installedDate: cc.installedDate,
      notes: cc.notes,
      createdAt: cc.createdAt,
    };
  });

  return apiOk({ asset, components });
}
