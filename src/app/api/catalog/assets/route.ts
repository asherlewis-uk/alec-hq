import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { requireWorkspaceFromRequest } from "@/lib/server/auth/session";
import { getServiceSupabase } from "@/lib/server/supabase";
import { mapCatalogAssetRow } from "@/lib/server/mappers";
import type { AssetCategory } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const supabase = getServiceSupabase();
  const { searchParams } = request.nextUrl;
  const session = await requireWorkspaceFromRequest(request);

  let query = supabase.from("catalog_assets").select("*");

  const category = searchParams.get("category");
  if (category) {
    query = query.eq("category", category as AssetCategory);
  }

  const search = searchParams.get("search");
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const publicOnly = searchParams.get("publicOnly");
  if (publicOnly === "true" || !session) {
    query = query.eq("is_public", true);
  }

  query = query.order("updated_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch catalog assets.",
      error.message,
    );
  }

  return apiOk((data ?? []).map(mapCatalogAssetRow));
}
