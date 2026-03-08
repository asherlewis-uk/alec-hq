import { NextRequest, NextResponse } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureOwner } from "@/lib/server/auth/owner";
import { mapAssetRow, mapAssetUpdate } from "@/lib/server/mappers";
import { getServiceSupabase } from "@/lib/server/supabase";
import {
  isValidUUID,
  validateUpdateAssetInput,
  ValidationError,
} from "@/lib/server/validation";

export const runtime = "nodejs";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: Context) {
  const auth = await ensureOwner(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!isValidUUID(id)) {
    return apiError(400, "INVALID_ID", "The provided ID is not a valid UUID.");
  }
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error)
    return apiError(500, "DB_ERROR", "Failed to fetch asset.", error.message);
  if (!data) return apiError(404, "NOT_FOUND", "Asset not found.");
  return apiOk(mapAssetRow(data));
}

export async function PATCH(request: NextRequest, context: Context) {
  const auth = await ensureOwner(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!isValidUUID(id)) {
    return apiError(400, "INVALID_ID", "The provided ID is not a valid UUID.");
  }
  try {
    const body = await request.json();
    const validated = validateUpdateAssetInput(body);
    if (Object.keys(validated).length === 0) {
      return apiError(400, "BAD_REQUEST", "No fields to update.");
    }
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("assets")
      .update(mapAssetUpdate(validated))
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error)
      return apiError(
        500,
        "DB_ERROR",
        "Failed to update asset.",
        error.message,
      );
    if (!data) return apiError(404, "NOT_FOUND", "Asset not found.");
    return apiOk(mapAssetRow(data));
  } catch (error) {
    if (error instanceof ValidationError) {
      return apiError(400, "VALIDATION_ERROR", error.message);
    }
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return apiError(400, "MALFORMED_JSON", "Invalid JSON payload provided.");
    }
    return apiError(500, "UNKNOWN_ERROR", "Unexpected server error.");
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  const auth = await ensureOwner(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  if (!isValidUUID(id)) {
    return apiError(400, "INVALID_ID", "The provided ID is not a valid UUID.");
  }
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("assets")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error)
    return apiError(500, "DB_ERROR", "Failed to delete asset.", error.message);
  if (!data) return apiError(404, "NOT_FOUND", "Asset not found.");
  return new NextResponse(null, { status: 204 });
}
