'use client';

import { useCallback, useEffect } from 'react';

import LargeSearchBar from '@/components/search/LargeSearchBar';
import { useHomeSearch } from './searchContext';

/**
 * The full search bar, dropped under the header when the collapsed pill is
 * clicked.
 *
 * A second <LargeSearchBar> instance rather than a relocated one: both read
 * the same draft from context, so whatever the guest typed upstairs is
 * already here, while each keeps its own idea of which dropdown is open.
 *
 * Stacking: the panel sits at 1290 and its backdrop at 1280, both under the
 * MUI AppBar's 1300, so the header stays clickable above the scrim. MUI's
 * Autocomplete popper portals to <body> at a higher layer again, so the
 * location suggestions still render over everything.
 */
export default function ExpandedSearchPanel() {
  const search = useHomeSearch();
  const expanded = search?.expanded ?? false;
  const setExpanded = search?.setExpanded;
  const pillRef = search?.pillRef;

  /**
   * Focus has to be restored on the frame *after* the close, not in the same
   * tick: this panel unmounts as soon as `expanded` flips, and removing the
   * focused input inside it resets focus to <body>, undoing an earlier
   * .focus() call. Dismissing with Escape would otherwise drop a keyboard
   * user at the top of the document.
   *
   * When the close came from scrolling back to the top the pill has
   * unmounted too, so the ref is null and this is a no-op — which is right;
   * nothing should grab focus mid-scroll.
   */
  const closeAndRestoreFocus = useCallback(() => {
    setExpanded?.(false);
    requestAnimationFrame(() => pillRef?.current?.focus());
  }, [setExpanded, pillRef]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAndRestoreFocus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [expanded, closeAndRestoreFocus]);

  if (!expanded || !setExpanded) return null;

  return (
    <>
      <div
        aria-hidden
        onClick={closeAndRestoreFocus}
        className="fixed inset-x-0 bottom-0 top-20 z-[1280] hidden bg-black/30 md:block"
      />
      <div
        id="home-search-panel"
        className="fixed inset-x-0 top-20 z-[1290] hidden border-b border-gray-200 bg-white px-6 py-5 shadow-lg md:block"
      >
        <LargeSearchBar
          initialActive="Where"
          // On submit the page navigates away, so focus goes with it — no
          // restore, just close so the panel is gone if the guest comes back.
          onSubmitted={() => setExpanded(false)}
          analyticsSource="home_panel"
        />
      </div>
    </>
  );
}
