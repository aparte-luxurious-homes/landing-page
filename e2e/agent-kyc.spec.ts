import fs from "node:fs";
import path from "node:path";
import type { Page, Route } from "@playwright/test";
import { expect, test } from "@playwright/test";
import CryptoJS from "crypto-js";

/**
 * Agent approval gate — the KYC page an unapproved agent lands on.
 *
 * The API is mocked: these assert what the agent sees for each approval
 * status and that the form refuses an incomplete submission, not the
 * server-side gate (covered by api-v1 tests/test_agent_approval_gate.py).
 *
 * Auth is client-side: the token lives AES-encrypted in sessionStorage under
 * NEXT_PUBLIC_TOKEN_SECRET_KEY, so the spec seeds it with the same key the
 * dev server was started with.
 */

function tokenSecretKey(): string | undefined {
  if (process.env.NEXT_PUBLIC_TOKEN_SECRET_KEY) return process.env.NEXT_PUBLIC_TOKEN_SECRET_KEY;
  for (const file of [".env.local", ".env.development.local", ".env.development", ".env"]) {
    const full = path.join(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    const match = fs
      .readFileSync(full, "utf8")
      .match(/^\s*NEXT_PUBLIC_TOKEN_SECRET_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
    if (match) return match[1];
  }
  return undefined;
}

const SECRET = tokenSecretKey();

type Status = "KYC_PENDING" | "PENDING_APPROVAL" | "REJECTED";

function profileBody(status: Status, reason: string | null = null) {
  return {
    message: "Profile retrieved successfully",
    data: {
      id: "agent-1",
      userId: "agent-1",
      email: "agent@example.com",
      phone: "+2348022222222",
      role: "AGENT",
      isVerified: true,
      isProfileComplete: true,
      missingProfileFields: [],
      agentApprovalStatus: status,
      agentApprovalRejectionReason: reason,
      agentKycSubmittedAt: status === "KYC_PENDING" ? null : "2026-09-14T10:00:00Z",
      profile: {
        firstName: "Sales",
        lastName: "Agent",
        dob: "1988-07-09",
        address: null,
        city: null,
        state: null,
        country: null,
        kycStatus: status === "REJECTED" ? "REJECTED" : "PENDING",
      },
      wallets: [],
    },
  };
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

async function signInAsAgent(page: Page, initial: Status, reason: string | null = null) {
  const state = { status: initial, reason, submissions: 0 };

  await page.addInitScript((encrypted) => {
    window.sessionStorage.setItem("authToken", encrypted);
  }, CryptoJS.AES.encrypt(JSON.stringify("e2e-agent-token"), SECRET!).toString());

  await page.route("**/api/v1/profile", (route) => json(route, profileBody(state.status, state.reason)));
  await page.route("**/api/v1/profile/kyc/documents", (route) =>
    json(route, { data: { profile_kyc_status: "PENDING", items: [] } }),
  );
  await page.route("**/api/v1/profile/agent-kyc", async (route) => {
    state.submissions += 1;
    state.status = "PENDING_APPROVAL";
    state.reason = null;
    await json(route, {
      message: "KYC Submitted Successfully",
      data: { title: "KYC Submitted Successfully", agentApprovalStatus: "PENDING_APPROVAL" },
    }, 201);
  });

  return state;
}

test.describe("agent KYC page", () => {
  test.skip(!SECRET, "NEXT_PUBLIC_TOKEN_SECRET_KEY is not available to seed a session");

  test("an agent who has not submitted KYC must complete every field", async ({ page }) => {
    const state = await signInAsAgent(page, "KYC_PENDING");
    await page.goto("/agent/kyc", { waitUntil: "domcontentloaded" });

    const form = page.getByTestId("agent-kyc-form");
    await expect(form).toBeVisible();
    await expect(page.getByLabel("First name")).toHaveValue("Sales");
    await expect(page.getByLabel("Country")).toHaveValue("Nigeria");

    await page.getByRole("button", { name: "Submit KYC for review" }).click();
    await expect(page.getByText("City / town is required")).toBeVisible();
    await expect(page.getByText("Upload your identification document")).toBeVisible();
    expect(state.submissions).toBe(0);
  });

  test("a complete submission moves the agent to pending approval", async ({ page }) => {
    const state = await signInAsAgent(page, "KYC_PENDING");
    await page.goto("/agent/kyc", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("agent-kyc-form")).toBeVisible();

    await page.getByLabel("Address", { exact: true }).fill("12 Admiralty Way");
    await page.getByLabel("City / Town").fill("Lekki");
    await page.getByLabel("State / Region").fill("Lagos");
    await page.locator("#agent-kyc-file-input").setInputFiles({
      name: "passport.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image"),
    });
    await page.getByRole("button", { name: "Submit KYC for review" }).click();

    await expect(page.getByTestId("kyc-pending")).toContainText("KYC Submitted Successfully");
    await expect(page.getByTestId("kyc-pending")).toContainText("sales@aparte.ng");
    await expect(page.getByTestId("agent-kyc-form")).toBeHidden();
    expect(state.submissions).toBe(1);
  });

  test("a rejected agent sees the reason and can resubmit", async ({ page }) => {
    await signInAsAgent(page, "REJECTED", "Name does not match the document");
    await page.goto("/agent/kyc", { waitUntil: "domcontentloaded" });

    const banner = page.getByTestId("kyc-rejected");
    await expect(banner).toContainText("KYC Verification Unsuccessful");
    await expect(banner).toContainText("Name does not match the document");
    await expect(page.getByTestId("agent-kyc-form")).toBeVisible();
  });
});
