import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  useMediaQuery,
  Link,
  Button
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import ApartmentCard from '../components/apartment/ApartmentCard';
import SampleImg from '../assets/images/Apartment/Bigimg.png';
import { useTheme } from '@mui/material/styles';
import { useGetPropertiesQuery } from '../api/propertiesApi';
import PropertyCardSkeleton from '../components/skeletons/PropertyCardSkeleton';
import PropertyTypesList from '../components/property/PropertyTypesList';
import { Apartment as ApartmentIcon, KeyboardArrowDown, ArrowForward } from '@mui/icons-material';

export default function Apartments() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const ITEMS_PER_PAGE = isLargeScreen ? 8 : 4;
  const INITIAL_ITEMS = 8;
  const LOAD_MORE_ITEMS = 4;

  const [currentPage, setCurrentPage] = useState(1);
  const [visibleItems, setVisibleItems] = useState(INITIAL_ITEMS);
  const { data, error, isLoading } = useGetPropertiesQuery({});
  const [lagosApartments, setLagosApartments] = useState<any[]>([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (!isLoading && data?.data?.data) {
      const filtered = data.data.data.filter(
        (apartment: any) => 
          apartment?.state.toLowerCase() === 'lagos state' &&
          (selectedPropertyType ? apartment?.propertyType?.toUpperCase() === selectedPropertyType : true) &&
          (isFeatured ? apartment?.featured === true : true)
      );
      setLagosApartments(filtered);
    }
  }, [isLoading, data, selectedPropertyType, isFeatured]);

  const handlePropertyTypeChange = (propertyType: string) => {
    setSelectedPropertyType(propertyType);
    setVisibleItems(INITIAL_ITEMS);
  };

  const handleFeaturedClick = () => {
    setIsFeatured(prev => !prev);
    setVisibleItems(INITIAL_ITEMS);
  };

  const handleShowAll = () => {
    navigate('/search-results', {
      state: {
        propertyType: selectedPropertyType || '',
        location: 'lagos state'
      }
    });
  };

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + LOAD_MORE_ITEMS);
  };

  const paginatedApartments = lagosApartments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const visibleApartments = lagosApartments.slice(0, visibleItems);
  const hasMoreItems = visibleItems < lagosApartments.length;

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 0, sm: 0, md: 4, lg: 5, xl: 6 },
        position: "relative",
        zIndex: 1,
        overflowX: "hidden",
        maxWidth: {
          xs: "360px", 
          sm: "100%",
          xl: "xl", 
        },
      }}
    >
      <section className="py-6 px-4 sm:py-10 md:py-8 lg:py-8 xl:py-10 property">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <PropertyTypesList 
            onPropertyTypeChange={handlePropertyTypeChange} 
            onFeaturedClick={handleFeaturedClick}
          />
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 4 
        }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: {
                xs: '1.5rem',
                sm: '1.5rem',
                md: '1.8rem',
                lg: '2rem',
                xl: '2rem',
              },
              fontWeight: 'medium',
            }}
          >
            {selectedPropertyType ? selectedPropertyType.charAt(0).toUpperCase() + selectedPropertyType.slice(1).toLowerCase() + 's' : 'All Properties'} in Lagos
          </Typography>
          <Link
            onClick={handleShowAll}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: '#028090',
              cursor: 'pointer',
              textDecoration: 'none',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              '&:hover': {
                textDecoration: 'none',
                opacity: 0.8
              }
            }}
          >
            Show All
            <ArrowForward sx={{ ml: 1, fontSize: '1.2rem' }} />
          </Link>
        </Box>
        <Grid container spacing={2} sx={{ mt: 4 }}>
        {isLoading ? (
          <PropertyCardSkeleton />
        ) : !lagosApartments?.length ? (
          <Box className="w-full text-center py-12">
            <Box className="flex justify-center mb-4">
              <ApartmentIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
            </Box>
            <Typography variant="h6" color="text.secondary">
              No {selectedPropertyType ? selectedPropertyType.charAt(0).toUpperCase() + selectedPropertyType.slice(1).toLowerCase() + 's' : 'All Properties'} found for your search
            </Typography>
          </Box>
        ) : (
          visibleApartments.map((apartment, index) => {
            const allUnitPrices = apartment?.units?.map((unit: any) => Number(unit?.pricePerNight)) || [0];

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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
                  reviews={apartment?.units?.reviews || 'No Reviews'}
                  hasUnits={!!apartment?.units?.length}
                  minPrice={Math.min(...allUnitPrices)}
                  maxPrice={Math.max(...allUnitPrices)}
                />
              </Grid>
            );
          })
        )}
        </Grid>
        {hasMoreItems && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 6,
            mb: 4
          }}>
            <Button
              onClick={handleLoadMore}
              endIcon={<KeyboardArrowDown />}
              variant="text"
              sx={{ 
                color: '#028090',
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  opacity: 0.8
                }
              }}
            >
              See More
            </Button>
          </Box>
        )}
      </section>
    </Container>
  );
}