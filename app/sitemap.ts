import type { MetadataRoute } from "next";

import { SITE_URL } from "@/config/env";
import { allGuides, slugOf } from "@/lib/help/data";
import { API_BASE } from "@/lib/links/api";
import { SHORTLET_CITIES } from "@/lib/seo/cities";

/**
 * Dynamic sitemap, revalidated hourly.
 *
 * Replaces scripts/generate-sitemap.mjs, which ran once at build time and
 * therefore went stale as soon as a property was published or unpublished.
 * Failures degrade to the static routes rather than breaking the sitemap —
 * an incomplete sitemap is recoverable, a 500 is not.
 */

export const revalidate = 3600;

const STATIC_PATHS = [
  { path: "/", priority: 1.0, changeFrequency: "daily" as const },
  { path: "/shortlets", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/search-results", priority: 0.8, changeFrequency: "daily" as const },
  { path: "/help", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/help/faq", priority: 0.6, changeFrequency: "weekly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/cancellation-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/verify", priority: 0.4, changeFrequency: "monthly" as const },
];

interface ListedProperty {
  id?: string;
  slug?: string | null;
  updated_at?: string | null;
}

async function fetchPublishedProperties(): Promise<ListedProperty[]> {
  const out: ListedProperty[] = [];
  try {
    // Cap the walk: a runaway loop here would hammer the API on every
    // revalidation.
    for (let page = 1; page <= 20; page++) {
      const res = await fetch(
        `${API_BASE}/api/v1/properties?page=${page}&limit=100&is_verified=true`,
        { next: { revalidate: 3600 } }
      );
      if (!res.ok) break;
      const body = await res.json();
      const rows: ListedProperty[] = body?.data?.data?.data ?? body?.data?.data ?? [];
      if (!Array.isArray(rows) || rows.length === 0) break;
      out.push(...rows);
      if (rows.length < 100) break;
    }
  } catch {
    // Network/API failure — fall back to static routes only.
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (SITE_URL || "https://aparte.ng").replace(/\/+$/, "");
  const now = new Date();

  // No lastModified on static paths: stamping them "now" on every hourly
  // revalidation told crawlers everything changed constantly, which teaches
  // them to ignore the signal entirely.
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${base}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  // City landing pages — the indexable commercial-intent surface.
  for (const city of SHORTLET_CITIES) {
    entries.push({
      url: `${base}/shortlets/${city.slug}`,
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  // Help hubs + every guide article (local content, zero fetch cost).
  for (const audience of ["owners", "agents", "guests"]) {
    entries.push({
      url: `${base}/help/${audience}`,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }
  for (const guide of allGuides) {
    entries.push({
      url: `${base}/help/${guide.audience}s/${slugOf(guide)}`,
      changeFrequency: "monthly",
      priority: 0.4,
    });
  }

  for (const property of await fetchPublishedProperties()) {
    const lastModified = property.updated_at
      ? new Date(property.updated_at)
      : now;

    // Aparte Link slug page, when the owner has published one.
    if (property.slug) {
      entries.push({
        url: `${base}/${property.slug}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.9,
      });
    }
    if (property.id) {
      entries.push({
        url: `${base}/property-details/${property.id}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
