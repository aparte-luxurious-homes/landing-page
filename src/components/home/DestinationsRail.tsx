import Link from 'next/link';

import type { DestinationTile } from '@/lib/home/fetchDestinations';

/**
 * Popular destinations, directly under the search.
 *
 * Stays a server component with real <a> elements: these links are the only
 * crawlable path from the homepage into the /shortlets city pages, which are
 * the indexable targets for "shortlet in {city}" queries. A click handler
 * that pushed a route would take that path away.
 *
 * Photos come from actual verified listings in each city (see
 * lib/home/fetchDestinations) — never stock imagery.
 */
export default function DestinationsRail({
  tiles,
}: {
  tiles: DestinationTile[];
}) {
  if (!tiles.length) return null;

  return (
    <section
      aria-label="Popular destinations"
      className="mx-auto w-full max-w-screen-xl px-4 pt-4 sm:px-6 md:px-8 md:pt-2"
    >
      <h2 className="text-base font-semibold text-ink md:text-lg">
        Popular destinations
      </h2>

      {/* Bleeds to the viewport edge on mobile so the last tile is visibly
          cut off — the affordance that says the row scrolls. */}
      <ul className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
        {tiles.map((tile) => (
          <li key={tile.slug} className="shrink-0 snap-start">
            <Link
              href={`/shortlets/${tile.slug}`}
              className="flex w-[13rem] items-center gap-3 rounded-2xl border border-gray-200 bg-white p-2 transition-shadow hover:shadow-md"
            >
              {tile.imageUrl ? (
                /* Plain <img>, not next/image: listing media hosts vary and
                   an unconfigured host throws at runtime. Same call as
                   app/shortlets/[city]/page.tsx. */
                <img
                  src={tile.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-xl bg-gray-100 object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-teal-soft text-lg font-semibold text-teal"
                >
                  {tile.name.charAt(0)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">
                  {tile.name}
                </span>
                <span className="block text-xs text-gray-500">
                  {tile.count > 0
                    ? `${tile.count} verified ${tile.count === 1 ? 'stay' : 'stays'}`
                    : 'New listings soon'}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
