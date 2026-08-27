/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid } from "@mui/material";
import ApartmentCard from "../apartment/ApartmentCard";
import PropertyCardSkeleton from "../skeletons/PropertyCardSkeleton";
import { toCardProps } from "../../utils/propertyCard";

interface ResultsGridProps {
  isFetching: boolean;
  apartments: any[];
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ isFetching, apartments }) => {
  if (isFetching) {
    return <PropertyCardSkeleton count={6} columns={{ xs: 12, sm: 6, md: 4 }} />;
  }

  return (
    <Grid container spacing={3}>
      {apartments.map((apartment, index) => (
        <Grid item xs={12} sm={6} md={4} key={apartment.id || index}>
          {/* Shared prop builder — the card fixes (aspect box, image
              fallback, verified badge) land here without touching this
              page's layout. */}
          <ApartmentCard {...toCardProps(apartment)} />
        </Grid>
      ))}
    </Grid>
  );
};
