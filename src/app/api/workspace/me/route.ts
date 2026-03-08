import { NextRequest } from "next/server";
import { apiOk } from "@/lib/server/api-response";
import { ensureWorkspaceAccess } from "@/lib/server/auth/workspace";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await ensureWorkspaceAccess(request);
  if (!auth.ok) return auth.response;

  return apiOk({
    workspaceId: auth.session.workspaceId,
    workspaceSlug: auth.session.workspaceSlug,
  });
}
