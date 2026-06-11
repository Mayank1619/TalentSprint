import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseKey());
}

export function getSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) return null;
  if (!browserClient) {
    browserClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return browserClient;
}

function getSupabaseUrl() {
  return normalizeSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

function getSupabaseKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function normalizeSupabaseProjectUrl(value: string | undefined) {
  if (!value) return undefined;

  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return undefined;

  return trimmed.replace(/\/(rest|auth|storage)\/v1$/i, "");
}
