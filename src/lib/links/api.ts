/** Server-side fetchers for the api-v1 public endpoints.
 *
 * All GET endpoints return the CustomResponse envelope {message, data}; these
 * helpers unwrap it. A 404 (unpublished/unknown slug or handle) returns null
 * so pages can call notFound().
 */

import type {
  CheckoutResult,
  PublicCatalog,
  PublicProperty,
  ShortLinkTarget,
  UnitCalendar,
} from "./types";

import { API_BASE_URL } from "@/config/env";

/**
 * The env var already points at the API root (with or without a trailing
 * /api/v1 — see utils/url.ts::normalizeApiUrl), so strip any suffix before
 * appending the public namespace.
 */
export const API_BASE = (API_BASE_URL || "https://api.aparteng.com").replace(
  /\/api\/v1\/?$/,
  ""
);

const PUBLIC = `${API_BASE}/api/v1/public`;

async function getJson<T>(url: string, revalidate = 60): Promise<T | null> {
  const res = await fetch(url, { next: { revalidate } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status} for ${url}`);
  const body = await res.json();
  return body.data as T;
}

export function getProperty(slug: string): Promise<PublicProperty | null> {
  return getJson<PublicProperty>(`${PUBLIC}/properties/${encodeURIComponent(slug)}`);
}

export function getPropertyInCatalogContext(
  handle: string,
  slug: string
): Promise<PublicProperty | null> {
  return getJson<PublicProperty>(
    `${PUBLIC}/catalogs/${encodeURIComponent(handle)}/properties/${encodeURIComponent(slug)}`
  );
}

export function getCatalog(
  handle: string,
  page = 1
): Promise<PublicCatalog | null> {
  return getJson<PublicCatalog>(
    `${PUBLIC}/catalogs/${encodeURIComponent(handle)}?page=${page}`
  );
}

export async function getAvailability(
  slug: string,
  startDate: string,
  endDate: string,
  unitId?: string
): Promise<UnitCalendar[] | null> {
  const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
  if (unitId) params.set("unit_id", unitId);
  const data = await getJson<{ units: UnitCalendar[] }>(
    `${PUBLIC}/properties/${encodeURIComponent(slug)}/availability?${params}`,
    0
  );
  return data?.units ?? null;
}

export function resolveShortLink(code: string): Promise<ShortLinkTarget | null> {
  return getJson<ShortLinkTarget>(
    `${PUBLIC}/short-links/${encodeURIComponent(code)}`,
    0
  );
}

/** Client-side checkout POST — returns the parsed envelope or throws with the
 * API's detail message. */
export async function createPublicBooking(
  slug: string,
  payload: Record<string, unknown>
): Promise<CheckoutResult> {
  const res = await fetch(`${PUBLIC}/properties/${encodeURIComponent(slug)}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail =
      typeof body.detail === "string"
        ? body.detail
        : "Something went wrong. Please try again.";
    throw new Error(detail);
  }
  return body.data as CheckoutResult;
}

/**
 * Currency for META STRINGS: "NGN 85,000", never the naira glyph.
 *
 * formatNaira below is the on-screen form and keeps the glyph, which is right
 * for a price chip a human reads. Meta descriptions, OG descriptions and
 * JSON-LD are machine-read and get mangled or dropped by some unfurlers and
 * crawlers when they carry a non-ASCII currency symbol, so brand copy standard
 * is the ISO code. See api-v1/docs/seo-luxury-strip-spec.md.
 */
export function formatNgn(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "";
  return `NGN ${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(n)}`;
}

export function formatNaira(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
}
