import React, { useState } from "react";
import { format } from "date-fns";
import SearchBarItem from "./SearchBarItem";
import Divider from "./Divider";
import LocationInput from "./LocationInput";
import DateInput from "./DateInput";
import GuestsInput from "./GuestsInput";
import SearchButton from "./SearchButton";

const searchBarData = [
  { label: "Location", value: "Search destination" },
  { label: "Check in", value: "Select date" },
  { label: "Check out", value: "Select date" },
  { label: "Property", value: "Choose property" },
  { label: "Guests", value: "Add Guests" },
];

const properties = [
  { value: "Apartment", label: "Apartment" },
  { value: "Villa", label: "Villa" },
  { value: "Hotel Room", label: "Hotel Room" },
  { value: "Duplex", label: "Duplex" },
];

const LargeSearchBar: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [selectedProperty, setSelectedProperty] = useState("");

  const handleItemClick = (label: string) => {
    setActiveItem((prev) => (prev === label ? null : label));
  };

  const handleClose = () => {
    setActiveItem(null);
  };

  const handleDateSelect = (date: Date) => {
    if (activeItem === "Check in") {
      setCheckInDate(date);
      setActiveItem("Check out");
    } else if (activeItem === "Check out") {
      setCheckOutDate(date);
      handleClose();
    }
  };

  const handlePropertySelect = (property: string) => {
    setSelectedProperty(property);
    handleClose(); // Close the dropdown after selection
  };

  return (
    <section className="flex flex-col font-medium">
      <div className="px-16 py-4 max-w-full text-base text-center text-white bg-cyan-700 rounded-lg rounded-bl-none rounded-br-none w-[251px] max-md:px-5">
        Search Aparte
      </div>
      <form
        className="relative flex flex-col font-medium"
        role="search"
        onSubmit={(e) => e.preventDefault()} // Prevent page reload
      >
        <div className="flex flex-nowrap gap-5 justify-between items-center py-3 pr-3 pl-12 w-full bg-white border border-cyan-700 border-solid shadow-2xl rounded-[10px] rounded-tl-none max-md:pl-5 max-md:max-w-full overflow-x-auto">
          <div className="flex items-center my-auto max-md:max-w-full">
            {searchBarData.map((item, index) => (
              <React.Fragment key={item.label}>
                <SearchBarItem
                  label={item.label}
                  value={
                    item.label === "Check in" && checkInDate
                      ? format(checkInDate, "MM/dd/yyyy")
                      : item.label === "Check out" && checkOutDate
                      ? format(checkOutDate, "MM/dd/yyyy")
                      : item.label === "Property" && selectedProperty
                      ? selectedProperty
                      : item.value
                  }
                  onClick={() => handleItemClick(item.label)}
                  isActive={activeItem === item.label}
                  className="text-sm md:text-[5px]"
                />
                {index < searchBarData.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </div>
          <SearchButton />
        </div>
        <div className="absolute top-full left-0 w-full z-40">
          {activeItem === "Location" && <LocationInput />}
          {activeItem === "Check in" && (
            <DateInput onClose={handleClose} onDateSelect={handleDateSelect} />
          )}
          {activeItem === "Check out" && (
            <DateInput onClose={handleClose} onDateSelect={handleDateSelect} />
          )}
          {activeItem === "Property" && (
            <div className="relative flex justify-center mt-1">
              <div className="absolute mt-1 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
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
            </div>
          )}
          {activeItem === "Guests" && <GuestsInput />}
        </div>
      </form>
    </section>
  );
};

export default LargeSearchBar;