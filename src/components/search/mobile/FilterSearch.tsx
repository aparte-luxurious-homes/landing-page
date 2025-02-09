import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchInput from './SearchInput';
import DatePicker from './DatePicker';
import PropertyType from './PropertyType';
import GuestCounter from './GuestCounter';

interface FilterSearchProps {
  onClose: () => void;
}

const FilterSearch: React.FC<FilterSearchProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [guestCount, setGuestCount] = useState<number>(1);

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
        onInput={(e) => {
          setLocation(e.currentTarget.value);
        }}
        placeholder="Search Destination"
        borderRadius="10px"
        py="3"
        iconSrc="https://cdn.builder.io/api/v1/image/assets/TEMP/bcb37e3d8ecf19fa7b396369e2164a940320256d14fb26a4eedda91f5b84f09c?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
      />
      <DatePicker
        onCheckInDateSelect={(date) => {
          setCheckInDate(date);
          setCheckOutDate(null);
        }}
        onCheckOutDateSelect={(date) => {
          setCheckOutDate(date);
        }}
      />
      <PropertyType onSelect={(value) => setSelectedProperty(value)} />
      <GuestCounter
        onAction={(action) => {
          if (action === 'increment') {
            setGuestCount(guestCount + 1);
          } else {
            if (guestCount > 1) {
              setGuestCount(guestCount - 1);
            }
          }
        }}
      />
      <button
        onClick={() => {
          const searchTerms = {
            searchTerm: location,
            location,
            startDate: checkInDate,
            endDate: checkOutDate,
            propertyType: selectedProperty,
            guestCount,
          };
          navigate('/search-results', {
            state: Object.fromEntries(
              Object.entries(searchTerms).filter(([_, v]) => v)
            ),
          });
        }}
        className="px-16 py-2.5 mt-5 text-white bg-cyan-700 rounded-lg w-full"
      >
        Search Aparte
      </button>
    </section>
  );
};

export default FilterSearch;
