import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import {
  createWorkspaceSessionToken,
  verifyWorkspaceSessionToken,
} from "@/lib/server/auth/token";
import type { WorkspaceSessionPayload } from "@/lib/server/auth/token";

const WORKSPACE_COOKIE_NAME = "alec_workspace_session";

// ─── Workspace session functions ────────────────────────────

export interface AuthenticatedWorkspace {
  id: string;
  slug: string;
  name: string;
}

export async function setWorkspaceSessionCookie(
  response: NextResponse,
  workspace: AuthenticatedWorkspace,
): Promise<void> {
  const token = await createWorkspaceSessionToken({
    id: workspace.id,
    slug: workspace.slug,
  });
  response.cookies.set(WORKSPACE_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge:
      Math.max(1, Number(process.env.SESSION_TTL_HOURS ?? "12")) * 60 * 60,
  });
}

export async function getCurrentWorkspaceSession(): Promise<WorkspaceSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(WORKSPACE_COOKIE_NAME)?.value ?? null;
  return verifyWorkspaceSessionToken(token);
}

export async function requireWorkspaceFromRequest(
  request: NextRequest,
): Promise<WorkspaceSessionPayload | null> {
  const token = request.cookies.get(WORKSPACE_COOKIE_NAME)?.value ?? null;
  return verifyWorkspaceSessionToken(token);
}

export async function clearWorkspaceSessionCookie(
  response: NextResponse,
): Promise<void> {
  response.cookies.set(WORKSPACE_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export { WORKSPACE_COOKIE_NAME };
