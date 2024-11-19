import React from "react";
import { Box } from "@mui/material";

interface LogoProps {}

const Logo: React.FC<LogoProps> = () => {
  return (
    <Box
      component="img"
      src="https://cdn.builder.io/api/v1/image/assets/TEMP/0c8a9b3dcb186de9d38d0c749f99db9e0969e3f2ccfb601ae3a6213043155bdb?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
      alt="Company Logo"
      sx={{
        objectFit: "contain",
        width: { xs: "120px", md: "161px" },
      }}
    />
  );
};

export default Logo;
