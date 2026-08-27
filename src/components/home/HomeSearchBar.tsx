'use client';

import { useEffect, useRef } from 'react';

import LargeSearchBar from '@/components/search/LargeSearchBar';
import MobileSearchBar from '@/components/search/mobile/MobileSearchBar';
import ExpandedSearchPanel from './ExpandedSearchPanel';
import { useHomeSearch } from './searchContext';

/** Desktop header height in px — the panel top, the spacer and this must agree. */
const HEADER_OFFSET_PX = 80;

/**
 * The search row that sits directly under the header on the homepage.
 *
 * The desktop/mobile split is CSS, not useMediaQuery: the old hero branched
 * on a media-query hook, which renders the mobile tree during SSR and swaps
 * it after hydration — a guaranteed layout shift and a hydration-mismatch
 * risk on the site's most-visited page.
 */
export default function HomeSearchBar() {
  const search = useHomeSearch();
  const setCollapsed = search?.setCollapsed;
  const setExpanded = search?.setExpanded;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !setCollapsed) return;
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isOut = !entry.isIntersecting;
        setCollapsed(isOut);
        // Back at the top the in-flow bar is the one to use, so a panel left
        // open from the pill would be a second bar stacked over the first.
        if (!isOut) setExpanded?.(false);
      },
      // Trip exactly as the bar slides behind the fixed header.
      { rootMargin: `-${HEADER_OFFSET_PX}px 0px 0px 0px` }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [setCollapsed, setExpanded]);

  return (
    <>
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8">
        <div className="hidden py-6 md:block">
          <LargeSearchBar analyticsSource="home_bar" />
        </div>
      </div>

      {/* Mobile keeps search pinned instead of collapsing — there is no room
          for a compact pill beside the logo on a 390px viewport. */}
      <div className="sticky top-16 z-30 border-b border-gray-100 bg-white px-4 py-3 md:hidden">
        <MobileSearchBar />
      </div>

      <div ref={sentinelRef} aria-hidden className="h-px w-full" />

      <ExpandedSearchPanel />
    </>
  );
}
