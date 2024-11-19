import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

interface NavigationProps {}

const Navigation: React.FC<NavigationProps> = () => {
  const theme = useTheme();
  const navItems = [
    { label: "Home", isActive: true },
    { label: "Agents", isActive: false },
    { label: "Apartments", isActive: false },
    { label: "Services", isActive: false },
    { label: "Pricing", isActive: false },
  ];

  return (
    <Box
      component="ul"
      sx={{ display: "flex", gap: 2, listStyle: "none", p: 0, m: 0 }}
    >
      {navItems.map((item, index) => (
        <Box component="li" key={index}>
          <Typography
            component="a"
            href="#"
            sx={{
              fontWeight: item.isActive ? "bold" : "medium",
              color: item.isActive ? theme.palette.primary.main : "#191919",
              textDecoration: "none",
            }}
            aria-current={item.isActive ? "page" : undefined}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default Navigation;
