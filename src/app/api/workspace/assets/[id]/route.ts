import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureWorkspaceAccess } from "@/lib/server/auth/workspace";
import { getServiceSupabase } from "@/lib/server/supabase";
import { mapWorkspaceAssetLinkRow } from "@/lib/server/mappers";
import {
  isValidUUID,
  validateUpdateWorkspaceAssetLinkInput,
  ValidationError,
} from "@/lib/server/validation";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isValidUUID(id)) {
    return apiError(400, "INVALID_ID", "Link ID must be a valid UUID.");
  }

  try {
    const body = await request.json();
    const input = validateUpdateWorkspaceAssetLinkInput(body);

    const supabase = getServiceSupabase();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.localStatus !== undefined)
      updates.local_status = input.localStatus;
    if (input.notes !== undefined) updates.notes = input.notes;

    const { data, error } = await supabase
      .from("workspace_asset_links")
      .update(updates)
      .eq("id", id)
      .eq("workspace_id", auth.session.workspaceId)
      .select()
      .single();

    if (error) {
      return apiError(
        500,
        "DB_ERROR",
        "Failed to update workspace asset link.",
        error.message,
      );
    }

    if (!data) {
      return apiError(404, "NOT_FOUND", "Workspace asset link not found.");
    }

    return apiOk(mapWorkspaceAssetLinkRow(data));
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isValidUUID(id)) {
    return apiError(400, "INVALID_ID", "Link ID must be a valid UUID.");
  }

  const supabase = getServiceSupabase();

  const { error, count } = await supabase
    .from("workspace_asset_links")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("workspace_id", auth.session.workspaceId);

  if (error) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to delete workspace asset link.",
      error.message,
    );
  }

  if (count === 0) {
    return apiError(404, "NOT_FOUND", "Workspace asset link not found.");
  }

  return apiOk({ deleted: true });
}
