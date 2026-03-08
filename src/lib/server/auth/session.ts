import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { createSessionToken, verifySessionToken } from "@/lib/server/auth/token";

const COOKIE_NAME = "alec_session";

export async function requireOwnerFromRequest(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value ?? null;
  return verifySessionToken(token);
}

export async function setSessionCookie(response: NextResponse) {
  const token = await createSessionToken();
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(1, Number(process.env.SESSION_TTL_HOURS ?? "12")) * 60 * 60,
  });
}

export async function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value ?? null;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
