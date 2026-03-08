import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/server/api-response";
import { isValidUUID } from "@/lib/server/validation";
import { ensureOwner } from "@/lib/server/auth/owner";
import { getServiceSupabase } from "@/lib/server/supabase";

export const runtime = "nodejs";

interface Context {
  params: Promise<{ id: string }>;
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
    .from("asset_logs")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error)
    return apiError(500, "DB_ERROR", "Failed to delete log.", error.message);
  if (!data) return apiError(404, "NOT_FOUND", "Resource not found.");
  return new NextResponse(null, { status: 204 });
}
