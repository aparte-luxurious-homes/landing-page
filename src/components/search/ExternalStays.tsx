'use client';

import React, { useEffect } from 'react';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Link } from '@/lib/router';
import {
  useGetExternalStaysQuery,
  useLazyGetExternalStaysQuery,
} from '../../api/propertiesApi';
import { trackEvent } from '@/analytics';

interface ExternalStaysProps {
  /** The committed search, passed through so the API re-derives the place. */
  q?: string;
  location?: string;
  propertyType?: string;
}

/**
 * Google Maps for a place Aparte has nothing in.
 *
 * Rendered only when the search API reported the guest's place as unserved
 * (relaxed location "Anywhere"), and below our own closest matches, so Aparte
 * stock is always seen first.
 *
 * Built to cost nothing by default. The first request asks only for the free
 * Google Maps link (no Places API call). The billable, capped list is fetched
 * only when the guest taps "Show them here" - a guest who glances and moves on
 * costs zero. If the list can't be offered (no key, cap spent) the link still
 * works. The API decides all of it, and answers `enabled: false` - nothing
 * renders - when the flag is off or we do serve the place.
 *
 * Google's terms for listed Places results shown without a map: attribute them
 * to Google Maps and link each to its Google Maps page. Nothing is stored.
 */
const ExternalStays: React.FC<ExternalStaysProps> = ({ q, location, propertyType }) => {
  const params = {
    q: q || location || '',
    location: location || undefined,
    property_type: propertyType || undefined,
  };
  const { data } = useGetExternalStaysQuery(params);
  const [loadList, listState] = useLazyGetExternalStaysQuery();

  const block = data?.data;
  const listed = listState.data?.data;
  const results = listed?.results ?? [];
  // The phrase the link searches for, without the ", Nigeria" the API adds
  // for Google's benefit: "hotels in Ibadan".
  const searchPhrase = (block?.query || `stays in ${block?.place ?? ''}`).replace(/, Nigeria$/, '');

  useEffect(() => {
    if (block?.enabled) trackEvent('external_stays_shown', { list_available: block.list_available });
  }, [block?.enabled, block?.list_available]);

  if (!block?.enabled || !block.maps_search_url) return null;

  // The list's own response can withdraw it (cap reached in the meantime);
  // fall back to whatever the first response said.
  const canList = listed ? listed.list_available && results.length > 0 : block.list_available;
  const listTried = Boolean(listed) || listState.isFetching;

  return (
    <section
      aria-labelledby="external-stays-heading"
      className="mt-10 rounded-2xl border border-gray-200 p-4 md:p-6"
    >
      <h2 id="external-stays-heading" className="text-lg font-semibold text-ink">
        Looking for {block.place} specifically?
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        We don&apos;t have stays there yet. Google Maps lists places that
        aren&apos;t on Aparte, so they can&apos;t be booked here.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={block.maps_search_url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={() => trackEvent('external_maps_link_click', {})}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50"
        >
          See {searchPhrase} on Google Maps
          <OpenInNewRoundedIcon sx={{ fontSize: 16 }} aria-hidden />
        </a>
        {canList && !listTried && (
          <button
            type="button"
            onClick={() => {
              trackEvent('external_list_requested', {});
              loadList({ ...params, list: true }, true);
            }}
            className="text-sm font-medium text-teal underline"
          >
            Show them here
          </button>
        )}
        {listState.isFetching && (
          <span className="text-sm text-gray-500" role="status">Loading…</span>
        )}
      </div>

      {results.length > 0 && (
        <>
          <ul className="mt-4 divide-y divide-gray-100">
            {results.map((stay, index) => (
              <li key={stay.place_id || stay.maps_url} className="py-3">
                <a
                  href={stay.maps_url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  onClick={() => trackEvent('external_stay_click', { position: index })}
                  className="group flex items-start justify-between gap-3"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink group-hover:underline">
                      {stay.name}
                    </span>
                    <span className="block truncate text-sm text-gray-500">
                      {[stay.type, stay.address].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <OpenInNewRoundedIcon
                    sx={{ fontSize: 16, flexShrink: 0, color: '#6b7280' }}
                    aria-label="Opens Google Maps"
                  />
                </a>
              </li>
            ))}
          </ul>
          {/* Required attribution for Places results shown without a map. */}
          <p className="mt-1 text-right text-xs text-gray-500" translate="no">
            Results from {listed?.attribution || 'Google Maps'}
          </p>
        </>
      )}

      <p className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-600">
        Know a host in {block.place}?{' '}
        <Link
          to="/list"
          onClick={() => trackEvent('external_stays_invite_click', {})}
          className="font-medium text-teal underline"
        >
          Invite them to list on Aparte
        </Link>
      </p>
    </section>
  );
};

export default ExternalStays;
