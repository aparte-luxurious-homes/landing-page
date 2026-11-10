'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';

import { useSearchPropertiesQuery } from '@/api/propertiesApi';
import { trackEvent } from '@/analytics';
import { useGeolocation } from '@/hooks/useGeolocation';
import { formatDistance } from '@/lib/geo/nearMe';
import { toCardProps } from '@/utils/propertyCard';
import { stateToApiParams } from '@/utils/searchParams';

const RAIL_SIZE = 8;

/**
 * "Stays near you", for guests who have already let Aparte see their
 * location.
 *
 * Renders nothing at all - not even reserved space - until the browser
 * reports the permission as granted, so the homepage looks and lays out
 * exactly as before for everyone else, and nobody is prompted by visiting
 * it. Client-only by nature: the position exists only in the browser, which
 * is also why this is the one homepage section that is not server-rendered.
 */
export default function NearYouRail() {
  const geo = useGeolocation({ auto: true });
  const coords = geo.permission === 'granted' ? geo.coords : null;

  const params = useMemo(
    () => (coords
      ? { ...stateToApiParams({ near: true, startDate: null, endDate: null, guestCount: 2 }, coords),
          limit: RAIL_SIZE }
      : null),
    [coords],
  );
  const { data, isFetching } = useSearchPropertiesQuery(params ?? {}, { skip: !params });

  const near = data?.data?.search?.near ?? null;
  const rows = data?.data?.data?.data ?? [];
  // An API that predates "near me" ignores the coordinates and answers for
  // the whole country; showing that under "near you" would be a lie.
  const usable = near && (near.status === 'applied' || near.status === 'widened' || near.status === 'state');

  const reported = useRef(false);
  useEffect(() => {
    if (usable && rows.length && !reported.current) {
      reported.current = true;
      trackEvent('near_rail_view', { results: rows.length, status: near?.status });
    }
  }, [usable, rows.length, near?.status]);

  if (geo.permission !== 'granted') return null;
  if (!data && (isFetching || geo.status === 'locating' || !coords)) {
    return <RailFrame title="Stays near you" skeleton />;
  }
  if (!usable || !rows.length) return null;

  const title = near.status === 'state' && near.state ? `Stays in ${near.state}` : 'Stays near you';
  const subtitle = near.status === 'state'
    ? 'Nothing is listed within 20 km of you yet'
    : near.place
      ? `Verified stays around ${near.place}`
      : `Verified stays ${near.label ? near.label.toLowerCase() : 'near you'}`;

  return (
    <RailFrame title={title} subtitle={subtitle}>
      {rows.map((row) => {
        const card = toCardProps(row);
        const distance = formatDistance(row?.relevance?.distance_m);
        return (
          <li key={row.id} className="shrink-0 snap-start">
            <Link
              href={card.propertylink}
              onClick={() => trackEvent('near_rail_click', { status: near.status })}
              className="block w-[15rem] overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
            >
              {/* Plain <img> for the same reason as DestinationsRail. */}
              <img
                src={card.images[0]}
                alt=""
                loading="lazy"
                className="h-32 w-full bg-gray-100 object-cover"
              />
              <span className="block p-3">
                <span className="block truncate text-sm font-semibold text-ink">{card.title}</span>
                <span className="block truncate text-xs text-gray-500">
                  {distance ?? card.location}
                </span>
                {card.minPrice > 0 && (
                  <span className="mt-1 block text-xs text-gray-700">
                    From ₦{card.minPrice.toLocaleString('en-NG')} / {card.rateUnit}
                  </span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </RailFrame>
  );
}

function RailFrame({
  title,
  subtitle,
  skeleton = false,
  children,
}: {
  title: string;
  subtitle?: string;
  skeleton?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      aria-busy={skeleton}
      className="mx-auto w-full max-w-screen-xl px-4 pt-6 sm:px-6 md:px-8"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink md:text-lg">{title}</h2>
          {/* Reserved even while loading, so the row does not jump when the
              subtitle arrives. */}
          <p className="h-4 truncate text-xs text-gray-500">{subtitle ?? ''}</p>
        </div>
        {!skeleton && (
          <Link href="/search-results?near=1" className="shrink-0 text-sm font-medium text-teal">
            See all
          </Link>
        )}
      </div>
      <ul className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
        {skeleton
          ? Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="shrink-0">
                <div className="w-[15rem] overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <div className="h-32 w-full animate-pulse bg-gray-100" />
                  <div className="space-y-2 p-3">
                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              </li>
            ))
          : children}
      </ul>
    </section>
  );
}
