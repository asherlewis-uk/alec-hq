import { NextResponse } from "next/server";
import { clearWorkspaceSessionCookie } from "@/lib/server/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  await clearWorkspaceSessionCookie(response);
  return response;
}
