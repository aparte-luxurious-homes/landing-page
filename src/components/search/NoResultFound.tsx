'use client';

import React from 'react';
import { Box, Typography, Button, Paper, Chip, Stack } from '@mui/material';
import { SearchOff } from '@mui/icons-material';
import { SearchFilters } from '../../types/search';
import { useGetLocationSuggestionsQuery } from '../../api/propertiesApi';

interface NoResultsFoundProps {
  filters: SearchFilters;
  onClearFilters: () => void;
  onSuggestLocation?: (city: string) => void;
  /**
   * Explanation from the search endpoint — it names exactly what was looked
   * for and what was widened, which beats the generic copy below. Only
   * reaches here when even the relaxation ladder found nothing.
   */
  message?: string;
}

const NoResultsFound: React.FC<NoResultsFoundProps> = ({
  filters,
  onClearFilters,
  onSuggestLocation,
  message,
}) => {
  const hasActiveFilters =
    (filters.locations && filters.locations.length > 0) ||
    filters.startDate ||
    filters.endDate ||
    (filters.propertyTypes && filters.propertyTypes.length > 0) ||
    filters.guestCount > 2 ||
    filters.bedroomCount ||
    filters.livingRoomCount ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    (filters.amenities && filters.amenities.length > 0) ||
    filters.isPetAllowed ||
    filters.isPartyAllowed;

  const { data: suggestions } = useGetLocationSuggestionsQuery();
  const topCities = suggestions?.data?.cities?.slice(0, 5) ?? [];

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

      <Typography variant="body1" color="text.secondary" sx={{ mb: topCities.length && onSuggestLocation ? 2 : 4, maxWidth: 500, mx: 'auto' }}>
        {message
          ? message
          : hasActiveFilters
          ? "We couldn't find any properties matching your search criteria. Try one of the cities below, or adjust your filters."
          : "Start your search by selecting a location and dates to find available properties."}
      </Typography>

      {hasActiveFilters && onSuggestLocation && topCities.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Popular right now:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
            {topCities.map((c) => (
              <Chip
                key={c.name}
                label={`${c.name} · ${c.count}`}
                onClick={() => onSuggestLocation(c.name)}
                size="small"
                sx={{
                  bgcolor: '#028090',
                  color: 'white',
                  '&:hover': { bgcolor: '#026d7a' },
                  cursor: 'pointer',
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

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
