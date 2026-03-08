import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureOwner } from "@/lib/server/auth/owner";
import { mapComponentInsert, mapComponentRow } from "@/lib/server/mappers";
import { getServiceSupabase } from "@/lib/server/supabase";
import {
  isValidUUID,
  validateCreateComponentInput,
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
    .from("components")
    .select("*")
    .eq("asset_id", id)
    .order("created_at", { ascending: false });

  if (error)
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch components.",
      error.message,
    );
  return apiOk((data ?? []).map(mapComponentRow));
}

export async function POST(request: NextRequest, context: Context) {
  const auth = await ensureOwner(request);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  if (!isValidUUID(id)) {
    return apiError(400, "INVALID_ID", "The provided ID is not a valid UUID.");
  }

  try {
    const body = await request.json();
    const validated = validateCreateComponentInput(body);
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("components")
      .insert(mapComponentInsert(id, validated))
      .select("*")
      .single();

    if (error) {
      if (error.code === "23503") {
        return apiError(404, "NOT_FOUND", "Parent asset not found.");
      }
      return apiError(
        500,
        "DB_ERROR",
        "Failed to create component.",
        error.message,
      );
    }
    return apiOk(mapComponentRow(data), 201);
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
