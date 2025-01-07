import React from "react";

interface LocationInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  

}

const LocationInput: React.FC<LocationInputProps> = ({ value, onChange, onClose }) => (
  <div className="relative">
    <input
      type="text"
      placeholder="Start typing a location"
      className="w-full p-4 border border-gray-300 rounded shadow-md focus:outline-none focus:border-none"
      value={value}
      onChange={onChange}
    />
    <button
      type="button"
      className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
      onClick={onClose}
    >
      X
    </button>
  </div>
);

export default LocationInput;