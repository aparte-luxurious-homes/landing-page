'use client';

import { useMemo, useRef, useState } from 'react';

import {
  EMPTY_DRAFT,
  HomeSearchContext,
  type SearchDraft,
} from './searchContext';

/**
 * Homepage-only search state container.
 *
 * `collapsed` and `expanded` both start false so the server HTML and the
 * first client render agree; the IntersectionObserver that flips `collapsed`
 * runs in an effect inside HomeSearchBar, after hydration.
 *
 * `initialDraft` is the extension point for reusing this on /search-results,
 * where the draft would seed from the URL via searchParamsToState().
 */
export default function HomeSearchProvider({
  children,
  initialDraft,
}: {
  children: React.ReactNode;
  initialDraft?: Partial<SearchDraft>;
}) {
  const [draft, setDraft] = useState<SearchDraft>({
    ...EMPTY_DRAFT,
    ...initialDraft,
  });
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pillRef = useRef<HTMLButtonElement | null>(null);

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      collapsed,
      setCollapsed,
      expanded,
      setExpanded,
      pillRef,
    }),
    [draft, collapsed, expanded]
  );

  return (
    <HomeSearchContext.Provider value={value}>
      {children}
    </HomeSearchContext.Provider>
  );
}
