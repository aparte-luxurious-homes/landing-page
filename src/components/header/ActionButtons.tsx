import React, { useState, useEffect } from "react";
import { useMediaQuery, Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import { Link } from "react-router-dom";
import LargeDropdown from "../../components/header/LargeDropdown";
import MobileDropdown from "../../components/header/MobileDropdown";
import { useGetProfileQuery } from "../../api/profileApi";

const ActionButtons: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, error } = useGetProfileQuery();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Mobile breakpoint: 900px or below
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // For desktop dropdown
  const [modalOpen, setModalOpen] = useState(false); // For mobile modal dropdown
  const [wallet, setWallet] = useState<Wallet | null>(null);

  interface Wallet {
    balance: string;
    createdAt: string;
    currency: string;
    id: string;
    pendingCash: string;
    updatedAt: string;
    userId: number;
  }

  useEffect(() => {
    if (!isLoading && data) {
      const walletWithNgn = data?.data?.wallets.find((wallet: Wallet) => wallet.currency === "NGN");
      setWallet(walletWithNgn || null);
    }
  }, [isLoading, data])

  console.log('wallet:', wallet);
  console.log('Error:', error);

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
      {wallet ? (
        <Typography variant="h3" sx={{ color: "black !important", fontSize: "18px", fontWeight: "600" }}>
          {wallet?.currency}: {Number(wallet?.balance).toLocaleString()}
        </Typography>
      ) : (
        !isMobile && (
          <Button 
            component={Link}
            to="/list"
            variant="text"
            sx={{
              fontWeight: "medium",
              textTransform: "none",
              fontSize: "1.1rem",
            }}
          >
            List your Aparté
          </Button>
        )
      )}

      {/* Action Button: Image Icon */}
      <Box
        component="img"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/42da5ecc89c6a991a26a858cbae5dec5ead9bfe64652c7481263c0b834262d87?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
        alt="Action button"
        sx={{
          objectFit: "contain",
          width: "90px",
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