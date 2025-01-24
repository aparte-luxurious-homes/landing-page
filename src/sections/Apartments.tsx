// filepath: /c:/Users/HP/Downloads/aparte-v1-master/aparte-v1/src/pages/Apartments.tsx
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Pagination,
  useMediaQuery,
} from '@mui/material';
import Grid from "@mui/material/Grid2";
import ApartmentCard from "../components/apartment/ApartmentCard";
import SampleImg from '../assets/images/Apartment/Bigimg.png';
import { useTheme } from '@mui/material/styles';
// import { generateRandomApartments } from "../sections/generateApartment";
import { useGetPropertiesQuery } from "../api/propertiesApi";

export default function Apartments() {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const ITEMS_PER_PAGE = isLargeScreen ? 8 : 4;

  const [currentPage, setCurrentPage] = useState(1);
  const { data, error, isLoading } = useGetPropertiesQuery();
  // const apartments = generateRandomApartments(20);
  const [apartments, setAllApartments] = useState<any[]>([]);
  const [lagosApartments, setLagosApartments] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && data?.data?.data) {
      setAllApartments(data?.data?.data);
      setLagosApartments(
        data?.data?.data.filter(
          (apartment: any) => apartment?.state.toLowerCase() === "lagos state"
        )
      );
    }
  }, [isLoading, data]);

  // interface ItemApartments {
  //   item_name: string;
  // }

  // const [itemapartments, setItemApartments] = useState<ItemApartments>({
  //   item_name: ""
  // });

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   const { name, value } = e.target;
  //   setItemApartments({
  //     ...itemapartments,
  //     [name]: value,
  //   });
  // };

  console.log('Data:', data?.data?.data);
  console.log('Error:', error);
  console.log('Is Loading:', isLoading);

  console.log('lagosApartments', apartments);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const paginatedApartments = lagosApartments.slice(
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
            fontWeight: 'medium',
            textAlign: 'left',
          }}
        >
          Apartments in Lagos
        </Typography>
        <Grid container spacing={2} sx={{ mt: 4 }}>
          {isLoading ? (
            <p>Please wait ...</p>
          ) : (
            paginatedApartments.map((apartment, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
                <ApartmentCard
                  imageUrl={apartment?.media?.length > 0 ? apartment?.media?.[0]?.mediaUrl : SampleImg}
                  title={apartment?.name}
                  propertylink={`/property-details/${apartment?.id}`}
                  location={`${apartment?.city}, ${apartment?.state}`}
                  price={
                    apartment?.units?.length > 0
                      ? `${Math.max(...apartment?.units.map((unit: any) => unit?.pricePerNight))} - ₦${Math.min(...apartment?.units.map((unit: any) => unit?.pricePerNight))}`
                      : "No Pricing Info"
                  }
                  rating={
                    apartment?.rating?.length > 0
                      ? parseFloat(
                          (
                            apartment?.rating.reduce((sum: number, rate: number) => sum + rate, 0) /
                            apartment?.rating.length
                          ).toFixed(1)
                        )
                      : 0.0
                  }
                  reviews={apartment?.units?.reviews || "No Reviews"}
                />
              </Grid>
            ))
          )}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            variant="outlined"
            shape="rounded"
            count={Math.ceil(lagosApartments?.length / ITEMS_PER_PAGE)}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Box>
      </section>
    </Container>
  );
}
