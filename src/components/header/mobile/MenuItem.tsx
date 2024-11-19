import React from "react";
import { Box, Typography } from "@mui/material";

interface MenuItemProps {
  label: string;
  isActive: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, isActive }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", mt: 3.5, ml: 2 }}>
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/dbbedeec255544e6b98533a08d4679df86197ca4c3e43a37fe35dbf69f1a9969?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
        alt=""
        className="object-contain mt-4 w-full aspect-[333.33]"
      />
      <Typography
        sx={{
          ml: 2,
          color: isActive ? "primary.main" : "text.secondary",
          fontWeight: isActive ? "bold" : "normal",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default MenuItem;
