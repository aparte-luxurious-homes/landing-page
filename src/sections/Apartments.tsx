/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Container, Typography, Box, Link, Grid, useTheme, useMediaQuery, Button } from '@mui/material';
import { ArrowForward, Apartment as ApartmentIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ApartmentCard from '../components/apartment/ApartmentCard';
import PropertyCardSkeleton from '../components/skeletons/PropertyCardSkeleton';
import PropertyTypesList from '../components/property/PropertyTypesList';
import SampleImg from '../assets/images/Apartment/Bigimg.png';
import { useGetPropertiesQuery } from '../api/propertiesApi';

export default function Apartments() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const INITIAL_ITEMS = isMobile ? 4 : isTablet ? 6 : 8;
  const FEATURED_ITEMS = isMobile ? 2 : 4;

  const [visibleItems, setVisibleItems] = useState(INITIAL_ITEMS);
  const { data, isLoading } = useGetPropertiesQuery({location: 'Lagos'});
  const [lagosApartments, setLagosApartments] = useState<any[]>([]);
  const [featuredApartments, setFeaturedApartments] = useState<any[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');

  useEffect(() => {
    if (data?.data?.data) {
      // Filter featured properties
      const featured = data.data.data.filter(apartment => apartment.isFeatured);
      setFeaturedApartments(featured);

      // Filter by property type if selected, otherwise show all Lagos properties
      const filtered = selectedPropertyType 
        ? data.data.data.filter(apartment => 
            apartment?.propertyType?.toUpperCase() === selectedPropertyType.toUpperCase())
        : data.data.data;
      setLagosApartments(filtered);
    }
  }, [isLoading, data, selectedPropertyType]);

  useEffect(() => {
    // Update visible items when screen size changes
    setVisibleItems(INITIAL_ITEMS);
  }, [INITIAL_ITEMS]);

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
    return <PropertyCardSkeleton count={isMobile ? 2 : isTablet ? 4 : 8} columns={{ xs: 12, sm: 6, md: 3 }} />;
  }

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Typography 
      variant="h4" 
      sx={{
        fontWeight: 500,
        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
        color: '#1a1a1a',
        lineHeight: { xs: 1.3, md: 1.5 }
      }}
    >
      {children}
    </Typography>
  );

  return (
    <Container 
      maxWidth="xl" 
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, sm: 4, md: 6 },
        background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)',
        mx: 'auto',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Property Type Filter */}
      <Box sx={{ mb: { xs: 4, sm: 5, md: 6 } }}>
        <PropertyTypesList 
          onPropertyTypeChange={handlePropertyTypeChange}
        />
      </Box>

      {/* Featured Properties Section */}
      {featuredApartments.length > 0 && (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 2, sm: 3, md: 4 },
            flexWrap: 'wrap',
            gap: 2
          }}>
            <SectionTitle>Featured Properties</SectionTitle>
          </Box>

          <Grid 
            container 
            spacing={{ xs: 2, sm: 2, md: 3 }} 
            sx={{ mb: { xs: 4, sm: 6, md: 8 } }}
          >
            {featuredApartments.slice(0, FEATURED_ITEMS).map((apartment, index) => {
              const prices = apartment?.units?.map((unit: any) => Number(unit.pricePerNight)) || [0];
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
        </>
      )}

      {/* All Lagos Properties Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: { xs: 2, sm: 3, md: 4 },
        flexWrap: 'wrap',
        gap: 2
      }}>
        <SectionTitle>
          {selectedPropertyType 
            ? `${selectedPropertyType.charAt(0).toUpperCase() + selectedPropertyType.slice(1).toLowerCase()}s in Lagos`
            : 'Find your Aparte'}
        </SectionTitle>
        
        <Link
          onClick={handleShowAll}
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: '#028090',
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            '&:hover': { opacity: 0.8 }
          }}
        >
          View All
          <ArrowForward sx={{ ml: 0.5, fontSize: { xs: '1rem', sm: '1.2rem' } }} />
        </Link>
      </Box>

      {!lagosApartments?.length ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: { xs: 4, sm: 6, md: 8 }
        }}>
          <ApartmentIcon sx={{ 
            fontSize: { xs: 48, sm: 64 }, 
            color: 'text.secondary', 
            opacity: 0.5, 
            mb: { xs: 1, sm: 2 } 
          }} />
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
          >
            No properties found
          </Typography>
        </Box>
      ) : (
        <>
          <Grid 
            container 
            spacing={{ xs: 2, sm: 2, md: 3 }}
          >
            {lagosApartments.slice(0, visibleItems).map((apartment, index) => {
              const prices = apartment?.units?.map((unit: any) => Number(unit.pricePerNight)) || [0];
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

          {/* View More Button */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mt: { xs: 4, sm: 5, md: 6 }
            }}
          >
            <Button
              onClick={handleShowAll}
              variant="outlined"
              endIcon={<ArrowForward />}
              sx={{
                color: '#028090',
                borderColor: '#028090',
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                py: { xs: 1, sm: 1.5 },
                px: { xs: 3, sm: 4 },
                '&:hover': {
                  borderColor: '#028090',
                  backgroundColor: 'rgba(2, 128, 144, 0.04)'
                }
              }}
            >
              View More Properties
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
