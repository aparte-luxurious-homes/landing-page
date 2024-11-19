import React from "react";

const PropertyDropdown: React.FC = () => (
  <select className="w-full p-2 border border-gray-300 rounded">
    <option value="">Choose property</option>
    <option value="apartment">Apartment</option>
    <option value="house">House</option>
    <option value="villa">Villa</option>
  </select>
);

export default PropertyDropdown;
