import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Pagination,
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Initialize filters with defaults or passed state
  const initialFilters: SearchFilters = {
    location: location.state?.location || '',
    startDate: location.state?.startDate || new Date(),
    endDate: location.state?.endDate || new Date(new Date().setDate(new Date().getDate() + 1)),
    propertyType: location.state?.propertyType || '',
    guestCount: location.state?.guestCount || 2,
  };

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

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

  const handleSearch = () => {
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v)
    );
    trigger(cleanedFilters);
  };

  const handlePageChange = (_: unknown, page: number) => {
    setFilters(prev => ({ ...prev, page }));
    handleSearch();
  };

  useEffect(() => {
    handleSearch();
  }, []);

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
              apartments={propertiesResult?.data?.data}
            />

            {/* Pagination */}
            {!isFetching && propertiesResult?.data?.data?.length > 0 && (
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
