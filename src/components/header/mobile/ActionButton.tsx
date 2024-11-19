import React from "react";
import { Box, Typography } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";

const ActionButton: React.FC = () => {
  return (
    <Box
      className="flex justify-between items-center"
      sx={{ mt: 3.5, mb: 2, px: 2 }}
    >
      <Box className="flex items-center gap-1.5">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/327a41b3030b704979745fedf54db7ed08202124f309815c919d67c58a4bf61e?placeholderIfAbsent=true&apiKey=8e9d8cabec6941f3ad44d75c45253ccb"
          alt=""
          className="object-contain shrink-0 self-start aspect-square w-[18px]"
        />
        <Typography variant="body1" sx={{ textTransform: "none" }}>
          List your Aparté
        </Typography>
      </Box>
      <ArrowForwardIcon />
    </Box>
  );
};

export default ActionButton;
