import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import SearchBarItem from './SearchBarItem';
import Divider from './Divider';
import LocationInput from './LocationInput';
import DateInput from './DateInput';
import SearchButton from './SearchButton';
import Grid from '@mui/material/Grid2';
import { Typography, Button, Box } from '@mui/material';

const searchBarData = [
  { label: 'Location', value: 'Search destination' },
  { label: 'Check in', value: 'Select date' },
  { label: 'Check out', value: 'Select date' },
  { label: 'Property', value: 'Choose property' },
  { label: 'Guests', value: 'Add Guests' },
];

const properties = [
  { value: 'hotel-room', label: 'Hotel Room' },
  { value: 'bungalow', label: 'Bungalow' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'villas', label: ' Villas' },
  { value: 'apartments', label: 'Apartments' },
];

const LargeSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date>(addDays(new Date(), 2));
  const [selectedProperty, setSelectedProperty] = useState('');
  const [guestCount, setGuestCount] = useState<number>(2);

  const handleItemClick = (label: string) => {
    setActiveItem((prev) => (prev === label ? null : label));
  };

  const handleClose = () => {
    setActiveItem(null);
  };

  const handleDateSelect = (date: Date) => {
    console.log('datedate', date);
    if (activeItem === 'Check in') {
      setCheckInDate(date);
      setCheckOutDate(null);
      setActiveItem('Check out');
    } else if (activeItem === 'Check out') {
      setCheckOutDate(date);
      handleClose();
    }
  };

  const handlePropertySelect = (property: string) => {
    setSelectedProperty(property);
    handleClose();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchTerms = {
      searchTerm: location,
      location,
      startDate: checkInDate,
      endDate: checkOutDate,
      propertyType: selectedProperty,
      guestCount,
    };
    navigate('/search-results', {
      state: Object.fromEntries(
        Object.entries(searchTerms).filter(([_, v]) => v)
      ),
    });
  };

  const handleAddGuest = () => {
    setGuestCount((prevCount) => prevCount + 1);
  };

  const handleRemoveGuest = () => {
    setGuestCount((prevCount) => (prevCount > 1 ? prevCount - 1 : 1));
  };

  return (
    <section className="flex flex-col font-medium">
      <div className="px-16 py-2.5 max-w-full text-base text-center text-white bg-cyan-700 rounded-lg rounded-bl-none rounded-br-none w-[251px] max-md:px-5">
        Search Aparte
      </div>
      <form className="relative flex flex-col font-medium" role="search">
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          className="py-4 pl-6 xl:pl-28 w-full bg-white border border-cyan-700 border-solid shadow-2xl rounded-[10px] rounded-tl-none max-md:pl-5 max-md:max-w-full overflow-x-auto"
        >
          {searchBarData.map((item, index) => (
            <React.Fragment key={item.label}>
              <Grid
                size={{ xs: 12, sm: 6, md: 2, lg: 2 }}
                style={{ marginRight: '8px' }}
              >
                <SearchBarItem
                  label={item.label}
                  value={
                    item.label === 'Location' && location
                      ? location
                      : item.label === 'Check in' && checkInDate
                      ? format(checkInDate, 'EEE, dd MMM')
                      : item.label === 'Check out' && checkOutDate
                      ? format(checkOutDate, 'EEE, dd MMM')
                      : item.label === 'Property' && selectedProperty
                      ? selectedProperty
                      : item.label === 'Guests' && guestCount > 0
                      ? `${guestCount} Guests`
                      : item.value
                  }
                  onClick={() => handleItemClick(item.label)}
                  isActive={activeItem === item.label}
                />
              </Grid>
              {index < searchBarData.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          <SearchButton onClick={handleSearch} />
        </Grid>
        <div className="absolute top-full left-0 w-full z-40">
          {activeItem === 'Location' && (
            <LocationInput
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onClose={handleClose}
            />
          )}
          {activeItem === 'Check in' && (
            <DateInput onClose={handleClose} onDateSelect={handleDateSelect} />
          )}
          {activeItem === 'Check out' && (
            <DateInput onClose={handleClose} onDateSelect={handleDateSelect} />
          )}
          {activeItem === 'Property' && (
            <div className="relative flex justify-center mt-1">
              <div
                className="absolute mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-10"
                style={{ left: '63%', transform: 'translateX(-52%)' }}
              >
                {properties.map((property) => (
                  <div
                    key={property.value}
                    onClick={() => handlePropertySelect(property.label)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {property.label}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeItem === 'Guests' && (
            <div className="relative flex justify-center mt-0">
              <div
                className="absolute mt-2 z-10"
                style={{ left: '82%', transform: 'translateX(-50%)' }}
              >
                <Box display="flex" alignItems="center">
                  <Button
                    variant="outlined"
                    onClick={handleRemoveGuest}
                    disabled={guestCount <= 1}
                  >
                    -
                  </Button>
                  <Typography variant="body1" sx={{ margin: '0 10px' }}>
                    {guestCount}
                  </Typography>
                  <Button variant="outlined" onClick={handleAddGuest}>
                    +
                  </Button>
                </Box>
              </div>
            </div>
          )}
        </div>
      </form>
    </section>
  );
};

export default LargeSearchBar;
