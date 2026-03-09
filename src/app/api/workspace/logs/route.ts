import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureWorkspaceAccess } from "@/lib/server/auth/workspace";
import { getServiceSupabase } from "@/lib/server/supabase";
import {
  mapWorkspaceLogRow,
  mapWorkspaceLogInsert,
} from "@/lib/server/mappers";
import {
  validateCreateWorkspaceLogInput,
  ValidationError,
} from "@/lib/server/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  const supabase = getServiceSupabase();
  const { data: workspaceLogRows, error } = await supabase
    .from("workspace_logs")
    .select("*")
    .eq("workspace_id", auth.session.workspaceId)
    .order("date", { ascending: false });

  if (error) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch workspace logs.",
      error.message,
    );
  }

  return apiOk((workspaceLogRows ?? []).map(mapWorkspaceLogRow));
}

export async function POST(request: NextRequest) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const input = validateCreateWorkspaceLogInput(body);

    const supabase = getServiceSupabase();
    const insert = mapWorkspaceLogInsert({
      workspaceId: auth.session.workspaceId,
      workspaceAssetLinkId: input.workspaceAssetLinkId,
      slotAssignmentId: input.slotAssignmentId,
      type: input.type,
      title: input.title,
      description: input.description,
      date: input.date,
      mileage: input.mileage,
      cost: input.cost,
      performedBy: input.performedBy,
    });

    const { data: createdWorkspaceLogRow, error } = await supabase
      .from("workspace_logs")
      .insert(insert)
      .select()
      .single();

    if (error) {
      return apiError(
        500,
        "DB_ERROR",
        "Failed to create workspace log.",
        error.message,
      );
    }

    return apiOk(mapWorkspaceLogRow(createdWorkspaceLogRow), 201);
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
