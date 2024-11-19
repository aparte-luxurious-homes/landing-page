import React from "react";

const LocationInput: React.FC = () => (
  <input
    type="text"
    placeholder="Start typing a location"
    className="w-full p-4 pl-12 border border-gray-300 rounded shadow-md  focus:outline-none focus:border-none"
  />
);

export default LocationInput;