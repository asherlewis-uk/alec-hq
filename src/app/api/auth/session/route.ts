import { apiOk } from "@/lib/server/api-response";
import {
  getCurrentSession,
  getCurrentWorkspaceSession,
} from "@/lib/server/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const workspaceSession = await getCurrentWorkspaceSession();
  if (workspaceSession) {
    return apiOk({
      authenticated: true,
      workspace: {
        id: workspaceSession.workspaceId,
        slug: workspaceSession.workspaceSlug,
      },
    });
  }

  const legacySession = await getCurrentSession();
  return apiOk({ authenticated: Boolean(legacySession) });
}
