import React, { useState } from 'react';
import { Marker } from 'react-leaflet';
import { useAppDispatch } from '../../hooks';
import { setApartmentAddress } from '../../features/property/propertySlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Switch, TextField, InputAdornment } from '@mui/material';
import { MapContainer, TileLayer } from 'react-leaflet';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

interface FormData {
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

const ListFlow4: React.FC<{
  onNext: () => void;
  onBack: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
}> = ({ onNext, onBack, formData, setFormData }) => {
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });
  const [selectedAddress, setSelectedAddress] = useState({
    country: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [isAddressValid, setIsAddressValid] = useState(false);

  const dispatch = useAppDispatch();

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    requestOptions: {
      types: ['address']
    }
  });

  const handleSelect = async (description: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      
      const addressComponents = results[0].address_components;
      const addressData = {
        street: `${getAddressComponent(addressComponents, 'street_number')} ${getAddressComponent(addressComponents, 'route')}`,
        city: getAddressComponent(addressComponents, 'locality'),
        state: getAddressComponent(addressComponents, 'administrative_area_level_1'),
        country: getAddressComponent(addressComponents, 'country'),
        postalCode: getAddressComponent(addressComponents, 'postal_code'),
      };

      // Only set address as valid if we have the minimum required fields
      const isValid = Boolean(
        addressData.street.trim() && 
        addressData.city.trim() && 
        addressData.state.trim() && 
        addressData.country.trim()
      );

      setIsAddressValid(isValid);
      console.log('Selected Address Details:', addressData);
      
      setSelectedAddress(addressData);
      setLocation({ lat, lng });
      setFormData({ ...formData, address: addressData });
    } catch (error) {
      console.error('Error: ', error);
      setIsAddressValid(false);
    }
  };

  const getAddressComponent = (components: AddressComponent[], type: string) => {
    const component = components.find(c => c.types.includes(type));
    return component ? component.long_name : '';
  };

  const handleMapClick = (newLocation: { lat: number, lng: number }) => {
    setLocation(newLocation);
    // Reverse geocode the coordinates to get address
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${newLocation.lat},${newLocation.lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`)
      .then(response => response.json())
      .then(data => {
        if (data.results[0]) {
          const addressComponents = data.results[0].address_components;
          const addressData = {
            street: `${getAddressComponent(addressComponents, 'street_number')} ${getAddressComponent(addressComponents, 'route')}`,
            city: getAddressComponent(addressComponents, 'locality'),
            state: getAddressComponent(addressComponents, 'administrative_area_level_1'),
            country: getAddressComponent(addressComponents, 'country'),
            postalCode: getAddressComponent(addressComponents, 'postal_code'),
          };
          console.log('Map Selected Address:', addressData);
          setSelectedAddress(addressData);
          setFormData({ ...formData, address: addressData });
        }
      });
  };

  return (
    <div className="flex flex-col items-center h-full py-20 md:py-32">
      <div className="flex flex-col items-center max-w-2xl w-full px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl text-center font-medium text-black mb-4">
          What's your apartment's address?
        </h1>
        
        {/* Autocomplete Input */}
        <div className="w-full mb-6">
          <TextField
            fullWidth
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter your address"
            disabled={!ready}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {/* Suggestions Dropdown */}
          {status === "OK" && (
            <ul className="mt-2 border rounded-md shadow-lg bg-white">
              {data.map((suggestion) => (
                <li
                  key={suggestion.place_id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(suggestion.description)}
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fine-tune on Map Toggle */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <h3 className="text-lg font-medium">Fine-tune location on map</h3>
              <p className="text-sm text-gray-600">Adjust the pin to mark exact location</p>
            </div>
            <Switch
              checked={showMap}
              onChange={() => setShowMap(!showMap)}
            />
          </div>
        </div>

        {/* Map Section */}
        {showMap && (
          <div className="w-full h-[400px] rounded-lg overflow-hidden border">
            <MapContainer
              center={[location.lat, location.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker
                position={[location.lat, location.lng]}
                draggable
                eventHandlers={{
                  dragend: (e) => handleMapClick(e.target.getLatLng()),
                }}
              />
            </MapContainer>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between w-full mt-8">
          <button
            className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={onBack}
          >
            <ArrowBackIcon className="mr-2" />
            Back
          </button>
          <button
            className={`flex items-center px-14 py-2 rounded-md ${
              isAddressValid
                ? 'bg-[#028090] text-white hover:bg-[#026f7a]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={() => {
              dispatch(setApartmentAddress({
                ...selectedAddress,
                zip_code: selectedAddress.postalCode
              }));
              onNext();
            }}
            disabled={!isAddressValid}
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