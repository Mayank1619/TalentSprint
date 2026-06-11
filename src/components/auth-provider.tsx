"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  type AuthMode,
  authStorageKeys,
  normalizeEmail,
  parseRole,
  roleHomePath,
  seededAccounts,
  validateGuestPractice,
  validateRegistration,
  type DemoUser,
  type GuestPracticeInput,
  type RegistrationInput,
  type StoredAccount,
} from "@/lib/auth";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase-client";

type AuthResult = {
  ok: boolean;
  message: string;
  redirectTo?: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  authMode: AuthMode;
  accounts: StoredAccount[];
  signIn: (email: string, password: string) => Promise<AuthResult>;
  registerCandidate: (input: RegistrationInput) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string, confirmPassword: string) => Promise<AuthResult>;
  startGuestPractice: (input: GuestPracticeInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const authMode: AuthMode = isSupabaseConfigured() ? "supabase" : "local";

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setUser(data.session?.user ? mapSupabaseUser(data.session.user) : loadCurrentGuest());
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ? mapSupabaseUser(session.user) : loadCurrentGuest());
      });

      return () => subscription.unsubscribe();
    }

    window.requestAnimationFrame(() => {
      const nextAccounts = loadAccounts();
      const storedUserId = window.localStorage.getItem(authStorageKeys.user);
      const storedGuest = loadGuest();
      const storedUser =
        nextAccounts.find((item) => item.id === storedUserId) ??
        (storedGuest?.id === storedUserId ? storedGuest : null);
      setAccounts(nextAccounts);
      setUser(storedUser);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      authMode,
      accounts,
      signIn: async (email: string, password: string) => {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await withAuthRequest(() =>
            supabase.auth.signInWithPassword({
              email: normalizeEmail(email),
              password,
            }),
          );

          if (error || !data.user) {
            return { ok: false, message: error?.message ?? "Email or password is incorrect." };
          }

          const nextUser = mapSupabaseUser(data.user);
          setUser(nextUser);
          return {
            ok: true,
            message: `Welcome back, ${nextUser.name}.`,
            redirectTo: roleHomePath(nextUser.role),
          };
        }

        const nextAccounts = accounts.length > 0 ? accounts : loadAccounts();
        const nextUser =
          nextAccounts.find((item) => item.email === normalizeEmail(email) && item.password === password) ??
          null;

        if (!nextUser) {
          return { ok: false, message: "Email or password is incorrect." };
        }

        window.localStorage.setItem(authStorageKeys.user, nextUser.id);
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

        const supabase = getSupabaseClient();
        if (supabase) {
          const email = normalizeEmail(input.email);
          const { data, error } = await withAuthRequest(() =>
            supabase.auth.signUp({
              email,
              password: input.password,
              options: {
                data: {
                  name: input.name.trim(),
                  role: "candidate",
                },
              },
            }),
          );

          if (error || !data.user) {
            return { ok: false, message: error?.message ?? "Unable to create account." };
          }

          const nextUser = mapSupabaseUser(data.user);
          setUser(data.session ? nextUser : null);
          return {
            ok: true,
            message: data.session
              ? "Candidate account created."
              : "Candidate account created. Check your email to confirm before logging in.",
            redirectTo: data.session ? roleHomePath(nextUser.role) : undefined,
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

        const supabase = getSupabaseClient();
        if (!supabase) {
          return {
            ok: true,
            message: "Password reset email would be sent in production auth mode.",
          };
        }

        const { error } = await withAuthRequest(() =>
          supabase.auth.resetPasswordForEmail(normalizedEmail, {
            redirectTo: `${window.location.origin}/reset-password`,
          }),
        );

        if (error) return { ok: false, message: error.message };
        return { ok: true, message: "Check your email for the password reset link." };
      },
      updatePassword: async (password: string, confirmPassword: string) => {
        if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
          return { ok: false, message: "Password must include an uppercase letter and a number." };
        }
        if (password !== confirmPassword) return { ok: false, message: "Passwords do not match." };

        const supabase = getSupabaseClient();
        if (!supabase) {
          return { ok: true, message: "Password would be updated in production auth mode." };
        }

        const { data, error } = await withAuthRequest(() => supabase.auth.updateUser({ password }));
        if (error) return { ok: false, message: error.message };
        if (data.user) setUser(mapSupabaseUser(data.user));
        return { ok: true, message: "Password updated. You can continue to your workspace." };
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
      signOut: async () => {
        const supabase = getSupabaseClient();
        if (supabase) {
          await supabase.auth.signOut();
        }
        window.localStorage.removeItem(authStorageKeys.user);
        setUser(null);
      },
    }),
    [accounts, authMode, user],
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
  const storedUserId = window.localStorage.getItem(authStorageKeys.user);
  const storedGuest = loadGuest();
  return storedGuest?.id === storedUserId ? storedGuest : null;
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
    typeof value.createdAt === "string"
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

async function withAuthRequest<TResponse extends { data: unknown; error: { message: string } | null }>(
  request: () => Promise<TResponse>,
): Promise<TResponse> {
  try {
    return await request();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach Supabase Auth.";
    return {
      data: {} as TResponse["data"],
      error: {
        message:
          message === "Failed to fetch"
            ? "Unable to reach Supabase Auth. Check your internet connection and try again."
            : message,
      },
    } as TResponse;
  }
}

function mapSupabaseUser(value: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): DemoUser {
  const metadata = value.user_metadata ?? {};
  const role = parseRole(metadata.role);
  const email = value.email ?? "";
  const fallbackName = email ? email.split("@")[0] : "Talent Sprint User";

  return {
    id: value.id,
    name: typeof metadata.name === "string" && metadata.name.trim() ? metadata.name : fallbackName,
    email,
    role,
  };
}
