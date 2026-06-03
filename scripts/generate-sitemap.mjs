/**
 * Build-time sitemap generator.
 *
 * Emits public/sitemap.xml from three sources:
 *   1. Static public routes (home, search, about, help, legal).
 *   2. Help articles derived from src/content/guides.json.
 *   3. Live property pages fetched from the API (paginated).
 *
 * Runs before `vite build` (see package.json) so the file is copied into dist/.
 * Network/API failures degrade gracefully to a static-only sitemap — they never
 * fail the build.
 *
 * Env:
 *   VITE_SITE_URL       canonical origin (default https://aparte.ng)
 *   VITE_API_BASE_URL   API origin; normalised to .../api/v1
 */
import { writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = (process.env.VITE_SITE_URL || "https://aparte.ng").replace(
  /\/+$/,
  "",
);
const TODAY = new Date().toISOString().split("T")[0];
const MAX_PAGES = 100; // runaway guard

const normalizeApiUrl = (url) => {
  if (!url) return "";
  const n = url.replace(/\/+$/, "");
  if (n.endsWith("/api/v1")) return n;
  if (n.endsWith("/api")) return `${n}/v1`;
  return `${n}/api/v1`;
};
const API = normalizeApiUrl(process.env.VITE_API_BASE_URL);

const STATIC_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/search-results", priority: "0.9", changefreq: "daily" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/help", priority: "0.6", changefreq: "weekly" },
  { path: "/help/faq", priority: "0.6", changefreq: "weekly" },
  { path: "/help/owners", priority: "0.5", changefreq: "monthly" },
  { path: "/help/agents", priority: "0.5", changefreq: "monthly" },
  { path: "/help/guests", priority: "0.5", changefreq: "monthly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/cancellation-policy", priority: "0.3", changefreq: "yearly" },
];

async function helpArticleRoutes() {
  try {
    const raw = await readFile(resolve(ROOT, "src/content/guides.json"), "utf8");
    const guides = JSON.parse(raw).guides || [];
    return guides.map((g) => ({
      path: `/help/${g.audience}s/${g.id.replace(/^[a-z]+-\d+-/, "")}`,
      priority: "0.5",
      changefreq: "monthly",
    }));
  } catch (e) {
    console.warn("[sitemap] could not read guides.json:", e.message);
    return [];
  }
}

async function propertyRoutes() {
  if (!API) {
    console.warn("[sitemap] VITE_API_BASE_URL not set — skipping property URLs.");
    return [];
  }
  const routes = [];
  try {
    let page = 1;
    let lastPage = 1;
    do {
      const res = await fetch(`${API}/properties?page=${page}&per_page=100`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const block = json?.data?.data || {};
      const items = Array.isArray(block.data) ? block.data : [];
      lastPage = Number(block?.meta?.lastPage) || 1;
      for (const p of items) {
        if (!p?.id) continue;
        routes.push({
          path: `/property-details/${p.id}`,
          priority: "0.8",
          changefreq: "weekly",
          lastmod: String(p.updatedAt || p.createdAt || "").slice(0, 10) || TODAY,
        });
      }
      page += 1;
    } while (page <= lastPage && page <= MAX_PAGES);
    console.log(`[sitemap] ${routes.length} property URLs from API.`);
  } catch (e) {
    console.warn("[sitemap] property fetch failed — static-only:", e.message);
  }
  return routes;
}

const urlXml = ({ path, priority, changefreq, lastmod }) =>
  [
    "  <url>",
    `    <loc>${(SITE_URL + path).replace(/&/g, "&amp;")}</loc>`,
    `    <lastmod>${lastmod || TODAY}</lastmod>`,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : "",
    priority ? `    <priority>${priority}</priority>` : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");

async function main() {
  const [help, props] = await Promise.all([
    helpArticleRoutes(),
    propertyRoutes(),
  ]);
  const all = [...STATIC_ROUTES, ...help, ...props];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...all.map(urlXml),
    "</urlset>",
    "",
  ].join("\n");
  await writeFile(resolve(ROOT, "public/sitemap.xml"), xml, "utf8");
  console.log(`[sitemap] wrote ${all.length} URLs -> public/sitemap.xml`);
}

main().catch((e) => {
  // Never fail the build because of the sitemap.
  console.error("[sitemap] generation error:", e);
  process.exit(0);
});
