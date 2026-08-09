/**
 * Single source of truth for client environment variables.
 *
 * Every value is read via an explicit, static `process.env.NEXT_PUBLIC_*`
 * member expression. Next inlines these at build time by literal string
 * replacement, so a dynamic lookup (`process.env[name]`) would silently
 * resolve to undefined in a production build.
 *
 * The Vite `VITE_*` names this replaced still exist in deployment configs;
 * map them across when setting Vercel project env vars.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aparte.ng";

export const ADMIN_DASHBOARD_URL =
  process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL ?? "";

export const TOKEN_SECRET_KEY =
  process.env.NEXT_PUBLIC_TOKEN_SECRET_KEY ?? "";

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? "";

export const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "";

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";

export const SUPPORT_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER ?? "";

/** True in a production build. */
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** True while rendering on the server. Use to guard browser-only APIs. */
export const IS_SERVER = typeof window === "undefined";
