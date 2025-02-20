import React, { useState } from 'react';

interface PropertyTypeProps {
  onSelect: (e: string) => void;
}

const properties = [
  { value: "Apartment", label: "Apartment" },
  { value: "Villa", label: "Villa" },
  { value: "Hotel Room", label: "Hotel Room" },
  { value: "Duplex", label: "Duplex" },
];

const PropertyType: React.FC<PropertyTypeProps> = ({ onSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('');

  const handlePropertySelect = (property: string) => {
    onSelect(property);
    setSelectedProperty(property);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative mt-4 pt-0">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="w-full flex gap-3 px-4 py-3 bg-white border border-cyan-700 rounded-lg text-left items-center"
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/d78d5a8f8a4de128e2d6b974c1675ed5c2e46a7f38c8db11cb14ed334f3564cb?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt="property icon"
          className="w-5 h-5"
        />
        <span className="text-zinc-500 text-sm">
          {selectedProperty || 'Property type'}
        </span>
        <span className={`ml-auto transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isDropdownOpen && (
        <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          {properties.map((property) => (
            <div
              key={property.value}
              onClick={() => handlePropertySelect(property.label)}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-zinc-600 first:rounded-t-lg last:rounded-b-lg"
            >
              {property.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyType;
