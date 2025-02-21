/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Container, Typography, Box, Link, Grid } from '@mui/material';
import { ArrowForward, Apartment as ApartmentIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ApartmentCard from '../components/apartment/ApartmentCard';
import PropertyCardSkeleton from '../components/skeletons/PropertyCardSkeleton';
import PropertyTypesList from '../components/property/PropertyTypesList';
import SampleImg from '../assets/images/Apartment/Bigimg.png';
import { useGetPropertiesQuery } from '../api/propertiesApi';

export default function Apartments() {
  const navigate = useNavigate();
  const INITIAL_ITEMS = 8;
  const [visibleItems, setVisibleItems] = useState(INITIAL_ITEMS);
  const { data, isLoading } = useGetPropertiesQuery({location: 'Lagos'});
  const [lagosApartments, setLagosApartments] = useState<any[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');

  useEffect(() => {
    if (data?.data?.data) {
      const filtered = selectedPropertyType 
        ? data.data.data.filter(apartment => 
            apartment?.propertyType?.toUpperCase() === selectedPropertyType.toUpperCase())
        : data.data.data;
      setLagosApartments(filtered);
    }
  }, [isLoading, data, selectedPropertyType]);

  const handlePropertyTypeChange = (propertyType: string) => {
    setSelectedPropertyType(propertyType);
    setVisibleItems(INITIAL_ITEMS);
  };

  const handleShowAll = () => {
    navigate('/search-results', {
      state: {
        propertyTypes: selectedPropertyType ? [selectedPropertyType] : [],
        location: 'Lagos'
      }
    });
  };

  if (isLoading) {
    return <PropertyCardSkeleton count={8} columns={{ xs: 12, sm: 6, md: 3 }} />;
  }

  return (
    <Container 
      maxWidth="xl" 
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 4, sm: 6, md: 8 },
        background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)',
        mx: 'auto',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Box sx={{ mb: 6 }}>
        <PropertyTypesList 
          onPropertyTypeChange={handlePropertyTypeChange}
          onFeaturedClick={() => setVisibleItems(INITIAL_ITEMS)}
        />
      </Box>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 4
      }}>
        <Typography 
          variant="h4" 
          sx={{
            fontWeight: 500,
            fontSize: { xs: '1.5rem', md: '2rem' },
            color: '#1a1a1a'
          }}
        >
          {selectedPropertyType 
            ? `${selectedPropertyType} in Lagos`
            : 'Featured Properties'}
        </Typography>
        
        <Link
          onClick={handleShowAll}
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: '#028090',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
            '&:hover': { opacity: 0.8 }
          }}
        >
          View All
          <ArrowForward sx={{ ml: 1, fontSize: '1.2rem' }} />
        </Link>
      </Box>

      {!lagosApartments?.length ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ApartmentIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No properties found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {lagosApartments.slice(0, visibleItems).map((apartment, index) => {
            const prices = apartment?.units?.map(unit => Number(unit.pricePerNight)) || [0];
            return (
              <Grid item xs={12} sm={6} md={3} key={apartment.id || index}>
                <ApartmentCard
                  imageUrl={apartment?.media?.[0]?.mediaUrl || SampleImg}
                  title={apartment?.name}
                  propertylink={`/property-details/${apartment?.id}`}
                  location={`${apartment?.city}, ${apartment?.state}`}
                  rating={apartment?.meta?.average_rating || 0}
                  reviews={apartment?.meta?.total_reviews || 0}
                  hasUnits={!!apartment?.units?.length}
                  minPrice={Math.min(...prices)}
                  maxPrice={Math.max(...prices)}
                />
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
