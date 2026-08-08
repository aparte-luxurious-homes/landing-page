/**
 * Single source of truth for client environment variables.
 *
 * Reads from Vite's `import.meta.env` when present and falls back to Next's
 * `process.env` (which is statically inlined at build time for
 * `NEXT_PUBLIC_*`). That dual read is deliberate: it lets the same module
 * work before, during, and after the Vite → Next.js migration, so callers
 * never have to change again.
 *
 * IMPORTANT: every variable is read via an explicit static member expression.
 * Both bundlers do compile-time string replacement, so a dynamic lookup like
 * `env[name]` would silently resolve to undefined in a production build.
 */

type EnvRecord = Record<string, string | undefined>;

const viteEnv: EnvRecord =
  typeof import.meta !== "undefined" &&
  (import.meta as ImportMeta & { env?: EnvRecord }).env
    ? ((import.meta as ImportMeta & { env?: EnvRecord }).env as EnvRecord)
    : {};

// `process` is undefined in a Vite browser bundle, so guard before touching it.
const hasProcessEnv = typeof process !== "undefined" && !!process.env;

export const API_BASE_URL =
  viteEnv.VITE_API_BASE_URL ??
  (hasProcessEnv ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined) ??
  "";

export const SITE_URL =
  viteEnv.VITE_SITE_URL ??
  (hasProcessEnv ? process.env.NEXT_PUBLIC_SITE_URL : undefined) ??
  "https://aparte.ng";

export const ADMIN_DASHBOARD_URL =
  viteEnv.VITE_ADMIN_DASHBOARD_URL ??
  (hasProcessEnv ? process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL : undefined) ??
  "";

export const TOKEN_SECRET_KEY =
  viteEnv.VITE_TOKEN_SECRET_KEY ??
  (hasProcessEnv ? process.env.NEXT_PUBLIC_TOKEN_SECRET_KEY : undefined) ??
  "";

export const GOOGLE_CLIENT_ID =
  viteEnv.VITE_GOOGLE_CLIENT_ID ??
  (hasProcessEnv ? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID : undefined) ??
  "";

export const GOOGLE_MAPS_API_KEY =
  viteEnv.VITE_GOOGLE_MAPS_API_KEY ??
  (hasProcessEnv ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY : undefined) ??
  "";

export const GA4_MEASUREMENT_ID =
  viteEnv.VITE_GA4_MEASUREMENT_ID ??
  (hasProcessEnv ? process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID : undefined) ??
  "";

export const CLARITY_PROJECT_ID =
  viteEnv.VITE_CLARITY_PROJECT_ID ??
  (hasProcessEnv ? process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID : undefined) ??
  "";

export const SENTRY_DSN =
  viteEnv.VITE_SENTRY_DSN ??
  (hasProcessEnv ? process.env.NEXT_PUBLIC_SENTRY_DSN : undefined) ??
  "";

export const SUPPORT_WHATSAPP_NUMBER =
  viteEnv.VITE_SUPPORT_WHATSAPP_NUMBER ??
  (hasProcessEnv ? process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER : undefined) ??
  "";

/** True in a production build under either bundler.
 * Vite exposes a real boolean on import.meta.env.PROD; the EnvRecord typing
 * widens it to string, so compare loosely against both shapes. */
export const IS_PRODUCTION =
  (viteEnv.PROD as unknown) === true || viteEnv.PROD === "true"
    ? true
    : hasProcessEnv
      ? process.env.NODE_ENV === "production"
      : false;

/** True while rendering on the server (Node). Use to guard browser-only APIs. */
export const IS_SERVER = typeof window === "undefined";
