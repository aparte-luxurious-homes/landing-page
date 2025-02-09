import React, { useState } from 'react';

interface PropertyTypeProps {
  onSelect: (e: string) =>void;
}

const properties = [
  { value: "Apartment", label: "Apartment" },
  { value: "Villa", label: "Villa" },
  { value: "Hotel Room", label: "Hotel Room" },
  { value: "Duplex", label: "Duplex" },
  
];

const PropertyType: React.FC<PropertyTypeProps> = ({  onSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState('');

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handlePropertySelect = (property: string) => {
    onSelect(property);
    setSelectedProperty(property);
    setIsDropdownOpen(false); // Close dropdown after selection
  };

  return (
    <div className="relative">
      {/* Property Type Button */}
      <div
        className="flex gap-7 px-4 py-3 mt-5 rounded-xl bg-zinc-100 cursor-pointer"
        onClick={handleDropdownToggle}
      >
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/10fd403de1f3d214fa9279b784cccb8c471c239e4509affde84a0b93916233d3?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt="property icon"
          className="object-contain shrink-0 self-start aspect-square w-[18px]"
        />
        <button className="basis-auto text-left text-sm">
          {selectedProperty || 'Property type'}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-10 right-0">
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
      )}
    </div>
  );
};

export default PropertyType;
