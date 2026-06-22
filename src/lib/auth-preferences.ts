const rememberMeKey = "talent-sprint-remember-me";
const rememberedEmailKey = "talent-sprint-remembered-email";

export function isPostgresAuthEnabled() {
  return process.env.NEXT_PUBLIC_AUTH_MODE === "postgres";
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
