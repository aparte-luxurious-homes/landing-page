'use client';

import React from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate } from '@/lib/router';
import DateInput from '../DateInput';
import PropertyType from './PropertyType';
import GuestCounter from './GuestCounter';
import { filtersToSearchParams } from '../../../utils/searchParams';
import { useSearchDraft } from '@/components/home/searchContext';
import { trackEvent } from '@/analytics';
import { trackPropertySearched } from '@/lib/mixpanel/track';

interface FilterSearchProps {
  onClose: () => void;
}

const FilterSearch: React.FC<FilterSearchProps> = ({ onClose }) => {
  const navigate = useNavigate();
  // Shares the homepage draft, so what a guest typed here is still there if
  // they reopen the sheet.
  const [draft, setDraft] = useSearchDraft();
  const { location, checkIn, checkOut, propertyType, guests } = draft;

  const patch = (next: Partial<typeof draft>) =>
    setDraft((prev) => ({ ...prev, ...next }));

  const handleSearch = () => {
    // Same `q` contract as the desktop bar. This also settles the old
    // divergence where mobile emitted a singular `location` and desktop a
    // plural `locations`, which SearchResults had to normalise on both sides.
    const filters = {
      q: location,
      startDate: checkIn,
      endDate: checkOut,
      propertyTypes: propertyType ? [propertyType] : [],
      guestCount: guests,
      locations: [],
    };
    const params = filtersToSearchParams(filters);

    // Two destinations, deliberately: Mixpanel carries the product-analytics
    // event (with the search text), GA4 the web-analytics one (counts and
    // booleans only).
    trackPropertySearched(filters);
    trackEvent('search_submit', {
      source: 'mobile_modal',
      has_query: Boolean(location.trim()),
      has_dates: Boolean(checkIn && checkOut),
      guests,
      property_type: propertyType || 'any',
    });

    onClose();
    navigate(`/search-results?${params.toString()}`);
  };

  return (
    <section className="z-10 flex h-[60vh] flex-col gap-4 overflow-y-auto">
      <header className="mb-1 flex items-center justify-between gap-5 self-stretch text-xl text-zinc-900">
        <h2 className="mt-4 self-start">Search Aparte</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search"
          className="shrink-0 rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <CloseRoundedIcon />
        </button>
      </header>
      <input
        type="text"
        placeholder="Try “2 bedroom in Lekki under 150k with a pool”"
        value={location}
        onChange={(e) => patch({ location: e.target.value })}
        className="w-full rounded-[10px] border border-gray-200 bg-white px-4 py-4 text-sm focus:border-cyan-700 focus:outline-none"
      />
      <DateInput
        onClose={() => {}}
        checkInDate={checkIn}
        checkOutDate={checkOut}
        onCheckInDateSelect={(date) =>
          patch({
            checkIn: date,
            checkOut: date && checkOut && date >= checkOut ? null : checkOut,
          })
        }
        onCheckOutDateSelect={(date) => patch({ checkOut: date })}
        displayError={(message) => {
          console.error(message);
        }}
        showTwoMonths={false}
      />
      <PropertyType
        value={propertyType}
        onSelect={(value) => patch({ propertyType: value })}
      />
      <GuestCounter
        guests={guests}
        onAction={(action) =>
          patch({
            guests:
              action === 'increment' ? guests + 1 : Math.max(1, guests - 1),
          })
        }
      />
      <button
        onClick={handleSearch}
        className="mt-5 w-full rounded-lg bg-teal px-16 py-2.5 text-white"
      >
        Search Aparte
      </button>
    </section>
  );
};

export default FilterSearch;
