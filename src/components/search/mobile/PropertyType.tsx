'use client';

import React, { useState } from 'react';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { PROPERTY_TYPES, propertyTypeLabel } from '@/lib/propertyTypes';

interface PropertyTypeProps {
  /** The selected API enum value, or '' for any. */
  value?: string;
  onSelect: (value: string) => void;
}

/**
 * This used to call `onSelect(property.label)` — passing "Hotel Room" where
 * the caller sent it on as `property_type`, which matches no row. It emits
 * the enum value now, and shows the label.
 */
const PropertyType: React.FC<PropertyTypeProps> = ({ value = '', onSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const choose = (next: string) => {
    onSelect(next);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative mt-4 pt-0">
      <button
        type="button"
        onClick={() => setIsDropdownOpen((open) => !open)}
        aria-expanded={isDropdownOpen}
        className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left"
      >
        <HomeWorkOutlinedIcon sx={{ fontSize: 20, color: '#028090' }} />
        <span className="text-sm text-zinc-500">
          {value ? propertyTypeLabel(value) : 'Property type'}
        </span>
        <KeyboardArrowDownRoundedIcon
          className={`ml-auto transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
          sx={{ fontSize: 20, color: '#6b7280' }}
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            type="button"
            onClick={() => choose('')}
            className="w-full px-4 py-3 text-left text-sm text-zinc-600 hover:bg-gray-50"
          >
            Any type
          </button>
          {PROPERTY_TYPES.map((property) => (
            <button
              key={property.value}
              type="button"
              onClick={() => choose(property.value)}
              className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 ${
                value === property.value
                  ? 'font-semibold text-teal'
                  : 'text-zinc-600'
              }`}
            >
              {property.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyType;
