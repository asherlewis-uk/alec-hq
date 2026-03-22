import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const STALE_ENTRY_MS = WINDOW_MS + BLOCK_MS;

interface WorkspaceLoginRateLimitEntry {
  attemptCount: number;
  windowStart: number;
  blockedUntil: number | null;
  updatedAt: number;
}

export interface WorkspaceLoginRateLimitStatus {
  blocked: boolean;
  retryAfterSeconds: number | null;
}

declare global {
  var __alecWorkspaceLoginRateLimitStore:
    | Map<string, WorkspaceLoginRateLimitEntry>
    | undefined;
}

function getStore() {
  if (!globalThis.__alecWorkspaceLoginRateLimitStore) {
    globalThis.__alecWorkspaceLoginRateLimitStore = new Map();
  }

  return globalThis.__alecWorkspaceLoginRateLimitStore;
}

function pruneStore(
  store: Map<string, WorkspaceLoginRateLimitEntry>,
  now: number,
) {
  for (const [key, entry] of store.entries()) {
    const activeUntil = Math.max(entry.updatedAt, entry.blockedUntil ?? 0);
    if (now - activeUntil > STALE_ENTRY_MS) {
      store.delete(key);
    }
  }
}

function toRetryAfterSeconds(blockedUntil: number, now: number) {
  return Math.max(1, Math.ceil((blockedUntil - now) / 1000));
}

function getClientFingerprint(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const userAgent = request.headers.get("user-agent")?.trim();
  const source = clientIp || realIp || `ua:${userAgent || "unknown"}`;

  return createHash("sha256").update(source).digest("hex");
}

export function getWorkspaceLoginRateLimitKey(
  request: NextRequest,
  workspaceSlug: string,
) {
  const clientFingerprint = getClientFingerprint(request);
  return createHash("sha256")
    .update(`${workspaceSlug}:${clientFingerprint}`)
    .digest("hex");
}

export function getWorkspaceLoginRateLimitStatus(
  key: string,
  now = Date.now(),
): WorkspaceLoginRateLimitStatus {
  const store = getStore();
  pruneStore(store, now);

  const entry = store.get(key);
  if (!entry) {
    return { blocked: false, retryAfterSeconds: null };
  }

  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      blocked: true,
      retryAfterSeconds: toRetryAfterSeconds(entry.blockedUntil, now),
    };
  }

  if (now - entry.windowStart >= WINDOW_MS) {
    store.delete(key);
  }

  return { blocked: false, retryAfterSeconds: null };
}

export function recordWorkspaceLoginFailure(
  key: string,
  now = Date.now(),
): WorkspaceLoginRateLimitStatus {
  const store = getStore();
  pruneStore(store, now);

  const current = store.get(key);

  let entry: WorkspaceLoginRateLimitEntry;
  if (
    !current ||
    now - current.windowStart >= WINDOW_MS ||
    (current.blockedUntil !== null && current.blockedUntil <= now)
  ) {
    entry = {
      attemptCount: 1,
      windowStart: now,
      blockedUntil: null,
      updatedAt: now,
    };
  } else {
    entry = {
      ...current,
      attemptCount: current.attemptCount + 1,
      updatedAt: now,
    };

    if (entry.attemptCount >= MAX_ATTEMPTS) {
      entry.blockedUntil = now + BLOCK_MS;
    }
  }

  store.set(key, entry);

  if (entry.blockedUntil && entry.blockedUntil > now) {
    return {
      blocked: true,
      retryAfterSeconds: toRetryAfterSeconds(entry.blockedUntil, now),
    };
  }

  return { blocked: false, retryAfterSeconds: null };
}

export function clearWorkspaceLoginRateLimit(key: string) {
  getStore().delete(key);
}
