import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureOwner } from "@/lib/server/auth/owner";
import { mapAssetInsert, mapAssetRow } from "@/lib/server/mappers";
import { getServiceSupabase } from "@/lib/server/supabase";
import { validateCreateAssetInput, ValidationError } from "@/lib/server/validation";
import type { AssetCategory } from "@/lib/types";

const validCategories = new Set<AssetCategory>(["VEHICLE", "RIG", "PERIPHERAL", "NETWORK"]);

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await ensureOwner(request);
  if (!auth.ok) return auth.response;

  const category = request.nextUrl.searchParams.get("category");
  const supabase = getServiceSupabase();

  let query = supabase.from("assets").select("*").order("updated_at", { ascending: false });
  if (category && validCategories.has(category as AssetCategory)) {
    const parsedCategory = category as AssetCategory;
    query = query.eq("category", parsedCategory);
  }

  const { data, error } = await query;
  if (error) return apiError(500, "DB_ERROR", "Failed to fetch assets.", error.message);

  return apiOk((data ?? []).map(mapAssetRow));
}

export async function POST(request: NextRequest) {
  const auth = await ensureOwner(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const validated = validateCreateAssetInput(body);
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.from("assets").insert(mapAssetInsert(validated)).select("*").single();

    if (error) return apiError(500, "DB_ERROR", "Failed to create asset.", error.message);
    return apiOk(mapAssetRow(data), 201);
  } catch (error) {
    if (error instanceof ValidationError) {
      return apiError(400, "VALIDATION_ERROR", error.message);
    }
    return apiError(500, "UNKNOWN_ERROR", "Unexpected server error.");
  }
}
