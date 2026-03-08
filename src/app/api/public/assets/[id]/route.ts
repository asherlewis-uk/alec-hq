import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { mapAssetRow, mapComponentRow } from "@/lib/server/mappers";
import { getServiceSupabase } from "@/lib/server/supabase";

export const runtime = "nodejs";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params;
  const supabase = getServiceSupabase();

  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .maybeSingle();

  if (assetError) return apiError(500, "DB_ERROR", "Failed to fetch public asset.", assetError.message);
  if (!asset) return apiError(404, "NOT_FOUND", "Asset not found.");

  const { data: components, error: componentsError } = await supabase
    .from("components")
    .select("*")
    .eq("asset_id", id)
    .order("created_at", { ascending: false });

  if (componentsError) return apiError(500, "DB_ERROR", "Failed to fetch public components.", componentsError.message);

  return apiOk({
    asset: mapAssetRow(asset),
    components: (components ?? []).map(mapComponentRow),
  });
}
