import type { CatalogSort, PublicCatalog } from "./types";

/** APARTMENT → Apartment, EVENT_CENTRE → Event centre. */
export function humaniseType(type: string): string {
  const words = type.toLowerCase().split("_");
  const head = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.length > 1 ? `${head} ${words.slice(1).join(" ")}` : head;
}

/**
 * The page URL for one change, keeping the other filters and always
 * returning to page 1 — a filter that kept `page=3` on a one-page result
 * showed an empty grid.
 */
export function catalogHref(
  handle: string,
  applied: PublicCatalog["filters_applied"],
  change: Partial<{
    city: string | null;
    type: string | null;
    sort: CatalogSort | null;
    page: number;
  }>
): string {
  const params = new URLSearchParams();
  const city = "city" in change ? change.city : applied.city;
  const type = "type" in change ? change.type : applied.property_type;
  const sort = "sort" in change ? change.sort : applied.sort;
  if (city) params.set("city", city);
  if (type) params.set("type", type);
  if (sort) params.set("sort", sort);
  if (change.page && change.page > 1) params.set("page", String(change.page));
  const qs = params.toString();
  return `/@${handle}${qs ? `?${qs}` : ""}`;
}
