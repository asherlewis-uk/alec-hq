import { hash, verify } from "@node-rs/argon2";
import { getServiceSupabase } from "@/lib/server/supabase";

const PIN_REGEX = /^\d{6}$/;

export function isValidPin(pin: unknown): pin is string {
  return typeof pin === "string" && PIN_REGEX.test(pin);
}

export async function hashPin(pin: string): Promise<string> {
  return hash(pin, {
    algorithm: 2, // Argon2id
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function getStoredPin(): Promise<string | null> {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from("app_pin")
    .select("pin_hash")
    .eq("id", true)
    .maybeSingle();
  return data?.pin_hash ?? null;
}

export async function storePin(pin: string): Promise<void> {
  const pinHash = await hashPin(pin);
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("app_pin")
    .insert({ id: true, pin_hash: pinHash });
  if (error) throw new Error("Failed to store PIN.");
}

export async function verifyPin(pin: string): Promise<boolean> {
  if (!isValidPin(pin)) return false;
  const storedHash = await getStoredPin();
  if (!storedHash) return false;
  try {
    return await verify(storedHash, pin);
  } catch {
    return false;
  }
}
