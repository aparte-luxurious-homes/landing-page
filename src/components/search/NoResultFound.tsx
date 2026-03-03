import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { SearchOff } from '@mui/icons-material';
import { SearchFilters } from '../../types/search';

interface NoResultsFoundProps {
  filters: SearchFilters;
  onClearFilters: () => void;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({ filters, onClearFilters }) => {
  // Check if any filters are applied
  const hasActiveFilters = 
    (filters.locations && filters.locations.length > 0) ||
    filters.startDate ||
    filters.endDate ||
    (filters.propertyTypes && filters.propertyTypes.length > 0) ||
    filters.guestCount > 2 ||
    filters.bedroomCount ||
    filters.livingRoomCount;

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 6, 
        textAlign: 'center',
        backgroundColor: 'grey.50',
        borderRadius: 2
      }}
    >
      <SearchOff sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
      
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
        No Properties Found
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
        {hasActiveFilters 
          ? "We couldn't find any properties matching your search criteria. Try adjusting your filters or searching in a different location."
          : "Start your search by selecting a location and dates to find available properties."}
      </Typography>

      {hasActiveFilters && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={onClearFilters}
          >
            Clear All Filters
          </Button>
          <Button 
            variant="outlined"
            component="a"
            href="/"
          >
            Browse All Properties
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default NoResultsFound;