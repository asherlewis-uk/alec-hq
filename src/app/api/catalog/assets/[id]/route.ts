import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { requireWorkspaceFromRequest } from "@/lib/server/auth/session";
import { getServiceSupabase } from "@/lib/server/supabase";
import { mapCatalogAssetRow } from "@/lib/server/mappers";
import { isValidUUID } from "@/lib/server/validation";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isValidUUID(id)) {
    return apiError(400, "INVALID_ID", "Asset ID must be a valid UUID.");
  }

  const session = await requireWorkspaceFromRequest(request);
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("catalog_assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch catalog asset.",
      error.message,
    );
  }

  if (!data || (!session && !data.is_public)) {
    return apiError(404, "NOT_FOUND", "Catalog asset not found.");
  }

  return apiOk(mapCatalogAssetRow(data));
}
