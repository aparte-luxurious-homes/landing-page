import React, { useState, useEffect } from 'react';
import { Marker } from 'react-leaflet';
import { useAppDispatch } from '../../hooks';
import { setApartmentAddress } from '../../features/property/propertySlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Switch, TextField, MenuItem, InputAdornment } from '@mui/material';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import 'leaflet/dist/leaflet.css';

const ListFlow4: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: any }> = ({ onNext, onBack, formData, setFormData }) => {
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
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (useCurrentLocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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

  const handleToggleLocation = () => {
    if (!useCurrentLocation) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("Location Access", {
              body: "Please enable location services to use this feature.",
            });
          }
        });
      }
    }
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
    if(manualAddress){
      dispatch(setApartmentAddress({
        country: address.country,
        state: address.state,
        city: address.city,
        street: address.street,
        zip_code: address.postalCode
      }))
    }
    onNext();
  };

  const handleBack = () => {
    setUseCurrentLocation(false);
    setManualAddress(false);
    onBack();
  };

  return (
    <div className="flex flex-col items-center h-full py-20 md:py-32">
      <div className="flex flex-col items-center max-w-2xl w-full px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl text-center font-medium text-black mb-4">
          What's your apartment's address?
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-md mb-8">
          Help potential tenants find your property easily with an accurate address
        </p>

        {!useCurrentLocation && !manualAddress && (
          <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-black mb-2">Use my current location</h3>
                  <p className="text-sm text-gray-600">Let us detect your location automatically</p>
                </div>
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
                  }}
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 bg-white">or</span>
              </div>
            </div>

            <button
              onClick={handleManualAddress}
              className="w-full p-6 text-center bg-white rounded-lg border-2 border-gray-200 hover:border-[#028090] transition-colors"
            >
              <h3 className="text-lg font-medium text-black mb-2">Enter address manually</h3>
              <p className="text-sm text-gray-600">Type in your property's address details</p>
            </button>
          </div>
        )}

        {useCurrentLocation && (
          <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <h3 className="text-lg font-medium text-black mb-3">Select precise location</h3>
              <p className="text-sm text-gray-600 mb-4">
                Drag the marker to pinpoint your property's exact location
              </p>
              <div className="w-full h-[400px] rounded-lg overflow-hidden">
                <MapContainer 
                  center={location} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <DraggableMarker />
                </MapContainer>
              </div>
            </div>
          </div>
        )}

        {manualAddress && (
          <div className="w-full space-y-6">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
              <h3 className="text-lg font-medium text-black mb-4">Enter address details</h3>
              
              <div className="space-y-4">
                <TextField
                  select
                  label="Country/Region"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicIcon className="text-gray-500" />
                      </InputAdornment>
                    ),
                  }}
                >
                  <MenuItem value="Nigeria">Nigeria</MenuItem>
                  <MenuItem value="Kenya">Kenya</MenuItem>
                  <MenuItem value="Ghana">Ghana</MenuItem>
                </TextField>

                <TextField
                  label="Street Address"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon className="text-gray-500" />
                      </InputAdornment>
                    ),
                  }}
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextField
                    label="City"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    fullWidth
                    variant="outlined"
                  />
                  <TextField
                    label="State"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    fullWidth
                    variant="outlined"
                  />
                </div>

                <TextField
                  label="Postal Code"
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  fullWidth
                  variant="outlined"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between w-full mt-8">
          <button
            className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={handleBack}
          >
            <ArrowBackIcon className="mr-2" />
            Back
          </button>
          <button
            className={`flex items-center px-14 py-2 rounded-md ${
              (useCurrentLocation || (manualAddress && Object.values(address).every(val => val))) 
                ? 'bg-[#028090] text-white hover:bg-[#026f7a]' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleNext}
            disabled={!useCurrentLocation && (!manualAddress || !Object.values(address).every(val => val))}
          >
            Continue
            <ArrowForwardIcon className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListFlow4;