import type { NextRequest } from "next/server";
import { apiError } from "@/lib/server/api-response";
import { requireOwnerFromRequest } from "@/lib/server/auth/session";

export async function ensureOwner(request: NextRequest) {
  const session = await requireOwnerFromRequest(request);
  if (!session) {
    return {
      ok: false as const,
      response: apiError(401, "UNAUTHORIZED", "You must be signed in."),
    };
  }
  return { ok: true as const };
}
