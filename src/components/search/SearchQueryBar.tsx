'use client';

import React, { useEffect, useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface SearchQueryBarProps {
  /** The committed `q` — the bar resyncs whenever the URL changes. */
  value?: string;
  onSubmit: (q: string) => void;
}

/**
 * The query box on /search-results.
 *
 * The results page used to have no text input at all: the only place to type
 * a search was the homepage bar, so a guest who got a bad or empty result for
 * "2 bed in Lekki" had to go back home to reword it. The sidebar's
 * location field looks like one but only adds hard city filters, which is
 * the opposite of what a reworded sentence needs.
 */
const SearchQueryBar: React.FC<SearchQueryBarProps> = ({ value = '', onSubmit }) => {
  const [text, setText] = useState(value);
  useEffect(() => {
    setText(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(text.trim());
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="mb-4 flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-4 pr-1.5 shadow-sm focus-within:border-teal focus-within:shadow-md md:mb-6"
    >
      <SearchRoundedIcon sx={{ fontSize: 20, color: '#028090' }} aria-hidden />
      <input
        type="search"
        enterKeyHint="search"
        aria-label="Search stays"
        placeholder="Try “2 bedroom in Lekki under 150k with a pool”"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-ink outline-none placeholder:text-gray-400 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          aria-label="Clear search text"
          onClick={() => setText('')}
          className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </button>
      )}
      <button
        type="submit"
        className="shrink-0 rounded-full bg-teal px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Search
      </button>
    </form>
  );
};

export default SearchQueryBar;
