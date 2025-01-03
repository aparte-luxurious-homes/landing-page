import React from "react";
import { Container, Typography, Box } from "@mui/material";

const AboutUs: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4, pt: 16 }}>
      <Typography variant="h4" gutterBottom>
        About Us
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" paragraph>
          Aparte Luxurious Home is a premier apartment hosting platform that connects discerning travelers with upscale, handpicked accommodations.
        </Typography>
        <Typography variant="body1" paragraph>
          Our mission is to provide exceptional stays and experiences for our guests, ensuring comfort, luxury, and convenience in every aspect of their journey.
        </Typography>
        <Typography variant="body1" paragraph>
          We carefully select and curate each property to meet our high standards of quality and service, offering a diverse range of options to suit every traveler's needs.
        </Typography>
        <Typography variant="body1" paragraph>
          Thank you for choosing Aparte Luxurious Home. We look forward to hosting you.
        </Typography>
      </Box>
    </Container>
  );
};

export default AboutUs;