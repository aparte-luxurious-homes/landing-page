import React from "react";
import { Container } from "@mui/material";
import { Link } from "react-router-dom";

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
              <Link
                to="/auth/user-type?mode=signup"
                className="px-12 md:px-20 py-4 md:py-3 bg-white text-[#028090] text-xl font-medium rounded-md inline-block hover:bg-white/90 transition no-underline"
                style={{ textDecoration: "none" }}
              >
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Partner;

