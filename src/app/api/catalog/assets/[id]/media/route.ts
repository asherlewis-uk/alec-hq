import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { getServiceSupabase } from "@/lib/server/supabase";
import { isValidUUID } from "@/lib/server/validation";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isValidUUID(id)) {
    return apiError(400, "INVALID_ID", "Asset ID must be a valid UUID.");
  }

  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("catalog_media")
    .select("*")
    .eq("catalog_asset_id", id)
    .order("sort_order", { ascending: true });

  if (error) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch catalog media.",
      error.message,
    );
  }

  return apiOk(
    (data ?? []).map((row) => ({
      id: row.id,
      catalogAssetId: row.catalog_asset_id,
      url: row.url,
      altText: row.alt_text,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    })),
  );
}
