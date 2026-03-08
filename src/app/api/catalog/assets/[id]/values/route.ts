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
    .from("catalog_asset_values")
    .select("*")
    .eq("catalog_asset_id", id)
    .order("effective_at", { ascending: false });

  if (error) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch catalog values.",
      error.message,
    );
  }

  return apiOk(
    (data ?? []).map((row) => ({
      id: row.id,
      catalogAssetId: row.catalog_asset_id,
      valueAmount: row.value_amount,
      valueCurrency: row.value_currency,
      source: row.source,
      effectiveAt: row.effective_at,
      capturedAt: row.captured_at,
    })),
  );
}
