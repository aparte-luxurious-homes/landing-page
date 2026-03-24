import { Typography, Button, Box, Chip, Stack, IconButton, InputBase, Paper, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { FilterContentProps } from '../../types/search';
import DateRangePicker from '../DateRangePicker';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useState } from 'react';

const FilterContent: React.FC<FilterContentProps> = ({
  filters,
  setFilters,
  handleSearch,
  handleAddGuest,
  handleRemoveGuest,
  isFetching,
  onLocationChange,
}) => {
  const [inputValue, setInputValue] = useState('');
  
  const propertyTypes = ['DUPLEX', 'BUNGALOW', 'VILLA', 'APARTMENT', 'HOTEL', 'OTHERS'].map(type => ({
    value: type,
    label: type.charAt(0) + type.slice(1).toLowerCase()
  }));

  const popularLocations = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'];

  const handleLocationSelect = (location: string) => {
    const newLocations = (filters.locations || []).includes(location)
      ? (filters.locations || []).filter(l => l !== location)
      : [...(filters.locations || []), location];
    
    setFilters(prev => ({ ...prev, locations: newLocations }));
    if (onLocationChange) {
      onLocationChange(newLocations);
    }
  };

  const handleLocationInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const inputLocations = inputValue.split(',').map(loc => loc.trim()).filter(Boolean);
      const newLocations = inputLocations.filter(loc => !filters.locations?.includes(loc));
      
      if (newLocations.length) {
        const updatedLocations = [...(filters.locations || []), ...newLocations];
        setFilters({
          ...filters,
          locations: updatedLocations
        });
        if (onLocationChange) {
          onLocationChange(updatedLocations);
        }
        setInputValue('');
      }
    }
  };

  const handleDeleteLocation = (locationToDelete: string) => {
    const updatedLocations = (filters.locations || []).filter(location => location !== locationToDelete);
    setFilters({
      ...filters,
      locations: updatedLocations
    });
    if (onLocationChange) {
      onLocationChange(updatedLocations);
    }
  };

  const handlePropertyTypeChange = (propertyType: string) => {
    setFilters({
      ...filters,
      propertyTypes: (filters.propertyTypes || []).includes(propertyType)
        ? (filters.propertyTypes || []).filter((type: string) => type !== propertyType)
        : [...(filters.propertyTypes || []), propertyType]
    });
  };

  const handleBedroomChange = (value: number) => {
    setFilters({
      ...filters,
      bedroomCount: value
    });
  };
  
  const handleLivingRoomChange = (value: number) => {
    setFilters({
      ...filters,
      livingRoomCount: value
    });
  };

  const handleSortChange = (value: 'price_asc' | 'price_desc' | null) => {
    setFilters({
      ...filters,
      sortBy: value || undefined
    });
  };

  return (
    <Box className="flex flex-col space-y-4">
      <Box>
        <Typography variant="subtitle1" className="font-medium mb-1">Location</Typography>
        <Typography variant="caption" color="text.secondary" className="mb-1">
          Enter multiple locations (State) separated by commas
        </Typography>
        
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Popular locations:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {popularLocations.map((location) => (
              <Chip
                key={location}
                label={location}
                onClick={() => handleLocationSelect(location)}
                variant={(filters.locations || []).includes(location) ? 'filled' : 'outlined'}
                size="small"
                sx={{
                  height: '24px',
                  '& .MuiChip-label': { fontSize: '0.75rem' },
                  bgcolor: (filters.locations || []).includes(location) ? '#028090' : 'transparent',
                  color: (filters.locations || []).includes(location) ? 'white' : 'inherit',
                  '&:hover': { 
                    bgcolor: (filters.locations || []).includes(location) ? '#026d7a' : '#f5f5f5' 
                  },
                  mb: 0.5
                }}
              />
            ))}
          </Stack>
        </Box>

        <Paper className="p-1.5" variant="outlined">
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(filters.locations || []).map((location) => (
              <Chip
                key={location}
                label={location}
                onDelete={() => handleDeleteLocation(location)}
                size="small"
                sx={{
                  bgcolor: '#028090',
                  color: 'white',
                  mb: 0.5,
                  height: '24px',
                  '& .MuiChip-label': { fontSize: '0.75rem' }
                }}
              />
            ))}
            <InputBase
              placeholder={(filters.locations || []).length ? '' : 'Lagos, Abuja, Port Harcourt...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleLocationInput}
              sx={{ flex: 1, fontSize: '0.75rem', ml: 0.5 }}
            />
          </Stack>
        </Paper>
      </Box>

      <Box>
        <Typography variant="subtitle1" className="font-medium mb-2">Dates</Typography>
        <DateRangePicker
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartDateChange={(date) => setFilters({ ...filters, startDate: date })}
          onEndDateChange={(date) => setFilters({ ...filters, endDate: date })}
          disabled={isFetching}
          availableDates={[]}
        />
      </Box>

      <Divider sx={{ my: 0.5 }} />

      <Box>
        <Typography variant="subtitle1" className="font-medium mb-1">Property Type</Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {propertyTypes.map(({ value, label }) => (
            <Chip
              key={value}
              label={label}
              onClick={() => handlePropertyTypeChange(value)}
              variant={(filters.propertyTypes || []).includes(value) ? 'filled' : 'outlined'}
              size="small"
              sx={{
                height: '24px',
                '& .MuiChip-label': { fontSize: '0.75rem' },
                bgcolor: (filters.propertyTypes || []).includes(value) ? '#028090' : 'transparent',
                color: (filters.propertyTypes || []).includes(value) ? 'white' : 'inherit',
                '&:hover': { bgcolor: (filters.propertyTypes || []).includes(value) ? '#026d7a' : '#f5f5f5' },
                mb: 0.5
              }}
            />
          ))}
        </Stack>
      </Box>

      <Box>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="subtitle1" className="font-medium mb-2">Bedrooms</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {[1, 2, 3, 4, 5].map((count) => (
                <Chip
                  key={count}
                  label={count === 5 ? '5+' : count}
                  onClick={() => handleBedroomChange(count)}
                  variant={filters.bedroomCount === count ? 'filled' : 'outlined'}
                  size="small"
                  sx={{
                    height: '24px',
                    '& .MuiChip-label': { fontSize: '0.75rem' },
                    bgcolor: filters.bedroomCount === count ? '#028090' : 'transparent',
                    color: filters.bedroomCount === count ? 'white' : 'inherit',
                    '&:hover': { bgcolor: filters.bedroomCount === count ? '#026d7a' : '#f5f5f5' },
                    mb: 0.5
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle1" className="font-medium mb-2">Living Rooms</Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {[1, 2, 3, 4].map((count) => (
                <Chip
                  key={count}
                  label={count === 4 ? '4+' : count}
                  onClick={() => handleLivingRoomChange(count)}
                  variant={filters.livingRoomCount === count ? 'filled' : 'outlined'}
                  size="small"
                  sx={{
                    height: '24px',
                    '& .MuiChip-label': { fontSize: '0.75rem' },
                    bgcolor: filters.livingRoomCount === count ? '#028090' : 'transparent',
                    color: filters.livingRoomCount === count ? 'white' : 'inherit',
                    '&:hover': { bgcolor: filters.livingRoomCount === count ? '#026d7a' : '#f5f5f5' },
                    mb: 0.5
                  }}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box>
        <Typography variant="subtitle1" className="font-medium mb-1">Guests</Typography>
        <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2">Number of guests</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleRemoveGuest}
              disabled={filters.guestCount <= 1}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                p: '4px'
              }}
            >
              <RemoveIcon sx={{ fontSize: '0.875rem' }} />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: '20px', textAlign: 'center' }}>
              {filters.guestCount}
            </Typography>
            <IconButton
              size="small"
              onClick={handleAddGuest}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                p: '4px'
              }}
            >
              <AddIcon sx={{ fontSize: '0.875rem' }} />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      <Box>
        <Typography variant="subtitle1" className="font-medium mb-1">Sort By Price</Typography>
        <ToggleButtonGroup
          exclusive
          value={filters.sortBy}
          onChange={(_, value) => handleSortChange(value)}
          size="small"
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              py: 0.75,
              fontSize: '0.75rem',
              '&.Mui-selected': {
                bgcolor: '#028090',
                color: 'white',
                '&:hover': {
                  bgcolor: '#026d7a'
                }
              }
            }
          }}
        >
          <ToggleButton value="price_asc">
            <ArrowUpwardIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
            LOW TO HIGH
          </ToggleButton>
          <ToggleButton value="price_desc">
            <ArrowDownwardIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
            HIGH TO LOW
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={handleSearch}
        disabled={isFetching}
        size="small"
        sx={{
          bgcolor: '#028090',
          '&:hover': { bgcolor: '#026d7a' },
          mt: 1,
          py: 1,
          textTransform: 'none'
        }}
      >
        {isFetching ? 'Searching...' : 'Apply Filters'}
      </Button>
    </Box>
  );
};

export default FilterContent;