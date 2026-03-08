import { createHash } from "node:crypto";
import { getServiceSupabase, getSessionSecret } from "@/lib/server/supabase";

const WINDOW_MINUTES = Number(
  process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES ?? "15",
);
const BLOCK_MINUTES = Number(process.env.AUTH_RATE_LIMIT_BLOCK_MINUTES ?? "15");
const MAX_ATTEMPTS = Number(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS ?? "5");

function nowMs() {
  return Date.now();
}

export function getRequestIp(requestHeaders: Headers): string {
  const fromForwarded = requestHeaders.get("x-forwarded-for");
  if (fromForwarded) {
    return fromForwarded.split(",")[0].trim();
  }
  return requestHeaders.get("x-real-ip") ?? "0.0.0.0";
}

function hashIp(ip: string): string {
  const secret = getSessionSecret();
  return createHash("sha256").update(`${ip}:${secret}`).digest("hex");
}

interface AttemptState {
  blocked: boolean;
  retryAfterSeconds: number;
}

export async function recordFailedAttempt(ip: string): Promise<AttemptState> {
  const ipHash = hashIp(ip);
  const supabase = getServiceSupabase();

  const { data, error } = await supabase.rpc("increment_failed_attempt", {
    p_ip_hash: ipHash,
    p_window_minutes: WINDOW_MINUTES,
    p_block_minutes: BLOCK_MINUTES,
    p_max_attempts: MAX_ATTEMPTS,
  });

  if (error || !data || data.length === 0) {
    console.error("Rate limit RPC error:", error);
    // Fail closed if the DB errors out
    return { blocked: true, retryAfterSeconds: BLOCK_MINUTES * 60 };
  }

  const result = data[0];
  let retryAfterSeconds = 0;

  if (result.is_blocked && result.blocked_until) {
    const blockEnd = new Date(result.blocked_until).getTime();
    retryAfterSeconds = Math.max(0, Math.ceil((blockEnd - Date.now()) / 1000));
  }

  return {
    blocked: result.is_blocked,
    retryAfterSeconds,
  };
}

export async function clearAttempts(ip: string) {
  const supabase = getServiceSupabase();
  const ipHash = hashIp(ip);
  await supabase.from("auth_attempts").delete().eq("ip_hash", ipHash);
}

export async function isBlocked(ip: string): Promise<AttemptState> {
  const supabase = getServiceSupabase();
  const ipHash = hashIp(ip);
  const now = nowMs();
  const { data: row } = await supabase
    .from("auth_attempts")
    .select("blocked_until")
    .eq("ip_hash", ipHash)
    .maybeSingle();

  const blockedUntilMs = row?.blocked_until
    ? new Date(row.blocked_until).getTime()
    : 0;
  if (blockedUntilMs > now) {
    return {
      blocked: true,
      retryAfterSeconds: Math.ceil((blockedUntilMs - now) / 1000),
    };
  }
  return { blocked: false, retryAfterSeconds: 0 };
}
