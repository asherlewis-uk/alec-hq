import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/server/api-response";
import { getStoredPin, isValidPin, storePin, verifyPin } from "@/lib/server/auth/pin";
import { setSessionCookie } from "@/lib/server/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: { pin?: unknown; confirm?: unknown };
  try {
    body = (await request.json()) as { pin?: unknown; confirm?: unknown };
  } catch {
    return apiError(400, "BAD_REQUEST", "Invalid JSON body.");
  }

  const { pin, confirm } = body;

  if (!isValidPin(pin)) {
    return apiError(400, "VALIDATION_ERROR", "PIN must be exactly 6 digits.");
  }

  const existingHash = await getStoredPin();

  if (!existingHash) {
    // First-time setup: require confirmation
    if (!isValidPin(confirm)) {
      return apiError(400, "VALIDATION_ERROR", "Please confirm your PIN.");
    }
    if (pin !== confirm) {
      return apiError(400, "PIN_MISMATCH", "PINs do not match.");
    }
    await storePin(pin);
    const response = NextResponse.json({ ok: true, setup: true });
    await setSessionCookie(response);
    return response;
  }

  // Verify existing PIN
  const ok = await verifyPin(pin);
  if (!ok) {
    return apiError(401, "INVALID_PIN", "Incorrect PIN.");
  }

  const response = NextResponse.json({ ok: true });
  await setSessionCookie(response);
  return response;
}
