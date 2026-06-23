"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { exitFullscreenIfActive } from "@/lib/fullscreen";
import {
  type AuthMode,
  authStorageKeys,
  type ExaminerInviteInput,
  normalizeEmail,
  parseAccountStatus,
  roleHomePath,
  seededAccounts,
  validateGuestPractice,
  validateExaminerInvite,
  validateRegistration,
  type DemoUser,
  type GuestPracticeInput,
  type ManagedExaminer,
  type ManagedUser,
  type RegistrationInput,
  type StoredAccount,
} from "@/lib/auth";
import { isPostgresAuthEnabled, setRememberMePreference } from "@/lib/auth-preferences";

export type AuthResult = {
  ok: boolean;
  message: string;
  redirectTo?: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  isLoading: boolean;
  authMode: AuthMode;
  accounts: StoredAccount[];
  signIn: (email: string, password: string, options?: { rememberMe?: boolean }) => Promise<AuthResult>;
  registerCandidate: (input: RegistrationInput) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string, confirmPassword: string) => Promise<AuthResult>;
  startGuestPractice: (input: GuestPracticeInput) => Promise<AuthResult>;
  listManagedUsers: () => Promise<ManagedUser[]>;
  listManagedExaminers: () => Promise<ManagedExaminer[]>;
  inviteExaminer: (input: ExaminerInviteInput) => Promise<AuthResult>;
  updateExaminer: (id: string, input: ExaminerInviteInput) => Promise<AuthResult>;
  setExaminerAccess: (id: string, enabled: boolean) => Promise<AuthResult>;
  removeExaminer: (id: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const authMode: AuthMode = isPostgresAuthEnabled() ? "postgres" : "local";

  useEffect(() => {
    let isMounted = true;

    if (authMode === "postgres") {
      fetchCurrentAuthUser()
        .then((nextUser) => {
          if (!isMounted) return;
          setUser(nextUser ?? loadCurrentGuest());
        })
        .catch(() => {
          if (!isMounted) return;
          setUser(loadCurrentGuest());
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }

    window.requestAnimationFrame(() => {
      if (!isMounted) return;
      const nextAccounts = loadAccounts();
      const storedUserId = getStoredUserId();
      const storedGuest = loadGuest();
      const storedUser =
        nextAccounts.find((item) => item.id === storedUserId) ??
        (storedGuest?.id === storedUserId ? storedGuest : null);
      setAccounts(nextAccounts);
      setUser(storedUser);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [authMode]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      authMode,
      accounts,
      signIn: async (email: string, password: string, options?: { rememberMe?: boolean }) => {
        const rememberMe = options?.rememberMe ?? true;
        const normalizedEmail = normalizeEmail(email);
        persistRememberedIdentity(rememberMe, normalizedEmail);
        setRememberMePreference(rememberMe, normalizedEmail);

        if (authMode === "postgres") {
          const { error } = await authClient.signIn.email({
            email: normalizedEmail,
            password,
            rememberMe,
          });

          if (error) {
            return { ok: false, message: formatAuthError(error.message) };
          }

          const nextUser = await fetchCurrentAuthUser();
          if (!nextUser) {
            await authClient.signOut();
            return { ok: false, message: "Unable to load your Talent Sprint profile." };
          }

          setUser(nextUser);
          return {
            ok: true,
            message: `Welcome back, ${nextUser.name}.`,
            redirectTo: roleHomePath(nextUser.role),
          };
        }

        const nextAccounts = accounts.length > 0 ? accounts : loadAccounts();
        const nextUser =
          nextAccounts.find((item) => item.email === normalizedEmail && item.password === password) ??
          null;

        if (!nextUser) {
          return { ok: false, message: "Email or password is incorrect." };
        }
        if (parseAccountStatus(nextUser.status) === "disabled") {
          return { ok: false, message: "This account is disabled. Contact your Talent Sprint administrator." };
        }

        saveCurrentUserId(nextUser.id, rememberMe);
        setAccounts(nextAccounts);
        setUser(nextUser);
        return {
          ok: true,
          message: `Welcome back, ${nextUser.name}.`,
          redirectTo: roleHomePath(nextUser.role),
        };
      },
      registerCandidate: async (input: RegistrationInput) => {
        const validationMessage = validateRegistration(input);
        if (validationMessage) return { ok: false, message: validationMessage };

        if (authMode === "postgres") {
          const email = normalizeEmail(input.email);
          const { error } = await authClient.signUp.email({
            name: input.name.trim(),
            email,
            password: input.password,
          });

          if (error) return { ok: false, message: error.message ?? "Unable to create account." };

          const nextUser = await fetchCurrentAuthUser();
          if (!nextUser) {
            return {
              ok: true,
              message: "Candidate account created. Check your email before logging in.",
            };
          }

          setUser(nextUser);
          return {
            ok: true,
            message: "Candidate account created.",
            redirectTo: roleHomePath(nextUser.role),
          };
        }

        const nextAccounts = accounts.length > 0 ? accounts : loadAccounts();
        const email = normalizeEmail(input.email);
        if (nextAccounts.some((account) => account.email === email)) {
          return { ok: false, message: "An account already exists for this email." };
        }

        const nextUser: StoredAccount = {
          id: `candidate-${crypto.randomUUID()}`,
          name: input.name.trim(),
          email,
          role: "candidate",
          password: input.password,
          createdAt: new Date().toISOString(),
        };
        const updatedAccounts = [...nextAccounts, nextUser];

        saveAccounts(updatedAccounts);
        window.localStorage.setItem(authStorageKeys.user, nextUser.id);
        setAccounts(updatedAccounts);
        setUser(nextUser);
        return {
          ok: true,
          message: "Candidate account created.",
          redirectTo: roleHomePath(nextUser.role),
        };
      },
      requestPasswordReset: async (email: string) => {
        const normalizedEmail = normalizeEmail(email);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
          return { ok: false, message: "Enter a valid email address." };
        }

        if (authMode === "postgres") {
          const { error } = await authClient.requestPasswordReset({
            email: normalizedEmail,
            redirectTo: getAuthRedirectUrl("/reset-password"),
          });

          if (error) return { ok: false, message: error.message ?? "Unable to send password reset link." };
          return {
            ok: true,
            message: "If this account exists, Talent Sprint will send a reset link.",
          };
        }

        return {
          ok: true,
          message: "Password reset email would be sent in production auth mode.",
        };
      },
      updatePassword: async (password: string, confirmPassword: string) => {
        if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
          return { ok: false, message: "Password must include an uppercase letter and a number." };
        }
        if (password !== confirmPassword) return { ok: false, message: "Passwords do not match." };

        if (authMode === "postgres") {
          const token = new URLSearchParams(window.location.search).get("token");
          if (!token) {
            return { ok: false, message: "Open this page from a valid password reset email." };
          }

          const { error } = await authClient.resetPassword({ newPassword: password, token });
          if (error) return { ok: false, message: error.message ?? "Unable to update password." };

          return { ok: true, message: "Password updated. You can continue to your workspace." };
        }

        return { ok: true, message: "Password would be updated in production auth mode." };
      },
      startGuestPractice: async (input: GuestPracticeInput) => {
        const validationMessage = validateGuestPractice(input);
        if (validationMessage) return { ok: false, message: validationMessage };

        const email = normalizeEmail(input.email);
        const nextUser: DemoUser = {
          id: `guest-${slugify(email)}-${crypto.randomUUID()}`,
          name: input.name.trim(),
          email,
          role: "candidate",
          isGuest: true,
        };

        window.localStorage.setItem(authStorageKeys.guest, JSON.stringify(nextUser));
        window.localStorage.setItem(authStorageKeys.user, nextUser.id);
        setUser(nextUser);

        return {
          ok: true,
          message: `Guest practice started for ${nextUser.name}.`,
          redirectTo: "/practice",
        };
      },
      listManagedUsers: async () => {
        if (authMode === "postgres") {
          const result = await adminApiRequest<{ users?: ManagedUser[] }>("/api/admin/examiners", {
            method: "GET",
          });
          return result.users ?? [];
        }

        const nextAccounts = loadAccounts();
        setAccounts(nextAccounts);
        return nextAccounts.map(mapStoredManagedUser);
      },
      listManagedExaminers: async () => {
        if (authMode === "postgres") {
          const result = await adminApiRequest<{ examiners?: ManagedExaminer[] }>(
            "/api/admin/examiners",
            { method: "GET" },
          );
          return result.examiners ?? [];
        }

        const nextAccounts = loadAccounts();
        setAccounts(nextAccounts);
        return nextAccounts.filter(isExaminerAccount).map(mapStoredExaminer);
      },
      inviteExaminer: async (input: ExaminerInviteInput) => {
        const validationMessage = validateExaminerInvite(input);
        if (validationMessage) return { ok: false, message: validationMessage };

        if (authMode === "postgres") {
          return adminApiRequest<AuthResult>("/api/admin/examiners", {
            method: "POST",
            body: JSON.stringify({ action: "invite", name: input.name.trim(), email: normalizeEmail(input.email) }),
          });
        }

        const nextAccounts = accounts.length > 0 ? accounts : loadAccounts();
        const email = normalizeEmail(input.email);
        const existing = nextAccounts.find((account) => account.email === email);
        if (existing && existing.role !== "examiner") {
          return { ok: false, message: "That email already belongs to a non-examiner account." };
        }

        const now = new Date().toISOString();
        const nextExaminer: StoredAccount = {
          id: existing?.id ?? `examiner-${crypto.randomUUID()}`,
          name: input.name.trim(),
          email,
          role: "examiner",
          password: existing?.password ?? "Password123!",
          status: "active",
          createdAt: existing?.createdAt ?? now,
          invitedAt: now,
        };
        const updatedAccounts = existing
          ? nextAccounts.map((account) => (account.id === existing.id ? nextExaminer : account))
          : [...nextAccounts, nextExaminer];

        saveAccounts(updatedAccounts);
        setAccounts(updatedAccounts);
        return {
          ok: true,
          message:
            "Examiner access created. In local mode they can sign in with Password123!; production sends a secure setup email.",
        };
      },
      updateExaminer: async (id: string, input: ExaminerInviteInput) => {
        const validationMessage = validateExaminerInvite(input);
        if (validationMessage) return { ok: false, message: validationMessage };

        if (authMode === "postgres") {
          return adminApiRequest<AuthResult>("/api/admin/examiners", {
            method: "POST",
            body: JSON.stringify({
              action: "update",
              id,
              name: input.name.trim(),
              email: normalizeEmail(input.email),
            }),
          });
        }

        const nextAccounts = accounts.length > 0 ? accounts : loadAccounts();
        const email = normalizeEmail(input.email);
        const existingEmailOwner = nextAccounts.find((account) => account.email === email && account.id !== id);
        if (existingEmailOwner) {
          return { ok: false, message: "Another account already uses that email." };
        }

        const updatedAccounts = nextAccounts.map((account) =>
          account.id === id && account.role === "examiner"
            ? {
                ...account,
                name: input.name.trim(),
                email,
              }
            : account,
        );

        saveAccounts(updatedAccounts);
        setAccounts(updatedAccounts);
        return { ok: true, message: "Examiner details updated." };
      },
      setExaminerAccess: async (id: string, enabled: boolean) => {
        if (authMode === "postgres") {
          return adminApiRequest<AuthResult>("/api/admin/examiners", {
            method: "POST",
            body: JSON.stringify({ action: enabled ? "enable" : "disable", id }),
          });
        }

        const nextAccounts = accounts.length > 0 ? accounts : loadAccounts();
        const updatedAccounts: StoredAccount[] = nextAccounts.map((account) =>
          account.id === id && account.role === "examiner"
            ? {
                ...account,
                status: enabled ? ("active" as const) : ("disabled" as const),
                disabledAt: enabled ? undefined : new Date().toISOString(),
              }
            : account,
        );
        saveAccounts(updatedAccounts);
        setAccounts(updatedAccounts);
        return { ok: true, message: enabled ? "Examiner access enabled." : "Examiner access disabled." };
      },
      removeExaminer: async (id: string) => {
        if (authMode === "postgres") {
          return adminApiRequest<AuthResult>("/api/admin/examiners", {
            method: "POST",
            body: JSON.stringify({ action: "remove", id }),
          });
        }

        const nextAccounts = accounts.length > 0 ? accounts : loadAccounts();
        const updatedAccounts = nextAccounts.filter((account) => account.id !== id || account.role !== "examiner");
        saveAccounts(updatedAccounts);
        setAccounts(updatedAccounts);
        return { ok: true, message: "Examiner access removed." };
      },
      signOut: async () => {
        await exitFullscreenIfActive();
        if (authMode === "postgres") {
          await authClient.signOut();
        }
        window.localStorage.removeItem(authStorageKeys.user);
        window.sessionStorage.removeItem(authStorageKeys.user);
        setUser(null);
      },
    }),
    [accounts, authMode, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

async function fetchCurrentAuthUser() {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });

  const payload = (await response.json()) as { ok: boolean; user?: DemoUser | null; message?: string };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.message ?? "Unable to load the current auth session.");
  }

  return payload.user ?? null;
}

