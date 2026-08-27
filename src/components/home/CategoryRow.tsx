'use client';

import type { SvgIconComponent } from '@mui/icons-material';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CottageOutlinedIcon from '@mui/icons-material/CottageOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import HolidayVillageOutlinedIcon from '@mui/icons-material/HolidayVillageOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import HotelOutlinedIcon from '@mui/icons-material/HotelOutlined';
import VillaOutlinedIcon from '@mui/icons-material/VillaOutlined';

import { PROPERTY_TYPES } from '@/lib/propertyTypes';

/**
 * Property-type filter row.
 *
 * Replaces the MUI <Tabs> version, which tinted its active icon by running a
 * `filter: invert() sepia() hue-rotate()` chain over a flat PNG-ish SVG and
 * booted a Swiper against a selector that only existed in commented-out
 * markup. These are real icon components, so the active colour is just
 * `text-teal`.
 *
 * The value passed up is the API enum (`HOTEL`), never the label
 * ("Hotel Room") — see lib/propertyTypes.
 */

const ICONS: Record<string, SvgIconComponent> = {
  APARTMENT: ApartmentOutlinedIcon,
  VILLA: VillaOutlinedIcon,
  HOTEL: HotelOutlinedIcon,
  DUPLEX: HolidayVillageOutlinedIcon,
  BUNGALOW: CottageOutlinedIcon,
  OTHERS: HomeWorkOutlinedIcon,
};

interface CategoryRowProps {
  /** '' means "All". */
  value: string;
  onChange: (value: string) => void;
}

export default function CategoryRow({ value, onChange }: CategoryRowProps) {
  const options = [
    { value: '', label: 'All', Icon: GridViewOutlinedIcon },
    ...PROPERTY_TYPES.map((type) => ({
      value: type.value,
      label: type.label,
      Icon: ICONS[type.value] ?? HomeWorkOutlinedIcon,
    })),
  ];

  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto border-b border-gray-100 sm:-mx-6 md:mx-0">
      {/* `w-max mx-auto` is what lets the row be centred AND scrollable: the
          auto margins centre it while it fits, and collapse to zero once it
          overflows, so the first item stays reachable on a narrow screen.
          `justify-center` on the scroll container itself would put the
          overflow out of reach on the left. */}
      <div
        role="tablist"
        aria-label="Property types"
        className="mx-auto flex w-max gap-6 px-4 sm:px-6 md:gap-10 md:px-0"
      >
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <button
              key={option.value || 'all'}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(option.value)}
              className={`flex shrink-0 flex-col items-center gap-1 border-b-2 pb-3 pt-1 transition-colors ${
                isActive
                  ? 'border-teal text-teal'
                  : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-ink'
              }`}
            >
              <option.Icon sx={{ fontSize: 24 }} />
              <span className="whitespace-nowrap text-xs font-medium">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
