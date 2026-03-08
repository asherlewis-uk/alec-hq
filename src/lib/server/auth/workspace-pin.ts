import { verify } from "@node-rs/argon2";
import { getServiceSupabase } from "@/lib/server/supabase";

export interface VerifiedWorkspace {
  id: string;
  slug: string;
  name: string;
}

export async function verifyWorkspacePin(
  workspaceSlug: string,
  pin: string,
): Promise<VerifiedWorkspace | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("workspaces")
    .select("id, slug, name, workspace_credentials(pin_hash)")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (error || !data) return null;

  const pinHash = Array.isArray(data.workspace_credentials)
    ? data.workspace_credentials[0]?.pin_hash
    : data.workspace_credentials?.pin_hash;

  if (!pinHash) return null;

  try {
    const ok = await verify(pinHash, pin);
    if (!ok) return null;
  } catch {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
  };
}
