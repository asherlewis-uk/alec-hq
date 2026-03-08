import type { NextRequest } from "next/server";
import { apiError } from "@/lib/server/api-response";
import { requireWorkspaceFromRequest } from "@/lib/server/auth/session";

export interface WorkspaceGuardSuccess {
  ok: true;
  session: {
    workspaceId: string;
    workspaceSlug: string;
  };
}

export interface WorkspaceGuardFailure {
  ok: false;
  response: ReturnType<typeof apiError>;
}

export async function ensureWorkspaceAccess(
  request: NextRequest,
): Promise<WorkspaceGuardSuccess | WorkspaceGuardFailure> {
  const session = await requireWorkspaceFromRequest(request);
  if (!session) {
    return {
      ok: false,
      response: apiError(401, "UNAUTHORIZED", "You must be signed in."),
    };
  }

  return {
    ok: true,
    session: {
      workspaceId: session.workspaceId,
      workspaceSlug: session.workspaceSlug,
    },
  };
}
