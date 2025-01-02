import React from "react";

interface GuestsInputProps {
  adults: number;
  children: number;
  pets: number;
  setAdults: (value: number | ((prev: number) => number)) => void;
  setChildren: (value: number | ((prev: number) => number)) => void;
  setPets: (value: number | ((prev: number) => number)) => void;
}

const GuestsInput: React.FC<GuestsInputProps> = ({ adults, children, pets, setAdults, setChildren, setPets }) => {
  const handleGuestChange = (type: string, change: number) => {
    if (type === "Adults") {
      setAdults((prev: number) => Math.max(0, prev + change));
    } else if (type === "Children") {
      setChildren((prev: number) => Math.max(0, prev + change));
    } else if (type === "Pets") {
      setPets((prev: number) => Math.max(0, prev + change));
    }
  };

  return (
    <div className="relative flex justify-center mt-1">
      <div className="absolute mt-1 w-64 bg-white border border-gray-300 rounded shadow-lg z-10 p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-medium">Adults</span>
            <span className="block text-xs text-gray-500">Ages 15 and above</span>
          </div>
          <div className="flex items-center">
            <button onClick={() => handleGuestChange("Adults", -1)} className="px-2 bg-gray-300 rounded-md">-</button>
            <span className="mx-3 text-gray-400 text-sm">{adults}</span>
            <button onClick={() => handleGuestChange("Adults", 1)} className="px-2 bg-gray-300 rounded-md">+</button>
          </div>
        </div>

        <div className="border-b border-gray-300 my-2"></div>

        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-medium">Children</span>
            <span className="block text-xs text-gray-500">Ages 0-14</span>
          </div>
          <div className="flex items-center">
            <button onClick={() => handleGuestChange("Children", -1)} className="px-2 bg-gray-300 rounded-md">-</button>
            <span className="mx-3 text-gray-400 text-sm">{children}</span>
            <button onClick={() => handleGuestChange("Children", 1)} className="px-2 bg-gray-300 rounded-md">+</button>
          </div>
        </div>

        <div className="border-b border-gray-300 my-2"></div>

        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-medium">Pets</span>
            <span className="block text-xs text-gray-500">Domestic animals</span>
          </div>
          <div className="flex items-center">
            <button onClick={() => handleGuestChange("Pets", -1)} className="px-2 bg-gray-300 rounded-md">-</button>
            <span className="mx-3 text-gray-400 text-sm">{pets}</span>
            <button onClick={() => handleGuestChange("Pets", 1)} className="px-2 bg-gray-300 rounded-md">+</button>
          </div>
        </div>
        
        <div className="border-b border-gray-300 my-2"></div>

        <div className="text-[8px] text-gray-700 mt-2">
          Kindly note that these options are based on the apartment owner's specification.
        </div>
      </div>
    </div>
  );
};

export default GuestsInput;