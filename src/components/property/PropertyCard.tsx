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
        height: "20em",
        borderRadius: "1.2em",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        bgcolor: "background.paper",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
        },
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
          left: "8px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: "50%",
          zIndex: 2,
          width: "36px",
          height: "36px",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,1)",
          },
        }}
      >
        <ArrowBackIosIcon sx={{ fontSize: "0.7rem" }} />
      </IconButton>
      <IconButton
        className={nextButtonClass}
        sx={{
          position: "absolute",
          top: "50%",
          right: "8px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(255,255,255,0.9)",
          borderRadius: "50%",
          zIndex: 2,
          width: "36px",
          height: "36px",
          "&:hover": {
            backgroundColor: "rgba(255,255,255,1)",
          },
        }}
      >
        <ArrowForwardIosIcon sx={{ fontSize: "0.7rem" }} />
      </IconButton>

      {/* Star ratings */}
      <Box
        sx={{
          position: "absolute",
          top: "12px",
          left: "12px",
          display: "flex",
          gap: "2px",
          padding: "4px 8px",
          borderRadius: "8px",
          backgroundColor: "rgba(0,0,0,0.3)",
          backdropFilter: "blur(4px)",
          zIndex: 3,
        }}
      >
        {[...Array(5)].map((_, index) => (
          <StarIcon 
            key={index} 
            sx={{ 
              color: "white", 
              fontSize: "1.2rem",
              opacity: 0.9 
            }} 
          />
        ))}
      </Box>

      {/* Title and Address Overlay */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)",
          color: "white",
          padding: "24px 16px 16px",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: "500",
            fontSize: "1.1rem",
            textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
            mb: 0.5,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LocationOnIcon sx={{ color: "white", mr: 0.5, fontSize: "14px", opacity: 0.9 }} />
          <Typography 
            variant="body2" 
            sx={{ 
              color: "white",
              opacity: 0.9,
              fontSize: "0.875rem"
            }}
          >
            {address}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PropertyCard;