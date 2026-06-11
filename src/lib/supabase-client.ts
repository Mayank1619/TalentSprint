import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

const rememberMeKey = "talent-sprint-remember-me";
const rememberedEmailKey = "talent-sprint-remembered-email";

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
        storage: createRememberAwareStorage(),
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

export function setRememberMePreference(remember: boolean, email?: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(rememberMeKey, remember ? "true" : "false");
  if (remember && email) {
    window.localStorage.setItem(rememberedEmailKey, email.trim().toLowerCase());
  } else if (!remember) {
    window.localStorage.removeItem(rememberedEmailKey);
  }
}

export function getRememberMePreference() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(rememberMeKey) !== "false";
}

export function getRememberedEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(rememberedEmailKey) ?? "";
}

function createRememberAwareStorage() {
  return {
    getItem(key: string) {
      if (typeof window === "undefined") return null;
      if (!getRememberMePreference()) return window.sessionStorage.getItem(key);

      return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
    },
    setItem(key: string, value: string) {
      if (typeof window === "undefined") return;
      if (getRememberMePreference()) {
        window.localStorage.setItem(key, value);
        window.sessionStorage.removeItem(key);
      } else {
        window.sessionStorage.setItem(key, value);
        window.localStorage.removeItem(key);
      }
    },
    removeItem(key: string) {
      if (typeof window === "undefined") return;
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    },
  };
}
