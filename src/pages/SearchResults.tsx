import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Typography, Grid, TextField, Button, Box, Pagination } from "@mui/material";
import { format } from "date-fns";
import ApartmentCard from "../components/apartment/ApartmentCard";
import { generateRandomApartments } from "../sections/generateApartment";

const SearchResults: React.FC = () => {
  const location = useLocation();
  const {
    location: searchLocation,
    checkInDate,
    checkOutDate,
    selectedProperty,
   
  } = location.state;

  const [locationFilter, setLocationFilter] = useState(searchLocation);
  const [checkInFilter, setCheckInFilter] = useState(checkInDate);
  const [checkOutFilter, setCheckOutFilter] = useState(checkOutDate);
  const [propertyFilter, setPropertyFilter] = useState(selectedProperty);
  const [currentPage, setCurrentPage] = useState(1); // Tracks current pagination page
  const itemsPerPage = 9; // Number of items to display per page


  const apartments = generateRandomApartments(50).filter((apartment) => {
    return (
      (!locationFilter || apartment.location.includes(locationFilter)) &&
      (!propertyFilter || apartment.title.includes(propertyFilter))
    );
  });

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApartments = apartments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <Container maxWidth="xl" sx={{ px: 0, pt: 13 }}>
      <Grid container spacing={4}>
        {/* Sidebar Filter */}
        <Grid item xs={12} md={3} px={4}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Search Filter
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: '0.02rem',
              backgroundColor: '#e0e0e0',
              marginBottom: 2,
            }}
          />
          
          {/* Location Filter */}
          <TextField
            label="Location"
            fullWidth
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            sx={{ marginBottom: 2 }}
          />

          {/* Date Range Picker */}
          <TextField
            label="Checkin-Checkout"
            type="date"
            fullWidth
            value={
              checkInFilter && checkOutFilter
                ? `${format(new Date(checkInFilter), "yyyy-MM-dd")} - ${format(new Date(checkOutFilter), "yyyy-MM-dd")}`
                : ""
            }
            onChange={(e) => {
              const [checkIn, checkOut] = e.target.value.split(" - ");
              setCheckInFilter(new Date(checkIn));
              setCheckOutFilter(new Date(checkOut));
            }}
            sx={{ marginBottom: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />

            <Box
            sx={{
              width: '100%',
              height: '0.02rem',
              backgroundColor: '#e0e0e0',
              marginBottom: 2,
            }}
          />

          {/* Property Type Checklist */}
          <Typography variant="body1" sx={{ marginBottom: 1}}>
            Property Type
          </Typography>
          {["Duplex", "Mini Flat", "2 Bedroom", "3 Bedroom", "Single Room"].map((type) => (
            <div key={type}>
              <input
                type="checkbox"
                id={type}
                value={type}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPropertyFilter((prev: any) => [...prev, type]);
                  } else {
                    setPropertyFilter((prev: any[]) => prev.filter((item: string) => item !== type));
                  }
                }}
              />
               <label htmlFor={type} style={{ marginLeft: '10px' }}>{type}</label>
            </div>
          ))}

          <Box
            sx={{
              width: '100%',
              height: '0.02rem',
              backgroundColor: '#e0e0e0',
              marginBottom: 2,
              marginTop: 2,

            }}
          />

          {/* Guests Filter */}
          <Typography variant="body1" sx={{ marginBottom: 1 }}>
            Guests
          </Typography>


          <Button variant="contained" color="primary" fullWidth>
            Search
          </Button>
        </Grid>

        {/* Divider */}
        <Box
          sx={{
            width: '1px',
            backgroundColor: '#e0e0e0',
            marginX: 2,
          }}
        />

        {/* Search Results */}
        <Grid item xs={12} md={8}>
          <Typography variant="h4" sx={{ marginBottom: 4, fontSize: "1.5rem" }}>
            Search Results
          </Typography>
          <Grid container spacing={6}>
        {paginatedApartments.map((apartment, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={index}
          >
            <ApartmentCard {...apartment} rating={Number(apartment.rating)} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 4,
        }}
      >
        <Pagination
          count={Math.ceil(apartments.length / itemsPerPage)} // Total pages
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchResults;