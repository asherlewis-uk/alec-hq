import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureWorkspaceAccess } from "@/lib/server/auth/workspace";
import { getServiceSupabase } from "@/lib/server/supabase";
import {
  isValidUUID,
  validateCreateConfigurationSlotInput,
  ValidationError,
} from "@/lib/server/validation";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isValidUUID(id)) {
    return apiError(
      400,
      "INVALID_ID",
      "Configuration ID must be a valid UUID.",
    );
  }

  const supabase = getServiceSupabase();

  // Verify configuration belongs to this workspace
  const { data: config, error: configError } = await supabase
    .from("workspace_configurations")
    .select("id")
    .eq("id", id)
    .eq("workspace_id", auth.session.workspaceId)
    .maybeSingle();

  if (configError) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to verify configuration.",
      configError.message,
    );
  }

  if (!config) {
    return apiError(404, "NOT_FOUND", "Configuration not found.");
  }

  const { data, error } = await supabase
    .from("configuration_slots")
    .select("*")
    .eq("configuration_id", id)
    .eq("workspace_id", auth.session.workspaceId)
    .order("sort_order", { ascending: true });

  if (error) {
    return apiError(500, "DB_ERROR", "Failed to fetch slots.", error.message);
  }

  return apiOk(
    (data ?? []).map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      configurationId: row.configuration_id,
      slotKey: row.slot_key,
      label: row.label,
      sortOrder: row.sort_order,
      createdAt: row.created_at,
    })),
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!isValidUUID(id)) {
    return apiError(
      400,
      "INVALID_ID",
      "Configuration ID must be a valid UUID.",
    );
  }

  try {
    const body = await request.json();
    const input = validateCreateConfigurationSlotInput(body);

    const supabase = getServiceSupabase();

    // Verify configuration belongs to this workspace
    const { data: config, error: configError } = await supabase
      .from("workspace_configurations")
      .select("id")
      .eq("id", id)
      .eq("workspace_id", auth.session.workspaceId)
      .maybeSingle();

    if (configError) {
      return apiError(
        500,
        "DB_ERROR",
        "Failed to verify configuration.",
        configError.message,
      );
    }

    if (!config) {
      return apiError(404, "NOT_FOUND", "Configuration not found.");
    }

    const { data, error } = await supabase
      .from("configuration_slots")
      .insert({
        configuration_id: id,
        workspace_id: auth.session.workspaceId,
        slot_key: input.slotKey,
        label: input.label,
        sort_order: input.sortOrder ?? 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return apiError(
          409,
          "DUPLICATE",
          "A slot with this key already exists in this configuration.",
        );
      }
      return apiError(500, "DB_ERROR", "Failed to create slot.", error.message);
    }

    return apiOk(
      {
        id: data.id,
        workspaceId: data.workspace_id,
        configurationId: data.configuration_id,
        slotKey: data.slot_key,
        label: data.label,
        sortOrder: data.sort_order,
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
