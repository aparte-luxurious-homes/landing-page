import React from 'react';
import { Grid, Box, Skeleton } from '@mui/material';

interface PropertyCardSkeletonProps {
  count?: number;
  columns?: {
    xs: number;
    sm: number;
    md: number;
    lg?: number;
  };
}

const PropertyCardSkeleton: React.FC<PropertyCardSkeletonProps> = ({
  count = 6,
  columns = { xs: 12, sm: 6, md: 4, lg: 3 }
}) => {
  return (
    <Grid container spacing={3}>
      {Array.from(new Array(count)).map((_, index) => (
        <Grid item {...columns} key={index}>
          <Box sx={{ width: '100%', marginBottom: 2 }}>
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={200} 
              sx={{ borderRadius: '10px', mb: 1 }} 
            />
            <Box sx={{ pt: 0.5 }}>
              <Skeleton width="80%" sx={{ mb: 1 }} />
              <Skeleton width="60%" />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default PropertyCardSkeleton; 