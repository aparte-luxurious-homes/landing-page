'use client';

import React from 'react';

interface SearchBarItemProps {
  label: string;
  value: string;
  onClick: () => void;
  /** True while this segment's dropdown is open. */
  isActive?: boolean;
  className?: string;
}

/**
 * One segment of the search pill.
 *
 * A <button>, not the clickable <div> this used to be: the segments open
 * dropdowns, so they have to be reachable and operable from the keyboard.
 */
const SearchBarItem: React.FC<SearchBarItemProps> = ({
  label,
  value,
  onClick,
  isActive = false,
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={isActive}
    className={`flex min-w-0 flex-col items-start rounded-full px-3 py-1.5 text-left transition-colors lg:px-4 ${
      isActive ? 'bg-gray-100' : 'hover:bg-gray-100'
    } ${className}`}
  >
    <span
      className={`text-xs font-semibold leading-tight ${
        isActive ? 'text-teal' : 'text-ink'
      }`}
    >
      {label}
    </span>
    <span className="w-full truncate text-sm leading-tight text-gray-500">
      {value}
    </span>
  </button>
);

export default SearchBarItem;
