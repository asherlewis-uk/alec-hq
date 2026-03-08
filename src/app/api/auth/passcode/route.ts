import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/server/api-response";
import { verifyPasscode } from "@/lib/server/auth/passcode";
import { clearAttempts, getRequestIp, isBlocked, recordFailedAttempt } from "@/lib/server/auth/rate-limit";
import { setSessionCookie } from "@/lib/server/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { passcode?: unknown };
  try {
    body = (await request.json()) as { passcode?: unknown };
  } catch {
    return apiError(400, "BAD_REQUEST", "Invalid JSON body.");
  }

  const passcode = typeof body.passcode === "string" ? body.passcode : "";
  if (!passcode) {
    return apiError(400, "VALIDATION_ERROR", "Passcode is required.");
  }

  const ip = getRequestIp(request.headers);
  const blocked = await isBlocked(ip);
  if (blocked.blocked) {
    return apiError(429, "TOO_MANY_ATTEMPTS", "Too many login attempts. Try again later.", {
      retryAfterSeconds: blocked.retryAfterSeconds,
    });
  }

  const ok = await verifyPasscode(passcode);
  if (!ok) {
    const state = await recordFailedAttempt(ip);
    if (state.blocked) {
      return apiError(429, "TOO_MANY_ATTEMPTS", "Too many login attempts. Try again later.", {
        retryAfterSeconds: state.retryAfterSeconds,
      });
    }
    return apiError(401, "INVALID_PASSCODE", "Invalid passcode.");
  }

  await clearAttempts(ip);
  const response = NextResponse.json({ ok: true });
  await setSessionCookie(response);
  return response;
}
