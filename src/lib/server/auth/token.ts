import { timingSafeEqual } from "node:crypto";

const encoder = new TextEncoder();

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing required environment variable: SESSION_SECRET");
  }
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64url"));
  }
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signMessage(message: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );
  return toBase64Url(new Uint8Array(signature));
}

// ─── Workspace Session Tokens ────────────────────────────────

export interface WorkspaceSessionPayload {
  role: "workspace_member";
  workspaceId: string;
  workspaceSlug: string;
  iat: number;
  exp: number;
  version: 1;
}

export async function createWorkspaceSessionToken(
  workspace: { id: string; slug: string },
  now = Date.now(),
): Promise<string> {
  const ttlHours = Number(process.env.SESSION_TTL_HOURS ?? "12");
  const issuedAtSec = Math.floor(now / 1000);
  const payload: WorkspaceSessionPayload = {
    role: "workspace_member",
    workspaceId: workspace.id,
    workspaceSlug: workspace.slug,
    iat: issuedAtSec,
    exp: issuedAtSec + Math.max(1, ttlHours) * 60 * 60,
    version: 1,
  };
  const payloadEncoded = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const secret = getSessionSecret();
  const signature = await signMessage(payloadEncoded, secret);
  return `${payloadEncoded}.${signature}`;
}

export async function verifyWorkspaceSessionToken(
  token?: string | null,
): Promise<WorkspaceSessionPayload | null> {
  if (!token) return null;
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return null;

  const secret = getSessionSecret();
  const expected = await signMessage(payloadEncoded, secret);
  const sigBuf = Buffer.from(signature, "base64url");
  const expBuf = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payloadJson = new TextDecoder().decode(fromBase64Url(payloadEncoded));
    const payload = JSON.parse(payloadJson) as WorkspaceSessionPayload;
    if (payload.role !== "workspace_member") return null;
    if (payload.version !== 1) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.workspaceId || !payload.workspaceSlug) return null;
    return payload;
  } catch {
    return null;
  }
}
