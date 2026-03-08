import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureWorkspaceAccess } from "@/lib/server/auth/workspace";
import { getServiceSupabase } from "@/lib/server/supabase";
import {
  isValidUUID,
  validateCreateSlotAssignmentInput,
  ValidationError,
} from "@/lib/server/validation";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  const { id: slotId } = await params;
  if (!isValidUUID(slotId)) {
    return apiError(400, "INVALID_ID", "Slot ID must be a valid UUID.");
  }

  try {
    const body = await request.json();
    const input = validateCreateSlotAssignmentInput(body);

    const supabase = getServiceSupabase();

    // Verify the slot belongs to this workspace (ownership chain check)
    const { data: slot, error: slotError } = await supabase
      .from("configuration_slots")
      .select("id, workspace_id")
      .eq("id", slotId)
      .eq("workspace_id", auth.session.workspaceId)
      .maybeSingle();

    if (slotError) {
      return apiError(
        500,
        "DB_ERROR",
        "Failed to verify slot ownership.",
        slotError.message,
      );
    }

    if (!slot) {
      return apiError(404, "NOT_FOUND", "Configuration slot not found.");
    }

    // Binding condition 3: Direct workspace_id from session, not derived from parent
    const { data, error } = await supabase
      .from("slot_assignments")
      .insert({
        configuration_slot_id: slotId,
        catalog_asset_id: input.catalogAssetId,
        workspace_id: auth.session.workspaceId,
        workspace_asset_link_id: input.workspaceAssetLinkId ?? null,
        installed_at: input.installedAt ?? null,
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      return apiError(
        500,
        "DB_ERROR",
        "Failed to create slot assignment.",
        error.message,
      );
    }

    return apiOk(
      {
        id: data.id,
        workspaceId: data.workspace_id,
        configurationSlotId: data.configuration_slot_id,
        catalogAssetId: data.catalog_asset_id,
        workspaceAssetLinkId: data.workspace_asset_link_id,
        installedAt: data.installed_at,
        removedAt: data.removed_at,
        notes: data.notes,
        createdAt: data.created_at,
      },
      201,
    );
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
