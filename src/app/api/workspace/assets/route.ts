import { NextRequest } from "next/server";
import { apiError, apiOk } from "@/lib/server/api-response";
import { ensureWorkspaceAccess } from "@/lib/server/auth/workspace";
import { getServiceSupabase } from "@/lib/server/supabase";
import {
  mapWorkspaceAssetLinkRow,
  mapCatalogAssetRow,
  mapWorkspaceAssetLinkInsert,
} from "@/lib/server/mappers";
import {
  validateCreateWorkspaceAssetLinkInput,
  ValidationError,
} from "@/lib/server/validation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("workspace_asset_links")
    .select(
      `
      *,
      catalog_assets (*)
    `,
    )
    .eq("workspace_id", auth.session.workspaceId)
    .order("updated_at", { ascending: false });

  if (error) {
    return apiError(
      500,
      "DB_ERROR",
      "Failed to fetch workspace assets.",
      error.message,
    );
  }

  return apiOk(
    (data ?? []).map((row) => ({
      link: mapWorkspaceAssetLinkRow(row),
      catalogAsset: row.catalog_assets
        ? mapCatalogAssetRow(row.catalog_assets)
        : null,
    })),
  );
}

export async function POST(request: NextRequest) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const input = validateCreateWorkspaceAssetLinkInput(body);

    const supabase = getServiceSupabase();
    const insert = mapWorkspaceAssetLinkInsert({
      workspaceId: auth.session.workspaceId,
      catalogAssetId: input.catalogAssetId,
      localStatus: input.localStatus,
      notes: input.notes,
    });

    const { data, error } = await supabase
      .from("workspace_asset_links")
      .insert(insert)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return apiError(
          409,
          "DUPLICATE",
          "This catalog asset is already linked to your workspace.",
        );
      }
      return apiError(
        500,
        "DB_ERROR",
        "Failed to create workspace asset link.",
        error.message,
      );
    }

    return apiOk(mapWorkspaceAssetLinkRow(data), 201);
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
