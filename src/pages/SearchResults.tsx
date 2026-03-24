import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const SearchResults: React.FC = () => {
  const [trigger, { data: propertiesResult, isFetching, error }] = useLazyGetPropertiesQuery();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);

  // Initialize filters from location state or default values
  const initialFilters: SearchFilters = {
    locations: location.state?.locations || (location.state?.location ? [location.state.location] : []),
    startDate: location.state?.startDate ? new Date(location.state.startDate) : null,
    endDate: location.state?.endDate ? new Date(location.state.endDate) : null,
    propertyTypes: location.state?.propertyTypes || (location.state?.propertyType ? [location.state.propertyType] : []),
    guestCount: location.state?.guestCount || 2,
    bedroomCount: location.state?.bedroomCount,
    livingRoomCount: location.state?.livingRoomCount,
    sortBy: location.state?.sortBy || 'price_asc',
  };

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const handleSearch = async () => {
    setSearchAttempted(true);
    const apiFilters: Record<string, any> = {};

    if (filters.locations?.length) {
      // Use first location for API filter (as defined in Swagger for state/city)
      apiFilters.state = filters.locations[0];
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

  // Update URL state when filters change (but don't trigger search automatically)
  useEffect(() => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );

    navigate('.', {
      state: cleanedFilters,
      replace: true
    });
  }, [filters, navigate]);

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

  return (
    <PageLayout>
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
                <Typography variant="h4" sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  display: { xs: 'block', md: 'none' }
                }}>
                  Search Results
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
              <Typography variant="h4" sx={{ fontSize: '1.5rem' }}>
                Search Results
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
                    sortBy: 'price_asc',
                    page: 1
                  });
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
