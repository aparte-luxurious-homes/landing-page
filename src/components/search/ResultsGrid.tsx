import { Box, Typography, Grid } from "@mui/material";
import { Apartment } from "~/types/search";
import ApartmentCard from "../apartment/ApartmentCard";
import PropertyCardSkeleton from "../skeletons/PropertyCardSkeleton";
import { Apartment as ApartmentIcon } from '@mui/icons-material';
import SampleImg from '~/assets/images/Apartment/Bigimg.png';

interface ResultsGridProps {
  isFetching: boolean;
  apartments?: Apartment[];
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ isFetching, apartments }) => {
  if (isFetching) {
    return <PropertyCardSkeleton count={6} columns={{ xs: 12, sm: 6, md: 4 }} />;
  }

  if (!apartments?.length) {
    return (
      <Box className="w-full text-center py-12">
        <Box className="flex justify-center mb-4">
          <ApartmentIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
        </Box>
        <Typography variant="h6" color="text.secondary">
          No properties found for your search
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Let us help you find your perfect stay
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {apartments.map((apartment, index) => {
        const allUnitPrices = apartment?.units?.map(unit => unit.pricePerNight) || [0];
        return (
          <Grid item xs={12} sm={6} md={4} key={apartment.id || index}>
            <ApartmentCard
              imageUrl={apartment?.media?.[0]?.mediaUrl || SampleImg}
              title={apartment.name}
              propertylink={`/property-details/${apartment.id}`}
              location={`${apartment.city}, ${apartment.state}`}
              rating={apartment.meta?.average_rating || 0}
              reviews={apartment.meta?.total_reviews || 0}
              hasUnits={!!apartment.units?.length}
              minPrice={Math.min(...allUnitPrices)}
              maxPrice={Math.max(...allUnitPrices)}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}; 