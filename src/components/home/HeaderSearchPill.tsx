'use client';

import { format } from 'date-fns';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { propertyTypeLabel } from '@/lib/propertyTypes';
import { useHomeSearch } from './searchContext';

/**
 * The compact search shown in the header once the full bar scrolls away.
 *
 * Rendered unconditionally by <Header>, which is shared by every route, so it
 * has to no-op cleanly: no provider (any page but the homepage) or not yet
 * collapsed means it renders nothing at all and the header is unchanged.
 *
 * Desktop only. On mobile the search pill in the flow is sticky, so there is
 * nothing to collapse into.
 */
export default function HeaderSearchPill() {
  const search = useHomeSearch();
  if (!search || !search.collapsed) return null;

  const { draft, expanded, setExpanded, pillRef } = search;

  const dateLabel =
    draft.checkIn && draft.checkOut
      ? `${format(draft.checkIn, 'd MMM')} – ${format(draft.checkOut, 'd MMM')}`
      : draft.checkIn
        ? format(draft.checkIn, 'd MMM')
        : 'Any dates';

  const whoLabel = draft.propertyType
    ? propertyTypeLabel(draft.propertyType)
    : `${draft.guests} guest${draft.guests === 1 ? '' : 's'}`;

  return (
    <button
      ref={pillRef}
      type="button"
      onClick={() => setExpanded((prev) => !prev)}
      aria-expanded={expanded}
      aria-controls="home-search-panel"
      className="hidden items-center gap-3 rounded-full border border-gray-200 bg-white py-1.5 pl-5 pr-1.5 shadow-sm transition-shadow hover:shadow-md md:flex"
    >
      <span className="max-w-[10rem] truncate text-sm font-semibold text-ink">
        {draft.location || 'Where to?'}
      </span>
      <span aria-hidden className="h-5 w-px bg-gray-200" />
      <span className="whitespace-nowrap text-sm text-gray-500">
        {dateLabel}
      </span>
      <span aria-hidden className="h-5 w-px bg-gray-200" />
      <span className="whitespace-nowrap text-sm text-gray-500">
        {whoLabel}
      </span>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-teal text-white">
        <SearchRoundedIcon sx={{ fontSize: 18 }} />
      </span>
    </button>
  );
}
