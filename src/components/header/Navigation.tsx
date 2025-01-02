import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {}

const Navigation: React.FC<NavigationProps> = () => {
  const theme = useTheme();
  const location = useLocation();
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Agent", path: "/agents" },
    { label: "Owner", path: "/Owner" },
  ];

  return (
    <Box
      component="nav"
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        padding: "1rem 0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1200px", 
        }}
      >
        <Box
          component="ul"
          sx={{
            display: "flex",
            gap: 2,
            listStyle: "none",
            p: 0,
            m: 0,
            pr: { xs: 12, lg: 16, xl:24 }, 
          }}
        >
          {navItems.map((item, index) => (
            <Box component="li" key={index}>
              <Typography
                component={Link}
                to={item.path}
                sx={{
                  fontWeight: location.pathname === item.path ? "bold" : "medium",
                  color:
                    location.pathname === item.path
                      ? theme.palette.primary.main
                      : "#191919",
                  textDecoration: "none",
                  padding: "0 0.9rem",
                  fontSize: "1.1rem",
                }}
                aria-current={location.pathname === item.path ? "page" : undefined}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Navigation;