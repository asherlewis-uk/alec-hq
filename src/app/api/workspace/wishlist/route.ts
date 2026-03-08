import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureWorkspaceAccess } from "@/lib/server/auth/workspace";
import { getServiceSupabase } from "@/lib/server/supabase";
import {
  mapWorkspaceWishlistRow,
  mapWorkspaceWishlistInsert,
} from "@/lib/server/mappers";
import {
  validateCreateWorkspaceWishlistInput,
  ValidationError,
} from "@/lib/server/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("workspace_wishlist_items")
    .select("*")
    .eq("workspace_id", auth.session.workspaceId)
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch workspace wishlist.",
      error.message,
    );
  }

  return apiOk((data ?? []).map(mapWorkspaceWishlistRow));
}

export async function POST(request: NextRequest) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const input = validateCreateWorkspaceWishlistInput(body);

    const supabase = getServiceSupabase();
    const insert = mapWorkspaceWishlistInsert({
      workspaceId: auth.session.workspaceId,
      catalogAssetId: input.catalogAssetId,
      name: input.name,
      brand: input.brand,
      url: input.url,
      estimatedPrice: input.estimatedPrice,
      priority: input.priority,
      notes: input.notes,
    });

    const { data, error } = await supabase
      .from("workspace_wishlist_items")
      .insert(insert)
      .select()
      .single();

    if (error) {
      return apiError(
        500,
        "DB_ERROR",
        "Failed to create wishlist item.",
        error.message,
      );
    }

    return apiOk(mapWorkspaceWishlistRow(data), 201);
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
