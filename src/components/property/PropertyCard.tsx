import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import "swiper/swiper-bundle.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";

interface PropertyCardProps {
  id: string;
  title: string;
  address: string;
  images: string[];
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  address,
  images,
}) => {
  const navigate = useNavigate();

  // Generate unique class names for navigation buttons
  const prevButtonClass = `custom-button-prev-${id}`;
  const nextButtonClass = `custom-button-next-${id}`;

  const handleClick = () => {
    navigate(`/apartment/${id}`, { state: { title, address, images } });
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "400px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: 3,
        bgcolor: "background.paper",
      }}
    >
      {/* Swiper Web Component */}
      <swiper-container
        navigation-next-el={`.${nextButtonClass}`}
        navigation-prev-el={`.${prevButtonClass}`}
        navigation={true}
        loop={true}
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden", 
        }}
      >
        {images.map((image: string | undefined, index: number) => (
          <swiper-slide key={index}>
            <img
              src={image}
              alt={`Slide ${index}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                cursor: "pointer",
                transition: "transform 0.5s ease",
                transitionTimingFunction: "ease-in-out",
              }}
              onClick={handleClick} 
            />
          </swiper-slide>
        ))}
      </swiper-container>

      {/* Custom navigation buttons */}
      <IconButton
        className={prevButtonClass}
        sx={{
          position: "absolute",
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
          backgroundColor: "white",
          borderRadius: "50%",
          zIndex: 2,
          width: "44px",
          height: "44px",
          "&:hover": {
            backgroundColor: "white",
          },
        }}
      >
        <ArrowBackIosIcon sx={{ fontSize: "0.75rem" }} />
      </IconButton>
      <IconButton
        className={nextButtonClass}
        sx={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          backgroundColor: "white",
          borderRadius: "50%",
          zIndex: 2,
          width: "44px",
          height: "44px",
          "&:hover": {
            backgroundColor: "white",
          },
        }}
      >
        <ArrowForwardIosIcon sx={{ fontSize: "0.75rem" }} />
      </IconButton>

      {/* Star ratings */}
      <Box
        sx={{
          position: "absolute",
          top: "10px",
          left: "10px",
          display: "flex",
          gap: "4px",
          padding: "4px 8px",
          borderRadius: "8px",
          backgroundColor: "transparent",
          zIndex: 3,
        }}
      >
        {[...Array(5)].map((_, index) => (
          <StarIcon key={index} sx={{ color: "white", fontSize: "1.5rem" }} />
        ))}
      </Box>

      {/* Title and Address Overlay */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          background:
            "linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0))",
          color: "white",
          padding: "16px",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: "bold",
            textShadow: "0px 1px 3px rgba(0, 0, 0, 0.8)",
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <LocationOnIcon sx={{ color: "#11111", mr: 0.5, fontSize: "16px" }} />
          <Typography variant="body2" color="inherit">
            {address}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PropertyCard;