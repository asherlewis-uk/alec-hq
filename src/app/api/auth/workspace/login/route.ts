import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/server/api-response";
import { setWorkspaceSessionCookie } from "@/lib/server/auth/session";
import {
  clearWorkspaceLoginRateLimit,
  getWorkspaceLoginRateLimitKey,
  getWorkspaceLoginRateLimitStatus,
  recordWorkspaceLoginFailure,
} from "@/lib/server/auth/workspace-login-rate-limit";
import {
  validateWorkspaceLoginInput,
  ValidationError,
} from "@/lib/server/validation";
import { verifyWorkspacePin } from "@/lib/server/auth/workspace-pin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = validateWorkspaceLoginInput(body);
    const rateLimitKey = getWorkspaceLoginRateLimitKey(
      request,
      input.workspaceSlug,
    );
    const rateLimitStatus = getWorkspaceLoginRateLimitStatus(rateLimitKey);

    if (rateLimitStatus.blocked) {
      return apiError(
        429,
        "TOO_MANY_ATTEMPTS",
        "Too many login attempts. Try again later.",
        rateLimitStatus.retryAfterSeconds
          ? { retryAfterSeconds: rateLimitStatus.retryAfterSeconds }
          : undefined,
      );
    }

    const workspace = await verifyWorkspacePin(input.workspaceSlug, input.pin);

    if (!workspace) {
      const nextRateLimitStatus = recordWorkspaceLoginFailure(rateLimitKey);

      if (nextRateLimitStatus.blocked) {
        return apiError(
          429,
          "TOO_MANY_ATTEMPTS",
          "Too many login attempts. Try again later.",
          nextRateLimitStatus.retryAfterSeconds
            ? { retryAfterSeconds: nextRateLimitStatus.retryAfterSeconds }
            : undefined,
        );
      }

      return apiError(401, "INVALID_CREDENTIALS", "Incorrect workspace or PIN.");
    }

    clearWorkspaceLoginRateLimit(rateLimitKey);

    const response = NextResponse.json({
      authenticated: true,
      workspace: {
        id: workspace.id,
        slug: workspace.slug,
        name: workspace.name,
      },
    });

    await setWorkspaceSessionCookie(response, workspace);
    return response;
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
