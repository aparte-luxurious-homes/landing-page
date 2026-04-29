import React, { useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useAppDispatch } from '../../hooks';
import { setApartmentAddress } from '../../features/property/propertySlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Switch, TextField, InputAdornment } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { AparteFormData } from '~/pages/ListApartePage';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface ListFlow4Props {
  onNext: () => void;
  onBack: () => void;
  formData: AparteFormData;
  setFormData: React.Dispatch<React.SetStateAction<AparteFormData>>;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries: any = ["places"];

const ListFlow4: React.FC<ListFlow4Props> = ({ onNext, onBack, formData, setFormData }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries
  });
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState({ lat: 6.5244, lng: 3.3792 }); // Lagos default
  const [selectedAddress, setSelectedAddress] = useState({
    country: 'Nigeria',
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
      types: ['address'],
      // Country locked to Nigeria — Google only returns NG suggestions.
      componentRestrictions: { country: 'ng' },
    }
  });

  // City fallback chain: Nigerian addresses often omit `locality` and surface
  // the city under `administrative_area_level_2` or `sublocality_*` instead.
  const extractCity = (components: AddressComponent[]) =>
    getAddressComponent(components, 'locality') ||
    getAddressComponent(components, 'administrative_area_level_2') ||
    getAddressComponent(components, 'sublocality_level_1') ||
    getAddressComponent(components, 'sublocality') ||
    getAddressComponent(components, 'postal_town');

  const handleSelect = async (description: string) => {
    setValue(description, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);

      const addressComponents = results[0].address_components;
      const addressData = {
        street: `${getAddressComponent(addressComponents, 'street_number')} ${getAddressComponent(addressComponents, 'route')}`.trim(),
        city: extractCity(addressComponents),
        state: getAddressComponent(addressComponents, 'administrative_area_level_1'),
        // Country is locked to Nigeria for this platform — never read from Google.
        country: 'Nigeria',
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

  const handleMapClick = async (newLocation: { lat: number, lng: number }) => {
    setLocation(newLocation);
    try {
      const results = await getGeocode({ location: { lat: newLocation.lat, lng: newLocation.lng } });
      if (results[0]) {
        const addressComponents = results[0].address_components;
        const addressData = {
          street: `${getAddressComponent(addressComponents, 'street_number')} ${getAddressComponent(addressComponents, 'route')}`.trim(),
          city: extractCity(addressComponents),
          state: getAddressComponent(addressComponents, 'administrative_area_level_1'),
          // Country is locked to Nigeria — never read from Google.
          country: 'Nigeria',
          postalCode: getAddressComponent(addressComponents, 'postal_code'),
        };
        setSelectedAddress(addressData);
        setFormData({ ...formData, address: addressData });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
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
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ height: '100%', width: '100%' }}
                center={location}
                zoom={15}
                onClick={(e) => {
                  if (e.latLng) {
                    handleMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                  }
                }}
              >
                <Marker
                  position={location}
                  draggable
                  onDragEnd={(e) => {
                    if (e.latLng) {
                      handleMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
                    }
                  }}
                />
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                Loading map...
              </div>
            )}
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
            className={`flex items-center px-14 py-2 rounded-md ${isAddressValid
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