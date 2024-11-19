import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Button } from "@mui/material";

const SearchButton: React.FC = () => {
  return (
    <Button
      type="submit"
      aria-label="Search"
      style={{
        color: "white",
        minWidth: 0,
        padding: "0px 25px",
        backgroundColor: "#028090",
        height: "2.2rem",
      }}
    >
      <SearchIcon sx={{ fontSize: 18 }} />
    </Button>
  );
};

export default SearchButton;
