import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke coverage for the Vite → Next.js migration.
 *
 * These tests are the migration's safety net: they must pass identically
 * against the current Vite build and against the ported Next.js app. They
 * deliberately assert on user-visible behaviour (headings, navigation,
 * form reachability) rather than implementation details, so the same file
 * works across both rendering models.
 *
 * BASE_URL overrides the target, e.g. against a preview deploy:
 *   BASE_URL=https://aparte-preview.vercel.app npx playwright test
 */
const PORT = process.env.PORT ?? "3000";
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  // Capped deliberately: the dev server (Vite today, Next after the
  // migration) compiles on demand, so high parallelism produces navigation
  // timeouts that look like regressions but are just contention.
  workers: 2,
  reporter: process.env.CI ? "github" : "list",
  timeout: 45_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],

  // Only start a dev server when pointing at localhost.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: process.env.MIGRATION_TARGET === "next" ? "npm run dev" : "npm run dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
