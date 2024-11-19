import React from "react";
import SearchInput from "./SearchInput";
import DatePicker from "./DatePicker";
import PropertyType from "./PropertyType";
import GuestCounter from "./GuestCounter";

interface FilterSearchProps {
  onClose: () => void; // Add onClose prop
}

const FilterSearch: React.FC<FilterSearchProps> = ({ onClose }) => {
  return (
    <section className="">
      <header className="flex gap-5 justify-between self-stretch text-xl text-zinc-900 mb-4">
        <h2 className="self-start mt-4">Filter Search</h2>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/34e5bb2f098e96cca571d5a6e9ddef838e9bc973166dffd11f9dc48d7a66ab4e?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt="Close"
          className="object-contain shrink-0 w-11 aspect-square cursor-pointer"
          onClick={onClose}
        />
      </header>
      <SearchInput
        placeholder="Search Destination"
        borderRadius="10px"
        py="3"
        iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/bcb37e3d8ecf19fa7b396369e2164a940320256d14fb26a4eedda91f5b84f09c?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
      />
      <DatePicker />
      <PropertyType />
      <GuestCounter />
      <button className="px-16 py-2.5 mt-5 text-white bg-cyan-700 rounded-lg w-full">
        Search Aparte
      </button>
    </section>
  );
};

export default FilterSearch;