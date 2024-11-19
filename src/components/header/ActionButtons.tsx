import React, { useState } from "react";
import { useMediaQuery, Box, Button } from "@mui/material";
import { useTheme } from "@mui/system";
import LargeDropdown from "../../components/header/LargeDropdown";
import MobileDropdown from "../../components/header/MobileDropdown";

const ActionButtons: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Mobile breakpoint: 900px or below
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // For desktop dropdown
  const [modalOpen, setModalOpen] = useState(false); // For mobile modal dropdown

  // Handle desktop dropdown toggle
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  // Close the dropdown
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle opening and closing of mobile modal dropdown
  const handleMobileDropdownToggle = () => {
    setModalOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        color: "cyan",
        position: "relative",
      }}
    >
      {/* Hide "List your Aparté" on mobile */}
      {!isMobile && (
        <Button
          variant="text"
          onClick={handleClick}
          sx={{ fontWeight: "medium", textTransform: "none" }}
        >
          List your Aparté
        </Button>
      )}

      {/* Action Button: Image Icon */}
      <Box
        component="img"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/42da5ecc89c6a991a26a858cbae5dec5ead9bfe64652c7481263c0b834262d87?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
        alt="Action button"
        sx={{
          objectFit: "contain",
          width: "100px",
          cursor: "pointer",
        }}
        onClick={isMobile ? handleMobileDropdownToggle : handleClick}
      />

      {/* Desktop Dropdown (LargeDropdown) */}
      {!isMobile && <LargeDropdown anchorEl={anchorEl} onClose={handleClose} />}

      {/* Mobile Dropdown (MobileDropdown) */}
      {isMobile && (
        <MobileDropdown open={modalOpen} onClose={handleMobileDropdownToggle} />
      )}
    </Box>
  );
};

export default ActionButtons;
