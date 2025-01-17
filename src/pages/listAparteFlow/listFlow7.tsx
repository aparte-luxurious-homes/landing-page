import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Switch, TextField, Button, MenuItem, InputAdornment } from '@mui/material';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { Marker } from 'react-leaflet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import 'leaflet/dist/leaflet.css';

const ListFlow7: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: any }> = ({ onNext, onBack, formData, setFormData }) => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState(false);
  const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });
  const [address, setAddress] = useState({
    country: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    if (useCurrentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location obtained:", position);
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Unable to retrieve your location. Please enable location services and try again.");
        },
        { enableHighAccuracy: true }
      );
    }
  }, [useCurrentLocation]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("Location Access", {
            body: "Please enable location services to use this feature.",
          });
        }
      });
    }
  }, []);

  const handleToggleLocation = () => {
    setUseCurrentLocation(!useCurrentLocation);
    setManualAddress(false);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setFormData({ ...formData, address: { ...address, [e.target.name]: e.target.value } });
  };

  const handleManualAddress = () => {
    setManualAddress(true);
    setUseCurrentLocation(false);
  };

  const DraggableMarker = () => {
    const [position, setPosition] = useState(location);

    useMapEvents({
      dragend(event: { target: any }) {
        const marker = event.target;
        const newPosition = marker.getLatLng();
        setPosition(newPosition);
        setLocation(newPosition);
      },
    });

    return <Marker position={position} draggable eventHandlers={{ dragend: (event: { target: any; }) => {
      const marker = event.target;
      const newPosition = marker.getLatLng();
      setPosition(newPosition);
      setLocation(newPosition);
    }}} />;
  };

  const handleNext = () => {
    onNext();
  };

  const handleBack = () => {
    setUseCurrentLocation(false);
    setManualAddress(false);
    onBack();
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6">
      <h1 className="text-3xl md:text-3xl text-center font-medium text-black mb-6 md:mb-6">
        What's your apartment's address?
      </h1>

      {!useCurrentLocation && !manualAddress && (
        <div className="flex items-center justify-between w-full max-w-xs mb-10">
          <p className="text-lg text-gray-700">Use my current location</p>
          <Switch
            checked={useCurrentLocation}
            onChange={handleToggleLocation}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#028090',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: '#028090',
              },
              '& .MuiSwitch-track': {
                backgroundColor: '#bdbdbd',
              },
            }}
            inputProps={{ 'aria-label': 'Use current location toggle' }}
          />
        </div>
      )}

      {useCurrentLocation && (
        <>
          <h1 className="text-lg font-medium text-center text-black mb-2">
            Select precise location on the map
          </h1>
          <p className="text-sm text-gray-600 text-center max-w-md mb-6">
            Pinpoint the exact location of your property on the map to enhance accuracy and visibility.
          </p>
          <div className="w-full max-w-xl mb-8">
            <div className="w-full h-80 bg-gray-200 rounded-lg flex flex-col justify-center items-center">
              <MapContainer whenReady={() => {}} style={{ height: '330px', width: '100%', borderRadius: '15px' }} ref={(map) => map && map.setView(location, 13)}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker />
              </MapContainer>
            </div>
          </div>
        </>
      )}

      {!useCurrentLocation && !manualAddress && (
        <>
          <p className="text-lg text-gray-700 mb-4">or</p>
          <Button
            onClick={handleManualAddress}
            variant="outlined"
            className="text-[#028090] border-[#028090] hover:bg-[#e5f6f5] w-full max-w-xs mb-4"
          >
            Enter address manually
          </Button>
        </>
      )}

      {manualAddress && (
        <div className="w-full max-w-2xl mt-6 p-6 bg-white rounded-lg shadow-md">
          <TextField
            select
            label="Country/Region"
            name="country"
            value={address.country}
            onChange={handleAddressChange}
            fullWidth
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PublicIcon />
                </InputAdornment>
              ),
            }}
            sx={{ marginBottom: '16px' }}
          >
            <MenuItem value="Nigeria">Nigeria</MenuItem>
            <MenuItem value="Kenya">Kenya</MenuItem>
            <MenuItem value="Ghana">Ghana</MenuItem>
          </TextField>
          <TextField
            label="Street"
            name="street"
            value={address.street}
            onChange={handleAddressChange}
            fullWidth
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="City/Province"
            name="city"
            value={address.city}
            onChange={handleAddressChange}
            fullWidth
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="State"
            name="state"
            value={address.state}
            onChange={handleAddressChange}
            fullWidth
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Postal Code"
            name="postalCode"
            value={address.postalCode}
            onChange={handleAddressChange}
            fullWidth
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
      )}

      <div className="flex justify-between w-full max-w-2xl mt-8">
        <button
          className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          onClick={handleBack}
        >
          <ArrowBackIcon className="mr-2" />
          Back
        </button>
        {(useCurrentLocation || manualAddress) && (
          <button
            className="flex items-center px-14 py-2 bg-[#028090] text-white rounded-md hover:bg-[#026f7a]"
            onClick={handleNext}
            disabled={
              manualAddress &&
              (!address.country ||
                !address.street ||
                !address.city ||
                !address.state ||
                !address.postalCode)
            }
          >
            Continue
            <ArrowForwardIcon className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ListFlow7;