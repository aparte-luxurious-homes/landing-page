import React from "react";
import { ToastContainer, toast } from "react-toastify"

interface GuestsInputProps {
  adults: number;
  children: number;
  pets: number;
  maxGuest: number;
  setAdults: (value: number | ((prev: number) => number)) => void;
  setChildren: (value: number | ((prev: number) => number)) => void;
  setPets: (value: number | ((prev: number) => number)) => void;
}

const GuestsInput: React.FC<GuestsInputProps> = ({ adults, children, pets, maxGuest, setAdults, setChildren, setPets }) => {
  const handleGuestChange = (type: string, change: number) => {
    setAdults((prevAdults) => {
      const newAdults = type === "Adults" ? Math.max(0, prevAdults + change) : prevAdults;
      const newChildren = type === "Children" ? Math.max(0, children + change) : children;
      const newPets = type === "Pets" ? Math.max(0, pets + change) : pets;

      const totalGuests = newAdults + newChildren + newPets;

      if (totalGuests > maxGuest) {
        toast.info(`Total guests cannot exceed ${maxGuest}`);
        return prevAdults; 
      }

      setChildren(newChildren);
      setPets(newPets);

      return newAdults;
    });
  };
  

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation(); 
  };

  return (
    <div className="relative flex justify-center mt-1">
      <div
        className="absolute mt-1 w-64 bg-white border border-gray-300 rounded shadow-lg z-10 p-4"
        onClick={stopPropagation} 
      >
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-medium">Adults</span>
            <span className="block text-xs text-gray-500">Ages 15 and above</span>
          </div>
          <div className="flex items-center">
            <button
              onClick={(e) => {
                stopPropagation(e);
                handleGuestChange("Adults", -1);
              }}
              className="px-2 bg-gray-300 rounded-md"
            >
              -
            </button>
            <span className="mx-3 text-gray-400 text-sm">{adults}</span>
            <button
              onClick={(e) => {
                stopPropagation(e);
                handleGuestChange("Adults", 1);
              }}
              className="px-2 bg-gray-300 rounded-md"
            >
              +
            </button>
          </div>
        </div>

        <div className="border-b border-gray-300 my-2"></div>

        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-medium">Children</span>
            <span className="block text-xs text-gray-500">Ages 0-14</span>
          </div>
          <div className="flex items-center">
            <button
              onClick={(e) => {
                stopPropagation(e);
                handleGuestChange("Children", -1);
              }}
              className="px-2 bg-gray-300 rounded-md"
            >
              -
            </button>
            <span className="mx-3 text-gray-400 text-sm">{children}</span>
            <button
              onClick={(e) => {
                stopPropagation(e);
                handleGuestChange("Children", 1);
              }}
              className="px-2 bg-gray-300 rounded-md"
            >
              +
            </button>
          </div>
        </div>

        <div className="border-b border-gray-300 my-2"></div>

        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="font-medium">Pets</span>
            <span className="block text-xs text-gray-500">Domestic animals</span>
          </div>
          <div className="flex items-center">
            <button
              onClick={(e) => {
                stopPropagation(e);
                handleGuestChange("Pets", -1);
              }}
              className="px-2 bg-gray-300 rounded-md"
            >
              -
            </button>
            <span className="mx-3 text-gray-400 text-sm">{pets}</span>
            <button
              onClick={(e) => {
                stopPropagation(e);
                handleGuestChange("Pets", 1);
              }}
              className="px-2 bg-gray-300 rounded-md"
            >
              +
            </button>
          </div>
        </div>

        <div className="border-b border-gray-300 my-2"></div>

        <div className="text-[8px] text-gray-700 mt-2">
          Kindly note that these options are based on the apartment owner's specification.
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default GuestsInput;
