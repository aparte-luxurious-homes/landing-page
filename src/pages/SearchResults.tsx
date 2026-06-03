import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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
import { useLazyGetPropertiesQuery } from '../api/propertiesApi';
import { FilterList } from '@mui/icons-material';
import FilterContent from '../components/search/FilterContent';
import { SearchFilters, Pagination as PaginationType } from '../types/search';
import { ResultsGrid } from '~/components/search/ResultsGrid';
import MobileFilterDrawer from '~/components/search/MobileFilterDrawer';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CustomPagination from '../components/CustomPagination';
import NoResultsFound from "../components/search/NoResultFound";
import Seo from '@/components/seo/Seo';

const SearchResults: React.FC = () => {
  const [trigger, { data: propertiesResult, isFetching, error }] = useLazyGetPropertiesQuery();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Initialize filters from URL query params (crawlable & shareable), falling
  // back to navigation state for in-app links that still pass it.
  const parseInitialFilters = (): SearchFilters => {
    const sp = searchParams;
    const st = (location.state || {}) as any;
    const num = (v: string | null) =>
      v != null && v !== '' ? Number(v) : undefined;
    const csv = (v: string | null) =>
      v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined;
    return {
      locations:
        csv(sp.get('location')) ||
        st.locations ||
        (st.location ? [st.location] : []),
      startDate: sp.get('start_date')
        ? new Date(sp.get('start_date')!)
        : st.startDate
        ? new Date(st.startDate)
        : null,
      endDate: sp.get('end_date')
        ? new Date(sp.get('end_date')!)
        : st.endDate
        ? new Date(st.endDate)
        : null,
      propertyTypes:
        csv(sp.get('property_type')) ||
        st.propertyTypes ||
        (st.propertyType ? [st.propertyType] : []),
      guestCount: num(sp.get('guest_count')) ?? st.guestCount ?? 2,
      bedroomCount: num(sp.get('bedroom_count')) ?? st.bedroomCount,
      livingRoomCount: num(sp.get('living_room_count')) ?? st.livingRoomCount,
      minPrice: num(sp.get('min_price')) ?? st.minPrice,
      maxPrice: num(sp.get('max_price')) ?? st.maxPrice,
      amenities: csv(sp.get('amenities')) ?? st.amenities,
      isPetAllowed: sp.get('is_pet_allowed') === 'true' || st.isPetAllowed,
      isPartyAllowed: sp.get('is_party_allowed') === 'true' || st.isPartyAllowed,
      sortBy: sp.get('sort_by') || st.sortBy || 'price_asc',
      page: num(sp.get('page')) ?? st.page,
    };
  };

  const [filters, setFilters] = useState<SearchFilters>(parseInitialFilters);

  const handleSearch = async () => {
    setSearchAttempted(true);
    const apiFilters: Record<string, any> = {};

    if (filters.locations?.length) {
      // Unified location param — backend OR-matches across city/state/country/address
      apiFilters.location = filters.locations.join(',');
    }

    if (filters.startDate) {
      apiFilters.start_date = filters.startDate.toISOString().split('T')[0];
    }

    if (filters.endDate) {
      apiFilters.end_date = filters.endDate.toISOString().split('T')[0];
    }

    if (filters.propertyTypes?.length) {
      apiFilters.property_type = filters.propertyTypes.join(',');
    }

    if (filters.guestCount) {
      apiFilters.guest_count = filters.guestCount;
    }

    if (filters.bedroomCount) {
      apiFilters.bedroom_count = filters.bedroomCount;
    }

    if (filters.livingRoomCount) {
      apiFilters.living_room_count = filters.livingRoomCount;
    }

    if (filters.minPrice != null) {
      apiFilters.min_price = filters.minPrice;
    }

    if (filters.maxPrice != null) {
      apiFilters.max_price = filters.maxPrice;
    }

    if (filters.amenities?.length) {
      apiFilters.amenities_input = filters.amenities.join(',');
    }

    if (filters.isPetAllowed) {
      apiFilters.is_pet_allowed = true;
    }

    if (filters.isPartyAllowed) {
      apiFilters.is_party_allowed = true;
    }

    if (filters.sortBy) {
      apiFilters.sort_by = filters.sortBy;
    }

    if (filters.page) {
      apiFilters.page = filters.page;
    }

    try {
      await trigger(apiFilters).unwrap();
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // Initial search when component mounts
  useEffect(() => {
    handleSearch();
  }, []);

  // Mirror filters into the URL query string so search results are crawlable,
  // shareable and survive a refresh.
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.locations?.length) params.location = filters.locations.join(',');
    if (filters.startDate)
      params.start_date = filters.startDate.toISOString().split('T')[0];
    if (filters.endDate)
      params.end_date = filters.endDate.toISOString().split('T')[0];
    if (filters.propertyTypes?.length)
      params.property_type = filters.propertyTypes.join(',');
    if (filters.guestCount) params.guest_count = String(filters.guestCount);
    if (filters.bedroomCount) params.bedroom_count = String(filters.bedroomCount);
    if (filters.livingRoomCount)
      params.living_room_count = String(filters.livingRoomCount);
    if (filters.minPrice != null) params.min_price = String(filters.minPrice);
    if (filters.maxPrice != null) params.max_price = String(filters.maxPrice);
    if (filters.amenities?.length) params.amenities = filters.amenities.join(',');
    if (filters.isPetAllowed) params.is_pet_allowed = 'true';
    if (filters.isPartyAllowed) params.is_party_allowed = 'true';
    if (filters.sortBy) params.sort_by = filters.sortBy;
    if (filters.page) params.page = String(filters.page);
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const pagination: PaginationType = propertiesResult?.data?.data?.meta || {
    currentPage: 1,
    total: 0,
    perPage: 10,
    lastPage: 1
  };

  // Get properties array safely
  const properties = propertiesResult?.data?.data?.data || [];
  const totalProperties = propertiesResult?.data?.data?.meta?.total || 0;

  // Handlers
  const handleGuestCount = (increment: boolean) => {
    setFilters(prev => ({
      ...prev,
      guestCount: increment ? prev.guestCount + 1 : Math.max(1, prev.guestCount - 1)
    }));
  };

  const handlePageChange = (_: unknown, page: number) => {
    setFilters(prev => ({ ...prev, page }));
    // Trigger search when page changes
    setTimeout(() => handleSearch(), 0);
  };

  const handleLocationChange = (locations: string[]) => {
    setFilters(prev => ({ ...prev, locations }));
  };

  const handleApplyFilters = () => {
    // Reset to page 1 when applying new filters
    setFilters(prev => ({ ...prev, page: 1 }));
    handleSearch();
  };

  const locationArr = filters.locations ?? [];
  const locationLabel = locationArr.length ? locationArr.join(', ') : '';
  const heading = locationLabel
    ? `Apartments & homes in ${locationLabel}`
    : 'Search apartments & homes';
  const searchCanonical = locationArr.length
    ? `/search-results?location=${encodeURIComponent(locationArr.join(','))}`
    : '/search-results';

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
      />
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 13 }}>
        <Box className="flex">
          {/* Sidebar Filter */}
          <Box className="hidden md:block w-1/4 px-4 pt-8" component="aside">
            <FilterContent
              filters={filters}
              setFilters={setFilters}
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

            {/* Results Grid or No Results */}
            {!isFetching && searchAttempted && properties.length === 0 && !error && (
              <NoResultsFound
                filters={filters}
                onClearFilters={() => {
                  setFilters({
                    locations: [],
                    startDate: null,
                    endDate: null,
                    propertyTypes: [],
                    guestCount: 2,
                    bedroomCount: undefined,
                    livingRoomCount: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    amenities: [],
                    isPetAllowed: undefined,
                    isPartyAllowed: undefined,
                    sortBy: 'price_asc',
                    page: 1
                  });
                  setTimeout(() => handleSearch(), 0);
                }}
                onSuggestLocation={(city) => {
                  setFilters(prev => ({ ...prev, locations: [city], page: 1 }));
                  setTimeout(() => handleSearch(), 0);
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
            setFilters,
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
