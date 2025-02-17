import React, { useState, useEffect, ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Pagination,
  Skeleton,
} from '@mui/material';
import PageLayout from '../components/pagelayout/index';

import { format } from 'date-fns';
import ApartmentCard from '../components/apartment/ApartmentCard';
import SampleImg from '../assets/images/Apartment/Bigimg.png';
import { ToastContainer } from 'react-toastify';
import { useLazyGetPropertiesQuery } from '../api/propertiesApi';

const SearchResults: React.FC = () => {
  const [trigger, { data: propertiesResult, isFetching }] =
    useLazyGetPropertiesQuery();
  // const [allapartments] = useState<any[]>([]);
  const location = useLocation();

  // Extract state passed from navigation (default to empty if undefined)
  const initialFilters = location.state || {
    location: '',
    startDate: '',
    endDate: '',
    selectedProperty: '',
    guestCount: 0,
  };

  const pagination = propertiesResult?.data?.meta || {
    currentPage: 1,
    total: 0,
    perPage: 1,
  };

  // State for filters
  const [filters, setFilters] = useState(initialFilters);

  // Convert empty values to avoid sending unnecessary params
  const cleanedFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, v]) => v)
  );

  // Trigger API on page load
  useEffect(() => {
    trigger(cleanedFilters);
  }, []);

  const handleAddGuest = () => {
    setFilters({ ...filters, guestCount: filters.guestCount + 1 });
  };

  const handleRemoveGuest = () => {
    setFilters({
      ...filters,
      guestCount: filters.guestCount > 1 ? filters.guestCount - 1 : 1,
    });
  };

  // Handle search button click
  const handleSearch = () => {
    trigger(cleanedFilters); // Send only non-empty filters
  };

  function handlePageChange(_event: ChangeEvent<unknown>, _page: number): void {
    setFilters({ ...filters, page: _page });
    handleSearch();
  }

  return (
    <PageLayout children={
      <Container maxWidth="xl" sx={{ px: 0, pt: 13 }}>
      <Grid container spacing={4}>
        {/* Sidebar Filter */}
        <Grid item xs={12} md={3} px={4} order={{ xs: 2, md: 1 }}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Search Filter
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: '0.02rem',
              backgroundColor: '#e0e0e0',
              marginBottom: 2,
            }}
          />

          {/* Location Filter */}
          <TextField
            label="Location"
            fullWidth
            value={filters.location}
            onChange={(e) =>
              setFilters({
                ...filters,
                location: e.target.value,
                searchTerm: e.target.value,
              })
            }
            sx={{ marginBottom: 2 }}
          />

          {/* Date Range Picker */}
          <div className="my-4 flex items-center space-x-2">
            <TextField
              label="Checkin"
              type="date"
              fullWidth
              value={
                filters.startDate &&
                format(new Date(filters.startDate), 'yyyy-MM-dd')
              }
              onChange={(e) => {
                const startDate = e.target.value;
                setFilters({
                  ...filters,
                  startDate,
                });
              }}
              // sx={{ marginBottom: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Checkout"
              type="date"
              fullWidth
              value={filters.endDate}
              onChange={(e) => {
                const endDate = e.target.value;
                setFilters({
                  ...filters,
                  endDate: endDate,
                });
              }}
              // sx={{ marginBottom: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>

          <Box
            sx={{
              width: '100%',
              height: '0.02rem',
              backgroundColor: '#e0e0e0',
              marginBottom: 2,
            }}
          />

          {/* Property Type Checklist */}
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            Property Type
          </Typography>

          {['DUPLEX', 'BUNGALOW', 'VILLA', 'APARTMENT', 'HOTEL', 'OTHERS'].map(
            (type) => (
              <div key={type}>
                <input
                  type="radio"
                  id={type}
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      propertyType: e.target.value,
                    })
                  }
                />
                <label
                  htmlFor={type}
                  style={{ marginLeft: '10px', textTransform: 'capitalize' }}
                >
                  {type}
                </label>
              </div>
            )
          )}

          <Box
            sx={{
              width: '100%',
              height: '0.02rem',
              backgroundColor: '#e0e0e0',
              marginBottom: 2,
              marginTop: 2,
            }}
          />

          {/* Guests Filter */}
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            Guests
          </Typography>
          <Box display="flex" alignItems="center" sx={{ marginBottom: 2 }}>
            <Button
              variant="outlined"
              onClick={handleRemoveGuest}
              disabled={filters.guestCount <= 1}
            >
              -
            </Button>
            <Typography variant="body1" sx={{ margin: '0 6px' }}>
              {filters.guestCount}
            </Typography>
            <Button variant="outlined" onClick={handleAddGuest}>
              +
            </Button>
          </Box>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSearch}
          >
            {isFetching ? 'Distilling servers ... please wait' : 'Search'}
          </Button>
        </Grid>

        {/* Divider */}
        <Grid
          item
          xs="auto"
          order={1}
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          <Box
            sx={{
              width: '1px',
              height: '100%',
              backgroundColor: '#e0e0e0',
              marginX: 2,
            }}
          />
        </Grid>
        {/* <Box
          sx={{
            width: '1px',
            backgroundColor: '#e0e0e0',
            marginX: 2,
          }}
        /> */}

        {/* Search Results */}
        <Grid item xs={12} md={8} order={{ xs: 1, md: 2 }}>
          <Typography variant="h4" sx={{ marginBottom: 4, fontSize: '1.5rem' }}>
            Search Results
          </Typography>
          <Grid container spacing={6}>
            {isFetching ? (
              <PropertyCardSkeleton />
            ) : (
              propertiesResult?.data.data.map((apartment, index) => {
                const allUnitPrices = apartment?.units?.map(
                  (unit: any) => unit?.pricePerNight
                );
                return (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <ApartmentCard
                      imageUrl={
                        apartment?.media?.length > 0
                          ? apartment?.media?.[0]?.mediaUrl
                          : SampleImg
                      }
                      title={apartment?.name}
                      propertylink={`/property-details/${apartment?.id}`}
                      location={`${apartment?.city}, ${apartment?.state}`}
                      rating={apartment?.meta?.average_rating || 0}
                      reviews={apartment?.meta?.total_reviews || 0}
                      hasUnits={!!apartment?.units?.length}
                      minPrice={Math.min(...allUnitPrices)}
                      maxPrice={Math.max(...allUnitPrices)}
                    />
                  </Grid>
                );
              })
            )}
          </Grid>

          {/* Pagination Controls */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <Pagination
              count={Math.ceil(pagination?.total / pagination?.perPage)} // Total pages
              page={pagination?.currentPage || 1}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Grid>
      </Grid>
      <ToastContainer />
    </Container>
    } />
  );
};

const PropertyCardSkeleton = () => {
  return (
    <PageLayout
      children={
        <>
          <Grid className="justify-center" px={6} container wrap="nowrap">
            {Array.from(new Array(3)).map((_, index) => (
              <Box key={index} sx={{ width: '100%', marginRight: '16px', my: 5 }}>
                <Skeleton variant="rectangular" width="100%" height={200} />
                <Box sx={{ pt: 0.5 }}>
                  <Skeleton />
                  <Skeleton width="60%" />
                </Box>
              </Box>
            ))}
          </Grid>
    
          <Grid className="justify-center" px={6} container wrap="nowrap">
            {Array.from(new Array(3)).map((_, index) => (
              <Box key={index} sx={{ width: '100%', marginRight: '16px', my: 5 }}>
                <Skeleton variant="rectangular" width="100%" height={200} />
                <Box sx={{ pt: 0.5 }}>
                  <Skeleton />
                  <Skeleton width="60%" />
                </Box>
              </Box>
            ))}
          </Grid>
        </>
      }
    />
  );
};

export default SearchResults;
