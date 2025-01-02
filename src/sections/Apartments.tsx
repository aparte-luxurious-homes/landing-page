// filepath: /c:/Users/HP/Downloads/aparte-v1-master/aparte-v1/src/pages/Apartments.tsx
import { useState } from "react";
import { Container, Typography, Box, Pagination, useMediaQuery } from "@mui/material";
import Grid from "@mui/material/Grid2";
import ApartmentCard from "../components/apartment/ApartmentCard";
import { useTheme } from "@mui/material/styles";
import { generateRandomApartments } from "../sections/generateApartment";

export default function Apartments() {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"));
  const ITEMS_PER_PAGE = isLargeScreen ? 8 : 4;

  const [currentPage, setCurrentPage] = useState(1);
  const apartments = generateRandomApartments(20); // Generate 20 random apartments

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const paginatedApartments = apartments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 0, sm: 0, md: 4, lg: 5, xl: 6 },
      }}
    >
      <section className="py-6 px-4 sm:py-10 md:py-8 lg:py-8 xl:py-10 property">
        <Typography
          variant="h1"
          sx={{
            fontSize: {
              xs: "1.5rem",
              sm: "1.5rem",
              md: "1.8rem",
              lg: "2rem",
              xl: "2rem",
            },
            fontWeight: "medium",
            textAlign: "left",
          }}
        >
          Apartments in Lagos
        </Typography>
        <Grid container spacing={2} sx={{ mt: 4 }}>
          {paginatedApartments.map((apartment, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <ApartmentCard {...apartment} rating={Number(apartment.rating)} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            variant="outlined"
            shape="rounded"
            count={Math.ceil(apartments.length / ITEMS_PER_PAGE)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
      </section>
    </Container>
  );
}