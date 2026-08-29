'use client';

/**
 * Shared state for the homepage search.
 *
 * Two search bars exist on the page at once — the one in the flow under the
 * header, and the one inside the panel that the collapsed header pill opens —
 * and a guest who types a destination, scrolls, then reopens from the pill
 * must find their text still there. So the *draft* lives here rather than in
 * either bar, and both bars read and write it.
 *
 * Context and provider are split across two modules on purpose: the bars need
 * the context, the provider renders the panel that renders a bar, and a single
 * module would close that import cycle.
 *
 * Off the homepage there is no provider, `useHomeSearch()` returns null, and
 * every consumer falls back to its own local state — which is what the search
 * bar did everywhere before this existed.
 */

import { createContext, useContext, useState } from 'react';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

import { DEFAULT_GUESTS } from '@/utils/searchParams';

export interface SearchDraft {
  /** Free text. Submitted as `q` — the natural-language query. */
  location: string;
  /**
   * Set only when the guest picks a known city/state from the suggestions,
   * and cleared as soon as they edit the text away from it.
   *
   * Only a picked option becomes a hard `location` filter. Copying free text
   * there is what made "2 bedroom in Lekki" return nothing: the whole
   * sentence was matched against city/state/address as a literal string.
   * Lives in the shared draft rather than the bar so it survives the trip
   * through the header pill like every other field.
   */
  pickedLocation: string | null;
  checkIn: Date | null;
  checkOut: Date | null;
  /** A PROPERTY_TYPES value (API enum), never a label. */
  propertyType: string;
  guests: number;
}

/**
 * Dates start null, not `new Date()`.
 *
 * A default of "today" renders different text on the server and the client
 * whenever a prerendered page is served across a date boundary, and it also
 * put `start_date`/`end_date` on every search URL whether or not the guest
 * picked dates — narrowing results silently.
 */
export const EMPTY_DRAFT: SearchDraft = {
  location: '',
  pickedLocation: null,
  checkIn: null,
  checkOut: null,
  propertyType: '',
  guests: DEFAULT_GUESTS,
};

export interface HomeSearchContextValue {
  draft: SearchDraft;
  setDraft: Dispatch<SetStateAction<SearchDraft>>;
  /** True once the in-flow bar has scrolled up behind the header. */
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  /** True while the pill's drop-down panel is open. */
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
  /** Focus returns here when the panel closes. */
  pillRef: MutableRefObject<HTMLButtonElement | null>;
}

export const HomeSearchContext = createContext<HomeSearchContextValue | null>(
  null
);

/** Null anywhere outside the homepage provider — callers must handle that. */
export const useHomeSearch = (): HomeSearchContextValue | null =>
  useContext(HomeSearchContext);

/**
 * The draft a search bar should edit: the shared one on the homepage, its own
 * otherwise. Both hooks run unconditionally — only which pair is returned
 * varies, and that is stable for the lifetime of a mount because a component
 * never moves in or out of the provider.
 */
export function useSearchDraft(): [
  SearchDraft,
  Dispatch<SetStateAction<SearchDraft>>,
] {
  const shared = useHomeSearch();
  const local = useState<SearchDraft>(EMPTY_DRAFT);
  return shared ? [shared.draft, shared.setDraft] : local;
}
