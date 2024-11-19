import React from "react";
import { Box, Button, Divider } from "@mui/material";

interface LargeDropdownProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

const LargeDropdown: React.FC<LargeDropdownProps> = ({ anchorEl, onClose }) => {
  const open = Boolean(anchorEl);

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
        onClick={onClose}
      >
        My Account
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
        Manage My Listing
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
        Notifications
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
        Messages
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
          fontWeight: 400,
        }}
        onClick={onClose}
      >
        Help Center
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
        Logout
      </Button>
    </Box>
  );
};

export default LargeDropdown;
