import Link from "next/link";

import { catalogHref, humaniseType } from "@/lib/links/catalogUrl";
import type { CatalogSort, PublicCatalog } from "@/lib/links/types";

interface FilterBarProps {
  handle: string;
  catalog: PublicCatalog;
}

const SORTS: { value: CatalogSort | null; label: string }[] = [
  { value: null, label: "Newest" },
  { value: "PRICE_ASC", label: "Lowest price" },
  { value: "PRICE_DESC", label: "Highest price" },
  { value: "RATING", label: "Top rated" },
];

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`inline-flex h-10 shrink-0 snap-start items-center whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
        active
          ? "bg-teal text-white"
          : "border border-neutral-300 text-ink hover:border-teal hover:text-teal"
      }`}
    >
      {children}
    </Link>
  );
}

/** One horizontally scrolling row per facet, phones first: the rows bleed to
 * the screen edge so the last chip peeks and invites the swipe. Server-
 * rendered links, so a filter is a navigation and the grid stays in the
 * HTML — no client state, nothing to hydrate. */
export default function FilterBar({ handle, catalog }: FilterBarProps) {
  const applied = catalog.filters_applied;
  const rows: React.ReactNode[] = [];

  if (catalog.cities.length >= 2) {
    rows.push(
      <div key="city" className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <Chip href={catalogHref(handle, applied, { city: null })} active={!applied.city}>
          All places
        </Chip>
        {catalog.cities.map((c) => (
          <Chip
            key={c.name}
            href={catalogHref(handle, applied, { city: c.name })}
            active={applied.city?.toLowerCase() === c.name.toLowerCase()}
          >
            {c.name} ({c.count})
          </Chip>
        ))}
      </div>
    );
  }

  if (catalog.property_types.length >= 2) {
    rows.push(
      <div key="type" className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <Chip href={catalogHref(handle, applied, { type: null })} active={!applied.property_type}>
          Any type
        </Chip>
        {catalog.property_types.map((t) => (
          <Chip
            key={t.type}
            href={catalogHref(handle, applied, { type: t.type })}
            active={applied.property_type === t.type}
          >
            {humaniseType(t.type)} ({t.count})
          </Chip>
        ))}
      </div>
    );
  }

  if (catalog.stats.properties_listed > 1) {
    rows.push(
      <div key="sort" className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <span className="flex h-10 shrink-0 items-center pr-1 text-sm text-neutral-500">Sort</span>
        {SORTS.map((s) => (
          <Chip
            key={s.label}
            href={catalogHref(handle, applied, { sort: s.value })}
            active={(applied.sort ?? null) === s.value}
          >
            {s.label}
          </Chip>
        ))}
      </div>
    );
  }

  if (!rows.length) return null;
  return <div className="mt-4 space-y-2">{rows}</div>;
}
