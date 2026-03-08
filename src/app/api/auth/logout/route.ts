import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/server/auth/session";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  await clearSessionCookie(response);
  return response;
}
