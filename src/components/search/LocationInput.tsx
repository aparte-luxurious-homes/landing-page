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
      className="w-full py-3 px-4 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none focus:border-cyan-700"
      value={value}
      onChange={onChange}
    />
    <button
      type="button"
      className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
      onClick={onClose}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  </div>
);

export default LocationInput;