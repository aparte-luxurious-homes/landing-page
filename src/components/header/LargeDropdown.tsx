import React from "react";
import { Box, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface LargeDropdownProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const LargeDropdown: React.FC<LargeDropdownProps> = ({ anchorEl, onClose }) => {
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  if (!open) return null; // Don't render if the dropdown is not open

  const dropdownStyle = {
    position: "absolute",
    top: "100%",
    right: 0,
    transform: "translateY(10px)",
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    width: 300,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    alignItems: "flex-start",
    zIndex: 1300,
    margin: "0 auto",
  };

  const handleLoginClick = () => {
    navigate("/login");
    onClose();
  };

  const handleSignUpClick = () => {
    navigate("/signup");
    onClose();
  };



  return (
    <Box sx={dropdownStyle}>
      {/* Main Options */}
      <Button
        fullWidth
        variant="text"
        sx={{
          textAlign: "left",
          textTransform: "none",
          justifyContent: "flex-start",
          color: "black",
          fontWeight: 400,
        }}
        onClick={handleLoginClick}
      >
        Login
      </Button>
      <Button
        fullWidth
        variant="text"
        sx={{
          textAlign: "left",
          textTransform: "none",
          justifyContent: "flex-start",
          color: "black",
          fontWeight: 400,
        }}
        onClick={handleSignUpClick}
      >
        Sign Up
      </Button>

      {/* Horizontal divider */}
      <Divider sx={{ width: "100%" }} />

      {/* Help and Logout Options */}
      <Button
        fullWidth
        variant="text"
        sx={{
          textAlign: "left",
          textTransform: "none",
          justifyContent: "flex-start",
          color: "black",
          fontWeight: 500,
        }}
        onClick={onClose}
      >
        List Your Aparte
      </Button>
      <Button
        fullWidth
        variant="text"
        sx={{
          textAlign: "left",
          textTransform: "none",
          justifyContent: "flex-start",
          color: "black",
          fontWeight: 400,
        }}
        onClick={onClose}
      >
        Help Center
      </Button>
    </Box>
  );
};

export default LargeDropdown;
