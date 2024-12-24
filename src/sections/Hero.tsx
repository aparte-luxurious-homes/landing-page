import React from "react";
import { Container, Box, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/system";
import HeroImage from "../components/hero/HeroImage";
import LargeSearchBar from "../components/search/LargeSearchBar";
import MobileSearchBar from "../components/search/mobile/MobileSearchBar";
import "../assets/styles/landing/hero.css";

const Hero: React.FC = () => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md")); // Check if screen is larger than 900px

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 0, sm: 0, md: 6, lg: 8, xl: 10 },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 0, sm: 0, md: 4, lg: 5, xl: 6 },
        }}
      >
        <Box position="relative">
          <HeroImage
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/9b4d451ac5c0f38287a5975de8dedb7b7c1d8a2b7e4d5f3ed2c04150c68fc8d1?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
            alt="Main content image"
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: "medium",
                textAlign: "left",
                maxWidth: "60%",
                fontSize: {
                  xs: "24px",
                  sm: "30px",
                  md: "36px",
                  lg: "42px",
                  xl: "50px",
                },
              }}
            >
              Instant access to just another Home away from Home
            </Typography>

            {isLargeScreen && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: -40,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "80%",
                  maxWidth: "90%",
                  margin: "0 auto",
                  zIndex: 10,
                }}
              >
                <LargeSearchBar />
              </Box>
            )}

            {!isLargeScreen && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: -30,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "90%",
                  maxWidth: "90%",
                  margin: "0 auto",
                }}
              >
                <MobileSearchBar />
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero;
