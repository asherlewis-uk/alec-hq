import { apiOk } from "@/lib/server/api-response";
import { getStoredPin } from "@/lib/server/auth/pin";

export const runtime = "nodejs";

export async function GET() {
  const pinHash = await getStoredPin();
  return apiOk({ hasPin: Boolean(pinHash) });
}
