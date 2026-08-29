'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from '@/lib/router';
import SearchBarItem from './SearchBarItem';
import Divider from './Divider';
import LocationInput from './LocationInput';
import DateInput from './DateInput';
import SearchButton from './SearchButton';
import { filtersToSearchParams } from '../../utils/searchParams';
import { PROPERTY_TYPES, propertyTypeLabel } from '@/lib/propertyTypes';
import { useSearchDraft } from '@/components/home/searchContext';
import { trackEvent } from '@/analytics';
import { trackPropertySearched } from '@/lib/mixpanel/track';

type Segment = 'Where' | 'Check in' | 'Check out' | 'Property' | 'Guests';

const SEGMENTS: Segment[] = [
  'Where',
  'Check in',
  'Check out',
  'Property',
  'Guests',
];

interface LargeSearchBarProps {
  /** Segment to open on mount — the panel opens straight into "Where". */
  initialActive?: Segment | null;
  /** Called after a successful submit, so a host panel can close itself. */
  onSubmitted?: () => void;
  /** Distinguishes the in-flow bar from the panel one in analytics. */
  analyticsSource?: string;
}

const LargeSearchBar: React.FC<LargeSearchBarProps> = ({
  initialActive = null,
  onSubmitted,
  analyticsSource = 'home_bar',
}) => {
  const navigate = useNavigate();
  // Shared with the header pill on the homepage; component-local elsewhere.
  const [draft, setDraft] = useSearchDraft();
  const [activeItem, setActiveItem] = useState<Segment | null>(initialActive);
  const formRef = useRef<HTMLFormElement | null>(null);

  const { location, pickedLocation, checkIn, checkOut, propertyType, guests } =
    draft;

  const patch = (next: Partial<typeof draft>) =>
    setDraft((prev) => ({ ...prev, ...next }));

  const handleClose = () => setActiveItem(null);

  // A click anywhere outside closes the open dropdown. Without this the
  // calendar stays up while the guest scrolls the page behind it.
  useEffect(() => {
    if (!activeItem) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!formRef.current?.contains(event.target as Node)) setActiveItem(null);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [activeItem]);

  const valueFor = (segment: Segment): string => {
    switch (segment) {
      case 'Where':
        return location || 'Search destinations';
      case 'Check in':
        return checkIn ? format(checkIn, 'EEE, dd MMM') : 'Add dates';
      case 'Check out':
        return checkOut ? format(checkOut, 'EEE, dd MMM') : 'Add dates';
      case 'Property':
        return propertyType ? propertyTypeLabel(propertyType) : 'Any type';
      case 'Guests':
        return `${guests} guest${guests === 1 ? '' : 's'}`;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The typed text goes to `q` — the natural-language query.
    //
    // It used to be duplicated into `searchTerm` (which SearchResults never
    // read) *and* `locations` (a hard city filter). That second copy is why
    // "2 bedroom flat in Lekki" returned nothing: the whole sentence was
    // matched against city/state/country/address as a literal string.
    const filters = {
      q: location,
      startDate: checkIn,
      endDate: checkOut,
      propertyTypes: propertyType ? [propertyType] : [],
      guestCount: guests,
      // Only a picked city/state becomes a hard filter; free-typed text stays
      // in `q` alone.
      locations: pickedLocation ? [pickedLocation] : [],
    };
    const params = filtersToSearchParams(filters);

    // Two destinations, deliberately: Mixpanel carries the product-analytics
    // event (with the search text), GA4 the web-analytics one below — counts
    // and booleans only.
    trackPropertySearched(filters);
    trackEvent('search_submit', {
      source: analyticsSource,
      has_query: Boolean(location.trim()),
      has_dates: Boolean(checkIn && checkOut),
      guests,
      property_type: propertyType || 'any',
    });

    setActiveItem(null);
    onSubmitted?.();
    navigate(`/search-results?${params.toString()}`);
  };

  return (
    <form
      ref={formRef}
      className="relative mx-auto w-full max-w-4xl font-medium"
      role="search"
      onSubmit={handleSearch}
    >
      <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-2 pl-4 shadow-md transition-shadow hover:shadow-lg">
        {SEGMENTS.map((segment, index) => (
          <React.Fragment key={segment}>
            <SearchBarItem
              label={segment}
              value={valueFor(segment)}
              isActive={activeItem === segment}
              onClick={() =>
                setActiveItem((prev) => (prev === segment ? null : segment))
              }
              className={segment === 'Where' ? 'flex-[1.6]' : 'flex-1'}
            />
            {index < SEGMENTS.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        <SearchButton onClick={handleSearch} />
      </div>

      {activeItem && (
        <div className="absolute left-0 top-full z-40 mt-3 w-full">
          {activeItem === 'Where' && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
              <LocationInput
                value={location}
                onChange={(value) =>
                  patch({
                    location: value,
                    // Editing away from the picked option drops it back to a
                    // free-text query.
                    pickedLocation:
                      pickedLocation &&
                      value.trim().toLowerCase() === pickedLocation.toLowerCase()
                        ? pickedLocation
                        : null,
                  })
                }
                onSelectOption={(option) =>
                  patch({ location: option.name, pickedLocation: option.name })
                }
                onClose={handleClose}
              />
            </div>
          )}

          {(activeItem === 'Check in' || activeItem === 'Check out') && (
            <DateInput
              onClose={handleClose}
              checkInDate={checkIn}
              checkOutDate={checkOut}
              onCheckInDateSelect={(date) => {
                patch({
                  checkIn: date,
                  // An end date that now precedes the start is not a range.
                  checkOut:
                    date && checkOut && date >= checkOut ? null : checkOut,
                });
                setActiveItem('Check out');
              }}
              onCheckOutDateSelect={(date) => {
                patch({ checkOut: date });
                handleClose();
              }}
              width="100%"
              showTwoMonths
            />
          )}

          {activeItem === 'Property' && (
            <div className="ml-auto w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  patch({ propertyType: '' });
                  handleClose();
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Any type
              </button>
              {PROPERTY_TYPES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    patch({ propertyType: option.value });
                    handleClose();
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                    propertyType === option.value
                      ? 'font-semibold text-teal'
                      : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {activeItem === 'Guests' && (
            <div className="ml-auto w-56 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Guests</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Remove a guest"
                    disabled={guests <= 1}
                    onClick={() =>
                      patch({ guests: Math.max(1, guests - 1) })
                    }
                    className="h-8 w-8 rounded-full border border-gray-300 text-lg leading-none text-ink disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm">{guests}</span>
                  <button
                    type="button"
                    aria-label="Add a guest"
                    onClick={() => patch({ guests: guests + 1 })}
                    className="h-8 w-8 rounded-full border border-gray-300 text-lg leading-none text-ink"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

export default LargeSearchBar;
