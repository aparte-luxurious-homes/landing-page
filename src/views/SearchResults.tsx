'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from '@/lib/router';
import {
  Container,
  Typography,
  Box,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
} from '@mui/material';
import PageLayout from '../components/pagelayout';
import { ToastContainer } from 'react-toastify';
import { useSearchPropertiesQuery } from '../api/propertiesApi';
import { FilterList } from '@mui/icons-material';
import FilterContent from '../components/search/FilterContent';
import { SearchFilters, Pagination as PaginationType } from '../types/search';
import InterpretedChips from '../components/search/InterpretedChips';
import {
  canonicalSearchPath,
  filtersToSearchParams,
  searchParamsToState,
  stateToApiParams,
} from '../utils/searchParams';
import { ResultsGrid } from '~/components/search/ResultsGrid';
import MobileFilterDrawer from '~/components/search/MobileFilterDrawer';
import { Link } from '@/lib/router';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CustomPagination from '../components/CustomPagination';
import NoResultsFound from "../components/search/NoResultFound";
import Seo from '@/components/seo/Seo';

const SearchResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // The URL is the single source of truth for the *committed* search.
  // Deriving from it (rather than mirroring state into it) is what lets
  // RTK Query refetch automatically on any URL change — which in turn
  // removes the `setTimeout(() => handleSearch(), 0)` races this page used
  // to need to work around setState being asynchronous.
  const committed = useMemo(
    () => searchParamsToState(searchParams),
    [searchParams],
  );

  // The sidebar edits a draft; nothing is searched until "Apply".
  const [draft, setDraft] = useState<SearchFilters>(committed);
  useEffect(() => {
    setDraft(committed);
  }, [committed]);

  // One-release compatibility shim: in-app links created before the query-param
  // migration still navigate with router state. Convert once and replace, so a
  // user mid-journey across a deploy doesn't land on a blank page.
  // TODO: remove after one release.
  useEffect(() => {
    const legacy = (location.state || {}) as Record<string, any>;
    if (searchParams.toString() || !Object.keys(legacy).length) return;

    const migrated: SearchFilters = {
      q: legacy.searchTerm || legacy.q,
      locations: legacy.locations || (legacy.location ? [legacy.location] : []),
      startDate: legacy.startDate ? new Date(legacy.startDate) : null,
      endDate: legacy.endDate ? new Date(legacy.endDate) : null,
      propertyTypes:
        legacy.propertyTypes || (legacy.propertyType ? [legacy.propertyType] : []),
      guestCount: legacy.guestCount ?? 2,
    };
    navigate(`/search-results?${filtersToSearchParams(migrated)}`, { replace: true });
  }, [location.state, searchParams, navigate]);

  const apiParams = useMemo(() => stateToApiParams(committed), [committed]);

  const {
    data: propertiesResult,
    isFetching,
    error,
  } = useSearchPropertiesQuery(apiParams);

  const searchMeta = propertiesResult?.data?.search;

  const pagination: PaginationType = propertiesResult?.data?.data?.meta || {
    currentPage: 1,
    total: 0,
    perPage: 10,
    lastPage: 1
  };

  const properties = propertiesResult?.data?.data?.data || [];
  const totalProperties = propertiesResult?.data?.data?.meta?.total || 0;
  const searchAttempted = !isFetching && propertiesResult !== undefined;

  /** Commit the draft to the URL — a push, so Back returns to the prior search. */
  const commit = (next: SearchFilters, { replace = false } = {}) => {
    setSearchParams(filtersToSearchParams(next), { replace });
  };

  const handleGuestCount = (increment: boolean) => {
    setDraft(prev => ({
      ...prev,
      guestCount: increment ? prev.guestCount + 1 : Math.max(1, prev.guestCount - 1)
    }));
  };

  const handlePageChange = (_: unknown, page: number) => {
    commit({ ...committed, page });
  };

  const handleLocationChange = (locations: string[]) => {
    setDraft(prev => ({ ...prev, locations }));
  };

  const handleApplyFilters = () => {
    commit({ ...draft, page: 1 });
  };

  /**
   * Remove an interpreted constraint.
   *
   * Appends the kind to `drop` rather than rewriting `q` — the guest's own
   * phrasing stays intact in the URL (and stays shareable), and the backend
   * decides what dropping that constraint means.
   */
  const handleRemoveConstraint = (kind: string) => {
    const dropped = new Set(committed.drop ?? []);
    dropped.add(kind);
    commit({ ...committed, drop: Array.from(dropped), page: 1 });
  };

  const filters = draft;
  const locationArr = committed.locations ?? [];
  const locationLabel = locationArr.length ? locationArr.join(', ') : '';
  // Prefer a title built from what we *understood*, not the raw sentence —
  // "2-Bedroom Apartments in Lekki" beats echoing the guest's typing back.
  const interpreted = (searchMeta?.interpreted ?? {}) as Record<string, any>;
  const bedroomLabel = interpreted.bedroom_count
    ? `${interpreted.bedroom_count}-bedroom `
    : '';
  const typeLabel = interpreted.property_types?.length
    ? `${String(interpreted.property_types[0]).toLowerCase()}s`
    : 'apartments & homes';
  const heading = locationLabel
    ? `${bedroomLabel}${typeLabel} in ${locationLabel}`.replace(/^./, (c) => c.toUpperCase())
    : committed.q
    ? `Search results for “${committed.q}”`
    : 'Search apartments & homes';
  // Canonical drops `q`, `page`, `drop` and every relaxed constraint, so all
  // the ways of phrasing one search collapse onto a single indexable URL
  // instead of competing with each other.
  const relaxedParams = (searchMeta?.relaxed ?? []).map((r) => r.param);
  const searchCanonical = canonicalSearchPath(committed, relaxedParams);

  // Index only shallow, high-value combinations. Deep pages, empty result
  // sets and heavily-filtered permutations are crawl budget with no upside.
  const activeFilterCount = [
    locationArr.length, committed.propertyTypes?.length, committed.bedroomCount,
    committed.minPrice, committed.maxPrice, committed.amenities?.length,
    committed.startDate, committed.isPetAllowed, committed.isPartyAllowed,
  ].filter(Boolean).length;
  const shouldNoindex =
    (pagination.currentPage ?? 1) > 1 ||
    activeFilterCount > 3 ||
    (searchAttempted && totalProperties === 0);

  return (
    <PageLayout>
      <Seo
        title={heading}
        description={
          locationLabel
            ? `Browse verified luxury short-stay apartments and homes for rent in ${locationLabel}, Nigeria. Compare prices, amenities and availability, and book instantly on Aparte.`
            : 'Search verified luxury short-stay apartments and homes across Nigeria. Filter by location, dates, guests and price, and book instantly on Aparte.'
        }
        canonicalPath={searchCanonical}
        noindex={shouldNoindex}
      />
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 13 }}>
        <Box className="flex">
          {/* Sidebar Filter */}
          <Box className="hidden md:block w-1/4 px-4 pt-8" component="aside">
            <FilterContent
              filters={filters}
              setFilters={setDraft}
              handleSearch={handleApplyFilters}
              handleAddGuest={() => handleGuestCount(true)}
              handleRemoveGuest={() => handleGuestCount(false)}
              isFetching={isFetching}
              onLocationChange={handleLocationChange}
            />
          </Box>

          {/* Divider */}
          <Box
            className="hidden md:block w-px bg-gray-200 mx-4"
            sx={{ height: 'calc(100vh - 104px)' }}
          />

          {/* Results Section */}
          <Box className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8">
            {/* Breadcrumb and Results Count */}
            <Box className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
              <Box className="mb-4 md:mb-0">
                <Breadcrumbs
                  separator={<NavigateNextIcon fontSize="small" />}
                  sx={{
                    '.MuiBreadcrumbs-li': {
                      fontSize: { xs: '0.875rem', md: '1rem' }
                    }
                  }}
                >
                  <MuiLink component={Link} to="/" color="inherit">
                    Home
                  </MuiLink>
                  <Typography color="text.primary">Search Results</Typography>
                </Breadcrumbs>
              </Box>

              <Box className="flex items-center justify-between md:justify-end w-full md:w-auto">
                <Typography variant="h4" component="h1" sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  display: { xs: 'block', md: 'none' }
                }}>
                  {heading}
                </Typography>
                {!isFetching && searchAttempted && (
                  <Typography variant="body2" color="text.secondary" sx={{
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}>
                    {totalProperties} {totalProperties === 1 ? 'property' : 'properties'} found
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Desktop Title */}
            <Box className="hidden md:block mb-6">
              <Typography variant="h4" component="h1" sx={{ fontSize: '1.5rem' }}>
                {heading}
              </Typography>
            </Box>

            {/* Mobile Filter Button */}
            <Box className="md:hidden mb-4">
              <IconButton onClick={() => setIsDrawerOpen(true)}>
                <FilterList />
              </IconButton>
            </Box>

            {/* Error Display */}
            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                Error loading properties. Please try again.
              </Alert>
            )}

            {/* How the query was understood, as removable chips. Rendered
                above the results so a wrong interpretation is visible before
                the guest concludes we have no inventory. */}
            {searchMeta && !error && (
              <InterpretedChips
                applied={searchMeta.applied}
                relaxed={searchMeta.relaxed}
                message={searchMeta.message}
                query={committed.q}
                onRemove={handleRemoveConstraint}
              />
            )}

            {/* Results Grid or No Results */}
            {!isFetching && searchAttempted && properties.length === 0 && !error && (
              <NoResultsFound
                filters={committed}
                // The backend's message names exactly what it tried and
                // widened — more useful than the generic copy.
                message={searchMeta?.message}
                onClearFilters={() => {
                  // Keep `q` so the guest doesn't lose what they typed;
                  // clear the filters that narrowed it to nothing.
                  commit({
                    q: committed.q,
                    locations: [],
                    startDate: null,
                    endDate: null,
                    propertyTypes: [],
                    guestCount: 2,
                    page: 1,
                  });
                }}
                onSuggestLocation={(city) => {
                  commit({ ...committed, locations: [city], drop: [], page: 1 });
                }}
              />
            )}

            <ResultsGrid
              isFetching={isFetching}
              apartments={properties}
            />

            {/* Pagination */}
            {!isFetching && properties.length > 0 && totalProperties > pagination.perPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
                <CustomPagination
                  count={pagination.lastPage || Math.ceil(totalProperties / pagination.perPage)}
                  page={pagination.currentPage}
                  onChange={handlePageChange}
                  variant="outlined"
                  shape="rounded"
                  size="medium"
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Mobile Drawer */}
        <MobileFilterDrawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          filterProps={{
            filters,
            setFilters: setDraft,
            handleSearch: handleApplyFilters,
            handleAddGuest: () => handleGuestCount(true),
            handleRemoveGuest: () => handleGuestCount(false),
            isFetching,
            onLocationChange: handleLocationChange
          }}
        />

        <ToastContainer />
      </Container>
    </PageLayout>
  );
};

export default SearchResults;
