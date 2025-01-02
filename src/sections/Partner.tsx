import React from "react";
import { Container } from "@mui/material";

const Partner: React.FC = () => {
  return (
    <div className="relative bg-[#028090] w-full h-[400px] md:h-[500px] sm:h-[400px] mt-8">
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 0, sm: 0, md: 4, lg: 5, xl: 8 },
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center pt-24 md:pt-40 pl-2 md:pl-22">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full px-4">
            <h1 className="text-white text-xl md:text-2xl mdlg:text-4xl mb-4 text-center lg:text-right md:py-4">
              Are You an Agent or Home Owner?
            </h1>
            <div className="flex justify-center lg:justify-start md:pl-8 ">
              <button className="px-12 md:px-20 py-4 md:py-0 bg-white text-[#028090] text-xl font-medium rounded-md">
                Become a Partner
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Partner;