function loadAccounts() {
  const stored = window.localStorage.getItem(authStorageKeys.accounts);
  const parsedAccounts = parseAccounts(stored);
  const accountMap = new Map<string, StoredAccount>();

  for (const account of [...seededAccounts, ...parsedAccounts]) {
    accountMap.set(account.email, account);
  }

  const accounts = Array.from(accountMap.values());
  saveAccounts(accounts);
  return accounts;
}

function persistRememberedIdentity(rememberMe: boolean, email: string) {
  window.localStorage.setItem(authStorageKeys.rememberMe, rememberMe ? "true" : "false");
  if (rememberMe) {
    window.localStorage.setItem(authStorageKeys.rememberEmail, email);
  } else {
    window.localStorage.removeItem(authStorageKeys.rememberEmail);
  }
}

function saveCurrentUserId(userId: string, rememberMe: boolean) {
  if (rememberMe) {
    window.localStorage.setItem(authStorageKeys.user, userId);
    window.sessionStorage.removeItem(authStorageKeys.user);
  } else {
    window.sessionStorage.setItem(authStorageKeys.user, userId);
    window.localStorage.removeItem(authStorageKeys.user);
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  window.localStorage.setItem(authStorageKeys.accounts, JSON.stringify(accounts));
}

function loadGuest() {
  const stored = window.localStorage.getItem(authStorageKeys.guest);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as DemoUser;
    return isGuestUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function loadCurrentGuest() {
  const storedUserId = getStoredUserId();
  const storedGuest = loadGuest();
  return storedGuest?.id === storedUserId ? storedGuest : null;
}

function getStoredUserId() {
  return window.localStorage.getItem(authStorageKeys.user) ?? window.sessionStorage.getItem(authStorageKeys.user);
}

function parseAccounts(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as StoredAccount[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredAccount);
  } catch {
    return [];
  }
}

function isStoredAccount(value: StoredAccount) {
  return (
    typeof value?.id === "string" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    ["candidate", "examiner", "administrator"].includes(value.role) &&
    typeof value.password === "string" &&
    typeof value.createdAt === "string" &&
    (value.status === undefined || value.status === "active" || value.status === "disabled")
  );
}

function isGuestUser(value: DemoUser) {
  return (
    typeof value?.id === "string" &&
    value.id.startsWith("guest-") &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    value.role === "candidate" &&
    value.isGuest === true
  );
}

function slugify(value: string) {
  return value.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "candidate";
}

function getAuthRedirectUrl(path: string) {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? window.location.origin;
  const origin = configuredOrigin.startsWith("http")
    ? configuredOrigin.replace(/\/+$/, "")
    : `https://${configuredOrigin.replace(/\/+$/, "")}`;

  return `${origin}${path}`;
}

function formatAuthError(message: string | undefined) {
  if (!message) return "Email or password is incorrect.";

  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes("invalid email or password") || lowerMessage.includes("invalid login")) {
    return "Email or password is incorrect. If you just registered, use Forgot password or contact support.";
  }

  return message;
}

function isExaminerAccount(account: StoredAccount): account is StoredAccount & { role: "examiner" } {
  return account.role === "examiner";
}

function mapStoredExaminer(account: StoredAccount & { role: "examiner" }): ManagedExaminer {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: "examiner",
    status: parseAccountStatus(account.status),
    createdAt: account.createdAt,
    invitedAt: account.invitedAt,
  };
}

function mapStoredManagedUser(account: StoredAccount): ManagedUser {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    status: parseAccountStatus(account.status),
    createdAt: account.createdAt,
    invitedAt: account.invitedAt,
  };
}

async function adminApiRequest<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(path, { ...init, headers, credentials: "include" });
  const payload = (await response.json()) as TResponse & { message?: string };
  if (!response.ok) {
    throw new Error(payload.message ?? "Admin request failed.");
  }

  return payload;
}
