import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import BuildingsIcon from "../../assets/images/icons/buildings-2.svg";
import BuildingIcon from "../../assets/images/icons/building.svg";
import House2Icon from "../../assets/images/icons/house-2.svg";
import HouseIcon from "../../assets/images/icons/house.svg";
import House from "../../assets/images/icons/buildings.svg";
import PropertyCard from "./PropertyCard";
import Guest from "../../assets/images/guest/Mask-group.png";
import Guest1 from "../../assets/images/guest/Living-Room_Lagos_Wood-and-Nails_2.png";
import Guest2 from "../../assets/images/guest/image1.png";
import Guest3 from "../../assets/images/guest/image2.png";
import Swiper from "swiper/bundle";
import "swiper/swiper-bundle.css";

import "../../assets/styles/landing/property.css";

interface PropertyType {
  Icon: string;
  title: string;
  description: string;
}

const propertyTypes: PropertyType[] = [
  {
    Icon: House,
    title: "Duplex",
    description:
      "A duplex is a single building that is divided into two separate units, typically with their own entrances.",
  },
  {
    Icon: BuildingIcon,
    title: "Mini Flat",
    description:
      "A mini flat is a small apartment with basic amenities, often consisting of a living room, bedroom, and bathroom.",
  },
  {
    Icon: BuildingsIcon,
    title: "2 Bedroom",
    description:
      "A 2-bedroom property offers ample space with two separate bedrooms, perfect for small families or roommates.",
  },
  {
    Icon: HouseIcon,
    title: "3 Bedroom",
    description:
      "A 3-bedroom property provides additional space, ideal for larger families or those needing extra rooms.",
  },
  {
    Icon: House2Icon,
    title: "Single Room",
    description:
      "A single room is a compact and cost-effective option, suitable for individuals or minimalists.",
  },
];

const properties = Array.from({ length: 4 }, (_, index) => ({
  id: `property-${index + 1}`,
  title: "Beautiful Apartment",
  address: "123 Main St, City, Country",
  images: [Guest, Guest1, Guest2, Guest3],
}));

const PropertyTypesList: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    new Swiper(".swiper-container.product-carousel", {
      slidesPerView: 1,
      slidesPerGroup: 1,
      pagination: {
        el: ".products-pagination",
        type: "bullets",
        clickable: true,
      },
      spaceBetween: 20,
      breakpoints: {
        320: {
          slidesPerView: 1,
          slidesPerGroup: 1,
          spaceBetween: 20,
        },
        550: { slidesPerView: 2, slidesPerGroup: 1, spaceBetween: 24 },
        768: {
          slidesPerView: 2,
          slidesPerGroup: 1,
          spaceBetween: 24,
        },
        992: {
          slidesPerView: 3,
          slidesPerGroup: 1,
          spaceBetween: 30,
        },
        1024: {
          slidesPerView: 4,
          slidesPerGroup: 1,
          spaceBetween: 30,
        },
      },
    });
  });

  return (
    <Box sx={{ width: "100%" }}>
      {/* Centered Tabs for property types */}
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tabs
          value={value}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="property types tabs"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            justifyContent: "center",
          }}
        >
          {propertyTypes.map((type, index) => (
            <Tab
              key={index}
              label={type.title}
              icon={
                <img
                  src={type.Icon}
                  alt={type.title}
                  style={{
                    width: 24,
                    height: 24,
                    filter:
                      value === index
                        ? "invert(34%) sepia(87%) saturate(747%) hue-rotate(162deg) brightness(92%) contrast(92%)"
                        : "none",
                  }}
                />
              }
              iconPosition="top"
              sx={{
                textTransform: "none",
                fontSize: { xs: "0.4rem", sm: "1rem" },
                minWidth: { xs: "auto", sm: "100px" },
              }}
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ py: 3, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          variant="h4"
          sx={{ fontSize: { xs: "1.2rem", sm: "2rem", md: "2rem" } }}
        >
          Guest Favorites
        </Typography>
        <FavoriteBorderIcon
          sx={{
            color: "red",
            fontSize: { xs: "1.2rem", sm: "2rem", md: "2rem" },
          }}
        />
      </Box>
      {/* Display content for the selected tab */}
      <Box sx={{ width: "100%" }}>
        {propertyTypes.map((_, index) => (
          <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            key={index}
            style={{
              width: "100%",
              display: value === index ? "block" : "none",
            }}
          >
            {value === index && (
              <>
                <Box sx={{ position: "relative", width: "100%" }}>
                  <div className="swiper-container product-carousel js-swiper-slider swiper-container-initialized swiper-container-horizontal swiper-container-pointer-events">
                    <div className="swiper-wrapper" aria-live="off">
                      {properties.map((property, index) => (
                        <div className="swiper-slide" key={property.id}>
                          <PropertyCard {...property} key={index} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="products-pagination mt-4 mb-5 flex justify-center items-center swiper-pagination-clickable swiper-pagination-bullets">
                    {[...Array(4)].map((_, index) => (
                      <span
                        key={index}
                        className={`swiper-pagination-bullet ${
                          index === 0 ? "swiper-pagination-bullet-active" : ""
                        }`}
                        tabIndex={0}
                        role="button"
                        aria-label={`Go to slide ${index + 1}`}
                      ></span>
                    ))}
                  </div>
                </Box>
              </>
            )}
          </div>
        ))}
      </Box>
    </Box>
  );
};

export default PropertyTypesList;
