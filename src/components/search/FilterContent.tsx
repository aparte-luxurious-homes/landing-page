import { TextField, Typography, Button, Box, Radio, FormControlLabel, RadioGroup } from '@mui/material';
import { format } from 'date-fns';
import { FilterContentProps } from '../../types/search';
import DateRangePicker from '../DateRangePicker';

const FilterContent: React.FC<FilterContentProps> = ({
  filters,
  setFilters,
  handleSearch,
  handleAddGuest,
  handleRemoveGuest,
  isFetching
}) => {
  const formatDisplayDate = (date: Date) => {
    return format(new Date(date), 'EEE, dd MMM');
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minCheckOutDate = filters.startDate 
    ? new Date(new Date(filters.startDate).setDate(new Date(filters.startDate).getDate() + 1))
    : new Date(today.setDate(today.getDate() + 1));

  const propertyTypes = ['DUPLEX', 'BUNGALOW', 'VILLA', 'APARTMENT', 'HOTEL', 'OTHERS'];

  return (
    <Box className="flex flex-col divide-y divide-gray-200">
      <Box className="pb-4">
        <Typography variant="h6">
          Search Filter
        </Typography>
      </Box>

      <Box className="py-4">
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
        />
      </Box>

      <Box className="py-4">
        <DateRangePicker
          startDate={filters.startDate}
          endDate={filters.endDate}
          onStartDateChange={(date) => setFilters({ ...filters, startDate: date })}
          onEndDateChange={(date) => setFilters({ ...filters, endDate: date })}
          disabled={isFetching}
        />
      </Box>

      <Box className="py-4">
        <Typography variant="body1" gutterBottom>Property Type</Typography>
        <RadioGroup
          value={filters.propertyType}
          onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
        >
          {propertyTypes.map((type) => (
            <FormControlLabel
              key={type}
              value={type}
              control={<Radio size="small" />}
              label={type.toLowerCase()}
              className="capitalize"
            />
          ))}
        </RadioGroup>
      </Box>

      <Box className="py-4">
        <Typography variant="body1" gutterBottom>Guests</Typography>
        <Box className="flex items-center space-x-2">
          <Button 
            variant="outlined" 
            onClick={handleRemoveGuest} 
            disabled={filters.guestCount <= 1}
          >
            -
          </Button>
          <Typography>{filters.guestCount}</Typography>
          <Button variant="outlined" onClick={handleAddGuest}>+</Button>
        </Box>
      </Box>

      <Box className="pt-4">
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          onClick={handleSearch}
          disabled={isFetching}
        >
          {isFetching ? 'Searching...' : 'Search'}
        </Button>
      </Box>
    </Box>
  );
};

export default FilterContent; 