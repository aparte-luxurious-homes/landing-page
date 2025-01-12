import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@mui/material';

interface SearchButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <Button
      type="button"
      aria-label="Search"
      style={{
        color: 'white',
        minWidth: 0,
        padding: '0 1.5rem',
        backgroundColor: '#028090',
        height: '2.5rem',
        // width: '100%',
      }}
      onClick={onClick}
    >
      <SearchIcon sx={{ fontSize: 24 }} />
    </Button>
  );
};

export default SearchButton;
