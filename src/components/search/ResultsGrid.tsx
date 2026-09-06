/* eslint-disable @typescript-eslint/no-explicit-any */
import ApartmentCard from "../apartment/ApartmentCard";
import { toCardProps } from "../../utils/propertyCard";

interface ResultsGridProps {
  isFetching: boolean;
  apartments: any[];
}

/**
 * Results layout for the search page.
 *
 * Tailwind grid, not MUI `Grid`. This was the only card grid on the site
 * still using MUI — the homepage (`sections/Apartments.tsx`) and `/shortlets`
 * both use exactly this shape — and being the odd one out is what produced
 * the mismatch: `spacing={3}` renders as `width: calc(100% + 24px)` with a
 * `-24px` margin, so the grid had to be visually corrected by padding
 * elsewhere rather than simply filling its column.
 *
 * Two cards per row on phones, where it used to be one. A 1-up phone grid
 * gave a ~295px-tall card and a 4,765px page for ten results, so comparing
 * two listings meant scrolling between them. Browsing (the homepage) and
 * comparing (here) are different jobs, which is why this page is denser than
 * the homepage rather than matching it.
 *
 * Breakpoints above phone are unchanged on purpose — `sm:` 2-up and `md:` 3-up
 * are what `sm={6}`/`md={4}` already produced, and `tailwind.config.js`
 * overrides Tailwind's screens to MUI's values (sm 600 / md 900), so these
 * fire at exactly the same widths as before. Only the phone case moves.
 */
/*
 * One card per row on phones.
 *
 * A 2-up phone grid was tried and reverted. It halved the scroll, but a
 * ~163px column is narrower than the card was built for — the card's own
 * comment cites ~280px as the design target — and it kept producing
 * horizontal overflow on real devices even after the price span was given
 * `min-w-0`/`truncate`. Chromium measured those columns as fitting; an
 * iPhone 13 did not, and the device is the authority.
 *
 * `sm:` and `md:` are unchanged, so 2-up at 600px and 3-up at 900px are
 * exactly what they have always been. Only the phone case reverts.
 */
const GRID_CLASSES =
  "grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 md:grid-cols-3";

export const ResultsGrid: React.FC<ResultsGridProps> = ({ isFetching, apartments }) => {
  if (isFetching) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            {/* Same 4/3 box the real card uses, so results do not jump when
                they land. The shared PropertyCardSkeleton is a fixed 200px
                tall, which is right for the homepage's wide cards and far too
                tall for a 164px one. */}
            <div className="aspect-[4/3] w-full rounded-xl bg-gray-200" />
            <div className="mt-3 h-4 w-4/5 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-3/5 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={GRID_CLASSES}>
      {apartments.map((apartment, index) => (
        <div key={apartment.id || index}>
          {/* Shared prop builder — the card fixes (aspect box, image
              fallback, verified badge) land here without touching this
              page's layout. */}
          <ApartmentCard {...toCardProps(apartment)} />
        </div>
      ))}
    </div>
  );
};
