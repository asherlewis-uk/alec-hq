import { apiOk } from "@/lib/server/api-response";
import { getCurrentSession } from "@/lib/server/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();
  return apiOk({ authenticated: Boolean(session) });
}
