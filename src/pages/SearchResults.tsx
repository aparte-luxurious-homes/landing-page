import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  IconButton,
  Breadcrumbs,
  Link as MuiLink,
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

const SearchResults: React.FC = () => {
  const [trigger, { data: propertiesResult, isFetching }] = useLazyGetPropertiesQuery();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Add console log for debugging
  console.log('Component rendered, propertiesResult:', propertiesResult);

  const initialFilters: SearchFilters = {
    state: location.state?.location ? [location.state.location] : [],
    startDate: location.state?.startDate ? new Date(location.state.startDate) : null,
    endDate: location.state?.endDate ? new Date(location.state.endDate) : null,
    propertyType: location.state?.propertyTypes || (location.state?.propertyType ? [location.state.propertyType] : []),
    guestCount: location.state?.guestCount || 2,
    bedroomCount: location.state?.bedroomCount,
    livingRoomCount: location.state?.livingRoomCount,
    sortBy: location.state?.sortBy,
  };

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  console.log("location", location);

  const handleSearch = () => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => {
        if (Array.isArray(v)) {
          return v.length > 0;
        }
        return v !== undefined && v !== null && v !== "";
      })
    );
    console.log('Triggering search with filters:', cleanedFilters);
    trigger(cleanedFilters)
      .unwrap()
      .then(result => {
        console.log('Search successful, result:', result);
      })
      .catch(error => {
        console.error('Search failed:', error);
      });
  };

  // Initial search
  useEffect(() => {
    console.log('Initial search effect running');
    handleSearch();
  }, []);

  // Update URL state when filters change
  useEffect(() => {
    console.log('Filters changed:', filters);
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null)
    );
    
    navigate('.', {
      state: cleanedFilters,
      replace: true
    });
  }, [filters]);

  const pagination: PaginationType = propertiesResult?.data?.meta || {
    currentPage: 1,
    total: 0,
    perPage: 1,
  };

  // Handlers
  const handleGuestCount = (increment: boolean) => {
    setFilters(prev => ({
      ...prev,
      guestCount: increment ? prev.guestCount + 1 : Math.max(1, prev.guestCount - 1)
    }));
  };

  const handlePageChange = (_: unknown, page: number) => {
    setFilters(prev => ({ ...prev, page }));
    handleSearch();
  };

  useEffect(() => {
    console.log('Location State:', location.state);
    console.log('Initial Filters:', initialFilters);
    console.log('Current Filters:', filters);
    console.log('API Response:', propertiesResult);
  }, [location.state, filters, propertiesResult]);

  return (
    <PageLayout>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 13 }}>
        <Box className="flex">
          {/* Sidebar Filter */}
          <Box className="hidden md:block w-1/4 px-4 pt-8" component="aside">
            <FilterContent
              filters={filters}
              setFilters={setFilters}
              handleSearch={handleSearch}
              handleAddGuest={() => handleGuestCount(true)}
              handleRemoveGuest={() => handleGuestCount(false)}
              isFetching={isFetching}
            />
          </Box>

          {/* Divider */}
          <Box
            className="hidden md:block w-px bg-gray-200 mx-4"
            sx={{ height: 'calc(100vh - 104px)' }}
          />

          {/* Results Section */}
          <Box className="flex-1 px-10 md:px-12 lg:px-16 py-6 md:py-8">
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
                <Typography variant="body2" color="text.secondary" sx={{
                  fontSize: { xs: '0.875rem', md: '1rem' }
                }}>
                  {propertiesResult?.data?.data?.length || 0} properties found
                </Typography>
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

            {/* Results Grid */}
            <ResultsGrid
              isFetching={isFetching}
              apartments={propertiesResult?.data?.data || []}
            />

            {/* Pagination */}
            {!isFetching && (propertiesResult?.data?.data?.length ?? 0) > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
                <CustomPagination
                  count={Math.ceil(pagination.total / pagination.perPage)}
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
            handleSearch,
            handleAddGuest: () => handleGuestCount(true),
            handleRemoveGuest: () => handleGuestCount(false),
            isFetching
          }}
        />

        <ToastContainer />
      </Container>
    </PageLayout>
  );
};

export default SearchResults;
