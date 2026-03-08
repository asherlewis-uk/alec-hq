import { apiOk } from "@/lib/server/api-response";
import { getCurrentWorkspaceSession } from "@/lib/server/auth/session";

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

  return apiOk({ authenticated: false });
}
