import React, { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Switch, Button, TextField, MenuItem } from "@mui/material";

const ListFlow7: React.FC<{
  onBack: () => void;
  onNext: () => void;
  formData: any;
  setFormData: any;
}> = ({ onBack, onNext, formData, setFormData }) => {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState(false);

  // Form state for manual address
  const [address, setAddress] = useState({
    country: formData.country || "",
    street: formData.street || "",
    city: formData.city || "",
    state: formData.state || "",
    postalCode: formData.postalCode || "",
  });

  // Handle toggle for current location
  const handleToggleLocation = () => {
    setUseCurrentLocation(!useCurrentLocation);
  };

  // Handle manual address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setFormData((prev: any) => ({ ...prev, [name]: value })); // Persist to formData
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6">
      {/* Header */}
      <h1 className="text-3xl md:text-2xl text-center text-black mb-2 md:mb-2">
        What's your apartment's address?
      </h1>

      {/* Use Current Location Section */}
      <div className="flex items-center justify-between w-full max-w-2xl mb-8">
        <p className="text-lg text-gray-700">Use my current location</p>
        <Switch
          checked={useCurrentLocation}
          onChange={handleToggleLocation}
          color="default"
          inputProps={{ "aria-label": "Use current location toggle" }}
        />
      </div>

      {/* Map Section */}
      {useCurrentLocation && (
        <div className="w-full max-w-2xl mb-8">
          <div className="w-full h-64 bg-gray-200 rounded-lg flex flex-col justify-center items-center">
            {/* Map Placeholder */}
            <p className="text-lg font-medium">Select precise location on the map</p>
            <p className="text-sm text-gray-600 text-center max-w-md mt-2">
              Pinpoint the exact location of your property on the map to enhance
              accuracy and visibility.
            </p>
            {/* Placeholder for map integration */}
            <div className="w-full h-48 bg-gray-300 rounded-lg mt-4"></div>
          </div>
        </div>
      )}

      {/* Manual Address Entry Button */}
      {!manualAddress && (
        <Button
          onClick={() => setManualAddress(true)}
          variant="outlined"
          className="text-[#028090] border-[#028090] hover:bg-[#e5f6f5] w-full max-w-2xl"
        >
          Enter address manually
        </Button>
      )}

      {/* Manual Address Inputs */}
      {manualAddress && (
        <div className="w-full max-w-2xl mt-6 p-4 bg-white rounded-lg shadow-md">
          {/* Country/Region */}
          <TextField
            select
            label="Country/Region"
            name="country"
            value={address.country}
            onChange={handleAddressChange}
            fullWidth
            variant="outlined"
            margin="normal"
          >
            <MenuItem value="USA">United States</MenuItem>
            <MenuItem value="Canada">Canada</MenuItem>
            <MenuItem value="UK">United Kingdom</MenuItem>
            {/* Add more countries as needed */}
          </TextField>

          {/* Street */}
          <TextField
            label="Street"
            name="street"
            value={address.street}
            onChange={handleAddressChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />

          {/* City/Province */}
          <TextField
            label="City/Province"
            name="city"
            value={address.city}
            onChange={handleAddressChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />

          {/* State */}
          <TextField
            label="State"
            name="state"
            value={address.state}
            onChange={handleAddressChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />

          {/* Postal Code */}
          <TextField
            label="Postal Code"
            name="postalCode"
            value={address.postalCode}
            onChange={handleAddressChange}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between w-full max-w-2xl mt-8">
        {/* Back Button */}
        <button
          className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          onClick={onBack}
        >
          <ArrowBackIcon className="mr-2" />
          Back
        </button>

        {/* Continue Button (only visible when a method is selected) */}
        {(useCurrentLocation || manualAddress) && (
          <button
            className="flex items-center px-14 py-2 bg-[#028090] text-white rounded-md hover:bg-[#026f7a]"
            onClick={onNext}
            disabled={
              manualAddress &&
              (!address.country ||
                !address.street ||
                !address.city ||
                !address.state ||
                !address.postalCode)
            } // Disable if manual fields are incomplete
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default ListFlow7;
