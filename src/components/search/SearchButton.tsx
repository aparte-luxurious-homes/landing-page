import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@mui/material";

interface SearchButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <Button
      type="button"
      aria-label="Search"
      style={{
        color: "white",
        minWidth: 0,
        padding: "0px 25px",
        backgroundColor: "#028090",
        height: "2.2rem",
      }}
      onClick={onClick}
    >
      <SearchIcon sx={{ fontSize: 18 }} />
    </Button>
  );
};

export default SearchButton;