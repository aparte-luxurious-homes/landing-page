'use client';

import React, { useEffect } from 'react';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Link } from '@/lib/router';
import { useGetExternalStaysQuery } from '../../api/propertiesApi';
import { trackEvent } from '@/analytics';

interface ExternalStaysProps {
  /** The committed search, passed through so the API re-derives the place. */
  q?: string;
  location?: string;
  propertyType?: string;
}

/**
 * Stays on Google Maps in a place Aparte has nothing in.
 *
 * Rendered only when the search API reported the guest's place as unserved
 * (relaxed location "Anywhere"), and below our own closest matches, so Aparte
 * stock is always seen first. The API decides everything else - feature
 * flag, whether we actually have stock there, the daily cap - and answers
 * `enabled: false` when it declines, in which case this renders nothing.
 *
 * Google's terms for showing Places results without a map: attribute them to
 * Google Maps, and send each result to its Google Maps page. Nothing here is
 * stored or cached beyond RTK Query's in-memory cache for the session.
 */
const ExternalStays: React.FC<ExternalStaysProps> = ({ q, location, propertyType }) => {
  const { data } = useGetExternalStaysQuery({
    q: q || location || '',
    location: location || undefined,
    property_type: propertyType || undefined,
  });
  const block = data?.data;
  const results = block?.enabled ? block.results : [];

  useEffect(() => {
    if (results.length) {
      trackEvent('external_stays_shown', { count: results.length });
    }
  }, [results.length]);

  if (!block?.enabled || results.length === 0) return null;

  return (
    <section
      aria-labelledby="external-stays-heading"
      className="mt-10 rounded-2xl border border-gray-200 p-4 md:p-6"
    >
      <h2 id="external-stays-heading" className="text-lg font-semibold text-ink">
        Elsewhere in {block.place}
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        These aren&apos;t on Aparte yet, so they can&apos;t be booked here. Each one
        opens on Google Maps.
      </p>

      <ul className="mt-4 divide-y divide-gray-100">
        {results.map((stay) => (
          <li key={stay.place_id || stay.maps_url} className="py-3">
            <a
              href={stay.maps_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              onClick={() => trackEvent('external_stay_click', { position: results.indexOf(stay) })}
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
              <span className="flex shrink-0 items-center gap-2 text-sm text-gray-600">
                {stay.rating != null && (
                  <span className="flex items-center">
                    <StarRoundedIcon sx={{ fontSize: 16, color: '#028090' }} aria-hidden />
                    {stay.rating.toFixed(1)}
                    {stay.rating_count ? (
                      <span className="ml-1 text-gray-400">
                        ({stay.rating_count.toLocaleString('en-NG')})
                      </span>
                    ) : null}
                  </span>
                )}
                <OpenInNewRoundedIcon sx={{ fontSize: 16 }} aria-label="Opens Google Maps" />
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-sm">
        <span className="text-gray-600">
          Know one of these owners?{' '}
          <Link
            to="/list"
            onClick={() => trackEvent('external_stays_invite_click', {})}
            className="font-medium text-teal underline"
          >
            Invite them to list on Aparte
          </Link>
        </span>
        {/* Required attribution for Places results shown without a map. */}
        <span className="text-xs text-gray-500" translate="no">
          Results from {block.attribution || 'Google Maps'}
        </span>
      </div>
    </section>
  );
};

export default ExternalStays;
