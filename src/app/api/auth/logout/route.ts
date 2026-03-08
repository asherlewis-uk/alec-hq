import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  clearWorkspaceSessionCookie,
} from "@/lib/server/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  await clearSessionCookie(response);
  await clearWorkspaceSessionCookie(response);
  return response;
}
