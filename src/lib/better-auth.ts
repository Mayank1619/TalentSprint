import { betterAuth } from "better-auth";
import { PostgresDialect } from "kysely";
import { getPostgresPool } from "@/lib/postgres";
import { sendRawTalentSprintEmail } from "@/lib/email";

export const auth = betterAuth({
  baseURL: getAuthBaseUrl(),
  secret: process.env.BETTER_AUTH_SECRET ?? "talent-sprint-local-development-secret-change-me",
  database: new PostgresDialect({
    pool: getPostgresPool(),
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendRawTalentSprintEmail({
        to: user.email,
        subject: "Reset your Talent Sprint password",
        html: `
          <h1>Reset your Talent Sprint password</h1>
          <p>Use this secure link to choose a new password:</p>
          <p><a href="${url}">Reset password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      });
    },
  },
  trustedOrigins: getTrustedOrigins(),
});

function getAuthBaseUrl() {
  const configured = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL;
  if (configured) return normalizeOrigin(configured);
  return "http://localhost:3000";
}

function getTrustedOrigins() {
  const origins = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined,
    "http://localhost:3000",
  ];

  return Array.from(
    new Set(
      origins
        .filter((origin): origin is string => Boolean(origin))
        .map((origin) => normalizeOrigin(origin)),
    ),
  );
}

function normalizeOrigin(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}
