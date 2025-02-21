import React, { useState, useEffect } from "react";
import { useMediaQuery, Box, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import { Link } from "react-router-dom";
import LargeDropdown from "./LargeDropdown";
import MobileDropdown from "./MobileDropdown";
import { useGetProfileQuery } from "../../api/profileApi";

interface Wallet {
  balance: string;
  createdAt: string;
  currency: string;
  id: string;
  pendingCash: string;
  updatedAt: string;
  userId: number;
}

const ActionButtons: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, error } = useGetProfileQuery();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const isLoggedIn = Boolean(data?.data);

  useEffect(() => {
    if (!isLoading && data) {
      const walletWithNgn = data?.data?.wallets?.find((wallet: Wallet) => wallet?.currency === "NGN");
      setWallet(walletWithNgn || null);
    }
  }, [isLoading, data]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMobileDropdownToggle = () => {
    setModalOpen((prev) => !prev);
  };

  const formatBalance = (balance: string) => {
    const num = Number(balance);
    if (!isMobile) return num.toLocaleString();
    
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {wallet ? (
        isLoading ? (
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "14px" }}>
            Getting Your Balance...
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(2, 128, 144, 0.05)',
              borderRadius: '5em',
              px: 2,
              py: 0.75,
              height: '32px'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.75rem",
              }}
            >
              Balance:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                fontSize: "0.875rem",
              }}
            >
              ₦{formatBalance(wallet?.balance)}
            </Typography>
          </Box>
        )
      ) : null}

      {/* Action Button: Image Icon */}
      <Box
        component="img"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/42da5ecc89c6a991a26a858cbae5dec5ead9bfe64652c7481263c0b834262d87"
        alt="Action button"
        sx={{
          objectFit: "contain",
          width: "90px",
          cursor: "pointer",
        }}
        onClick={isMobile ? handleMobileDropdownToggle : handleClick}
      />

      {/* Desktop Dropdown */}
      <LargeDropdown 
        anchorEl={anchorEl} 
        onClose={handleClose} 
        isLoggedIn={isLoggedIn}
      />

      {/* Mobile Dropdown */}
      <MobileDropdown 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        isLoggedIn={isLoggedIn}
      />
    </Box>
  );
};

export default ActionButtons;