import { verify } from "@node-rs/argon2";
import { getPasscodeHash } from "@/lib/server/supabase";

export async function verifyPasscode(passcode: string): Promise<boolean> {
  if (!passcode || typeof passcode !== "string") return false;
  const hash = getPasscodeHash();
  try {
    return await verify(hash, passcode);
  } catch {
    return false;
  }
}
