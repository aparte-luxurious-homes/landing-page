import React from "react";
import { Container } from "@mui/material";

import PropertyTypesList from "../components/property/PropertyTypesList";

const PropertyTypes: React.FC = () => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 0, sm: 0, md: 4, lg: 5, xl: 6 },
        position: "relative",
        zIndex: 1,
        overflowX: "hidden",
        maxWidth: {
          xs: "360px", 
          sm: "100%",
          xl: "xl", 
        },
      }}
    >
      <section className="pt-12 px-4 sm:py-10 md:py-8 lg:py-6 xl:py-4 property">
        <PropertyTypesList onPropertyTypeChange={() => {}} />
      </section>
    </Container>
  );
};

export default PropertyTypes;
