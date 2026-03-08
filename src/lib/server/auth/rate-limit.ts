import { createHash } from "node:crypto";
import { getServiceSupabase, getSessionSecret } from "@/lib/server/supabase";

const WINDOW_MINUTES = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES ?? "15");
const BLOCK_MINUTES = Number(process.env.AUTH_RATE_LIMIT_BLOCK_MINUTES ?? "15");
const MAX_ATTEMPTS = Number(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS ?? "5");

function nowMs() {
  return Date.now();
}

function toIso(ms: number) {
  return new Date(ms).toISOString();
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
  const supabase = getServiceSupabase();
  const ipHash = hashIp(ip);
  const now = nowMs();

  const { data: row } = await supabase
    .from("auth_attempts")
    .select("*")
    .eq("ip_hash", ipHash)
    .maybeSingle();

  const windowStartMs = row?.window_start ? new Date(row.window_start).getTime() : now;
  const blockUntilMs = row?.blocked_until ? new Date(row.blocked_until).getTime() : 0;

  if (blockUntilMs > now) {
    return { blocked: true, retryAfterSeconds: Math.ceil((blockUntilMs - now) / 1000) };
  }

  const windowExpired = now - windowStartMs > WINDOW_MINUTES * 60 * 1000;
  const baseAttempts = windowExpired ? 0 : row?.attempt_count ?? 0;
  const nextAttempts = baseAttempts + 1;
  const shouldBlock = nextAttempts >= MAX_ATTEMPTS;
  const blockedUntil = shouldBlock ? toIso(now + BLOCK_MINUTES * 60 * 1000) : null;

  await supabase.from("auth_attempts").upsert(
    {
      ip_hash: ipHash,
      window_start: windowExpired ? toIso(now) : row?.window_start ?? toIso(now),
      attempt_count: nextAttempts,
      blocked_until: blockedUntil,
      updated_at: toIso(now),
    },
    { onConflict: "ip_hash" }
  );

  return {
    blocked: shouldBlock,
    retryAfterSeconds: shouldBlock ? BLOCK_MINUTES * 60 : 0,
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

  const blockedUntilMs = row?.blocked_until ? new Date(row.blocked_until).getTime() : 0;
  if (blockedUntilMs > now) {
    return {
      blocked: true,
      retryAfterSeconds: Math.ceil((blockedUntilMs - now) / 1000),
    };
  }
  return { blocked: false, retryAfterSeconds: 0 };
}
