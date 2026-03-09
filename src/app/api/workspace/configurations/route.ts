import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureWorkspaceAccess } from "@/lib/server/auth/workspace";
import { getServiceSupabase } from "@/lib/server/supabase";
import {
  validateCreateWorkspaceConfigurationInput,
  ValidationError,
} from "@/lib/server/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  const supabase = getServiceSupabase();
  const { data: configurationRows, error } = await supabase
    .from("workspace_configurations")
    .select("*")
    .eq("workspace_id", auth.session.workspaceId)
    .order("updated_at", { ascending: false });

  if (error) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch configurations.",
      error.message,
    );
  }

  return apiOk(
    (configurationRows ?? []).map((configurationRow) => ({
      id: configurationRow.id,
      workspaceId: configurationRow.workspace_id,
      name: configurationRow.name,
      kind: configurationRow.kind,
      notes: configurationRow.notes,
      createdAt: configurationRow.created_at,
      updatedAt: configurationRow.updated_at,
    })),
  );
}

export async function POST(request: NextRequest) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const input = validateCreateWorkspaceConfigurationInput(body);

    const supabase = getServiceSupabase();
    const { data: createdConfigurationRow, error } = await supabase
      .from("workspace_configurations")
      .insert({
        workspace_id: auth.session.workspaceId,
        name: input.name,
        kind: input.kind,
        notes: input.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      return apiError(
        500,
        "DB_ERROR",
        "Failed to create configuration.",
        error.message,
      );
    }

    return apiOk(
      {
        id: createdConfigurationRow.id,
        workspaceId: createdConfigurationRow.workspace_id,
        name: createdConfigurationRow.name,
        kind: createdConfigurationRow.kind,
        notes: createdConfigurationRow.notes,
        createdAt: createdConfigurationRow.created_at,
        updatedAt: createdConfigurationRow.updated_at,
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
