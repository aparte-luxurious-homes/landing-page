'use client';

import React, { useState } from 'react';
import { useNavigate } from '@/lib/router';
import DateInput from '../DateInput';
import PropertyType from './PropertyType';
import GuestCounter from './GuestCounter';
import { filtersToSearchParams } from '../../../utils/searchParams';

interface FilterSearchProps {
  onClose: () => void;
}

const FilterSearch: React.FC<FilterSearchProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [guestCount, setGuestCount] = useState<number>(2);

  const handleSearch = () => {
    // Same `q` contract as the desktop bar. This also settles the old
    // divergence where mobile emitted a singular `location` and desktop a
    // plural `locations`, which SearchResults had to normalise on both sides.
    const params = filtersToSearchParams({
      q: location,
      startDate: checkInDate,
      endDate: checkOutDate,
      propertyTypes: selectedProperty ? [selectedProperty] : [],
      guestCount,
      locations: [],
    });
    navigate(`/search-results?${params.toString()}`);
  };

  return (
    <section className="flex flex-col gap-4 overflow-y-auto h-[60vh] z-10">
      <header className="flex gap-5 justify-between items-center self-stretch text-xl text-zinc-900 mb-1">
        <h2 className="self-start mt-4">Search Aparte</h2>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/34e5bb2f098e96cca571d5a6e9ddef838e9bc973166dffd11f9dc48d7a66ab4e?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt="Close"
          className="object-contain shrink-0 w-11 aspect-square cursor-pointer"
          onClick={onClose}
        />
      </header>
      <input
        type="text"
        placeholder="Try “2 bedroom in Lekki under 150k with a pool”"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full py-4 px-4 bg-white border border-gray-200 rounded-[10px] text-sm focus:outline-none focus:border-cyan-700"
      />
      <DateInput
        onClose={() => {}}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onCheckInDateSelect={(date) => {
          setCheckInDate(date);
          if (date && checkOutDate && date >= checkOutDate) {
            setCheckOutDate(null);
          }
        }}
        onCheckOutDateSelect={setCheckOutDate}
        displayError={(message) => {
          console.error(message);
        }}
        showTwoMonths={false}
      />
      <PropertyType onSelect={(value) => setSelectedProperty(value)} />
      <GuestCounter
        guests={guestCount}
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
        onClick={handleSearch}
        className="px-16 py-2.5 mt-5 text-white bg-cyan-700 rounded-lg w-full"
      >
        Search Aparte
      </button>
    </section>
  );
};

export default FilterSearch;
