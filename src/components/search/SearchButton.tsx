'use client';

import React from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

interface SearchButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <button
      type="submit"
      aria-label="Search"
      onClick={onClick}
      className="ml-1 flex h-11 shrink-0 items-center gap-2 rounded-full bg-teal px-3 text-white transition-opacity hover:opacity-90 lg:px-5"
    >
      <SearchRoundedIcon sx={{ fontSize: 22 }} />
      <span className="hidden text-sm font-semibold lg:inline">Search</span>
    </button>
  );
};

export default SearchButton;
