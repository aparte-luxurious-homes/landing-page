import React, { useState } from "react";

const PropertyDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("");

  const properties = [
    { value: "Apartment", label: "Apartment" },
    { value: "Villa", label: "Villa" },
    { value: "Hotel Room", label: "Hotel Room" },
    { value: "Duplex", label: "Duplex" },
  ];

  const handleSelect = (property: string) => {
    setSelectedProperty(property);
    setIsOpen(false); // Close dropdown on selection
  };

  return (
    <div className="relative">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-48 p-2 border border-gray-300 rounded bg-white text-left flex justify-between items-center"
      >
        {selectedProperty ? properties.find((p) => p.value === selectedProperty)?.label : "Choose property"}
        <span className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
          {properties.map((property) => (
            <div
              key={property.value}
              onClick={() => handleSelect(property.value)}
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

export default PropertyDropdown;
