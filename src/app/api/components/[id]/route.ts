import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/server/api-response";
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

  const supabase = getServiceSupabase();
  const { error } = await supabase.from("components").delete().eq("id", id);
  if (error) return apiError(500, "DB_ERROR", "Failed to delete component.", error.message);
  return new NextResponse(null, { status: 204 });
}
