import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureOwner } from "@/lib/server/auth/owner";
import { mapAssetLogInsert, mapAssetLogRow } from "@/lib/server/mappers";
import { getServiceSupabase } from "@/lib/server/supabase";
import { validateCreateLogInput, ValidationError } from "@/lib/server/validation";

export const runtime = "nodejs";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: Context) {
  const auth = await ensureOwner(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("asset_logs")
    .select("*")
    .eq("asset_id", id)
    .order("date", { ascending: false });

  if (error) return apiError(500, "DB_ERROR", "Failed to fetch logs.", error.message);
  return apiOk((data ?? []).map(mapAssetLogRow));
}

export async function POST(request: NextRequest, context: Context) {
  const auth = await ensureOwner(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  try {
    const body = await request.json();
    const validated = validateCreateLogInput(body);
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("asset_logs")
      .insert(mapAssetLogInsert(id, validated))
      .select("*")
      .single();

    if (error) return apiError(500, "DB_ERROR", "Failed to create log.", error.message);
    return apiOk(mapAssetLogRow(data), 201);
  } catch (error) {
    if (error instanceof ValidationError) {
      return apiError(400, "VALIDATION_ERROR", error.message);
    }
    return apiError(500, "UNKNOWN_ERROR", "Unexpected server error.");
  }
}
