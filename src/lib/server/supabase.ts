import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getServiceSupabase() {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for server-side data access.");
  }

  cachedClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        "x-client-info": "alec-hq-server",
      },
    },
  });
  return cachedClient;
}

export function getSessionSecret() {
  return getRequiredEnv("SESSION_SECRET");
}

export function getPasscodeHash() {
  return getRequiredEnv("APP_PASSCODE_HASH");
}
