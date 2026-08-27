'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { ArrowForward, Apartment as ApartmentIcon } from '@mui/icons-material';
import { Link, useNavigate } from '@/lib/router';
import ApartmentCard from '../components/apartment/ApartmentCard';
import PropertyCardSkeleton from '../components/skeletons/PropertyCardSkeleton';
import CategoryRow from '../components/home/CategoryRow';
import { useGetPropertiesQuery } from '../api/propertiesApi';
import { toCardProps } from '../utils/propertyCard';
import { DEFAULT_GUESTS, filtersToSearchParams } from '../utils/searchParams';
import { propertyTypeLabel } from '@/lib/propertyTypes';
import { trackPropertySearched } from '../lib/mixpanel/track';

/** One row of four on desktop, doubled — the same 8 at every breakpoint. */
const PAGE_SIZE = 8;

/** Matches app/page.tsx's server fetch exactly. See the note below. */
const CLIENT_QUERY_LIMIT = 12;

export default function Apartments({
  initialProperties = [],
}: {
  initialProperties?: any[];
}) {
  const navigate = useNavigate();
  const [visibleItems, setVisibleItems] = useState(PAGE_SIZE);
  const [selectedType, setSelectedType] = useState('');

  /*
   * The client query used to be `limit: 50` with no `is_verified`, while the
   * server seeded 12 verified rows — so the page rendered verified listings,
   * then silently swapped in unverified ones a moment after hydration.
   * Matching the server's filters, and skipping the request entirely while
   * the seed is valid, means the visible set never changes under the guest.
   */
  const seedIsValid = !selectedType && initialProperties.length > 0;
  const { data, isLoading, isFetching } = useGetPropertiesQuery(
    {
      limit: CLIENT_QUERY_LIMIT,
      is_verified: true,
      property_type: selectedType || undefined,
    },
    { skip: seedIsValid }
  );

  const fetched: any[] | undefined = data?.data?.data?.data;
  const [rows, setRows] = useState<any[]>(initialProperties);

  useEffect(() => {
    // Back on "All" the server-rendered set is authoritative and already in
    // hand, so it wins without a round trip.
    if (!selectedType && initialProperties.length) {
      setRows(initialProperties);
      return;
    }
    // Otherwise adopt each result as it lands — and only then. Leaving the
    // previous rows up during a fetch is what keeps the grid from blanking
    // every time a category is tapped.
    if (fetched) setRows(fetched);
  }, [selectedType, fetched, initialProperties]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setVisibleItems(PAGE_SIZE);
  };

  // One object feeds both the URL and the Mixpanel event, so the reported
  // search can never drift from the one actually performed.
  const searchFilters = useMemo(
    () => ({
      startDate: null,
      endDate: null,
      guestCount: DEFAULT_GUESTS,
      propertyTypes: selectedType ? [selectedType] : [],
      locations: [],
    }),
    [selectedType]
  );

  const searchHref = useMemo(() => {
    const qs = filtersToSearchParams(searchFilters).toString();
    return qs ? `/search-results?${qs}` : '/search-results';
  }, [searchFilters]);

  const goToSearch = () => {
    trackPropertySearched(searchFilters);
    navigate(searchHref);
  };

  const heading = selectedType
    ? `${propertyTypeLabel(selectedType)}s in Nigeria`
    : 'Verified short-lets in Nigeria';

  const showSkeleton = rows.length === 0 && (isLoading || isFetching);

  return (
    <section className="mx-auto w-full max-w-screen-xl px-4 pb-4 pt-6 sm:px-6 md:px-8">
      {/*
        The page's one H1, kept out of the visual design at the product
        owner's call: the grid reads better with no heading above it, and the
        active category tab already says what is being shown. It still has to
        exist and still has to carry the keywords — this is the site's
        most-linked URL, and shipping it with no H1 (or with a decorative one)
        would cost it in both search and screen readers.
      */}
      <h1 className="sr-only">{heading}</h1>

      <CategoryRow value={selectedType} onChange={handleTypeChange} />

      <div className="mt-8">
        {showSkeleton ? (
          <PropertyCardSkeleton count={8} columns={{ xs: 12, sm: 6, md: 3 }} />
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <ApartmentIcon
              sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.5, mb: 1 }}
            />
            <p className="text-gray-500">
              No{' '}
              {selectedType ? propertyTypeLabel(selectedType).toLowerCase() : ''}{' '}
              listings here yet.{' '}
              <Link
                to={searchHref}
                className="font-semibold text-teal hover:underline"
              >
                Search everything
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-1 gap-x-6 gap-y-8 transition-opacity sm:grid-cols-2 lg:grid-cols-4 ${
                isFetching ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              {rows.slice(0, visibleItems).map((property, index) => (
                <ApartmentCard
                  key={property?.id || index}
                  {...toCardProps(property)}
                />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              {visibleItems < rows.length ? (
                <button
                  type="button"
                  onClick={() => setVisibleItems((n) => n + PAGE_SIZE)}
                  className="rounded-lg border border-teal px-6 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-teal-soft"
                >
                  Show more
                </button>
              ) : (
                <button
                  type="button"
                  // Query params, not router state: the old call passed
                  // `{ state: { propertyTypes } }` through the sessionStorage
                  // shim, so the landing URL carried no filter and was
                  // neither shareable nor reloadable.
                  onClick={goToSearch}
                  className="flex items-center gap-2 rounded-lg border border-teal px-6 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-teal-soft"
                >
                  See all on search
                  <ArrowForward sx={{ fontSize: 18 }} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
