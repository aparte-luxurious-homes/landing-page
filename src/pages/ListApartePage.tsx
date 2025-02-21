import React, { useState } from 'react';
import { Box, IconButton, useMediaQuery, useTheme, Typography, Button, Link } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useGetProfileQuery } from "~/api/profileApi";
import Header from '../sections/Header';
import Partner from '~/sections/Partner';
import Footer from '../sections/Footer';
import ListFlow1 from '../pages/listAparteFlow/listFlow1';
import ListFlow2 from '../pages/listAparteFlow/listFlow2';
import ListFlow3 from '../pages/listAparteFlow/listFlow3';
import ListFlow4 from '../pages/listAparteFlow/listFlow4';
import ListFlow5 from '../pages/listAparteFlow/listFlow5';
import ListFlow6 from '../pages/listAparteFlow/listFlow6';
import ListFlow7 from '../pages/listAparteFlow/listFlow7';
// import ListFlow8 from '../pages/listAparteFlow/listFlow8';
// import ListFlow9 from '../pages/listAparteFlow/listFlow9';
import ListFlow10 from '../pages/listAparteFlow/listFlow10';
import ListFlow11 from '../pages/listAparteFlow/listFlow11';

interface Section {
  name: string;
  units: number;
  price: string;
}

interface FormData {
  apartmentType: string;
  sections: Section[];
  description: string;
}

const ListApartePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { data, isLoading } = useGetProfileQuery();
  const [currentFlow, setCurrentFlow] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    apartmentType: '',
    sections: [],
    description: '',
  });

  // Check if user is an agent/owner
  const userRole = data?.data?.role;
  const canAccessListing = userRole === 'AGENT' || userRole === 'OWNER';

  if (!isLoading && !canAccessListing) {
    return (
      <>
        {!isMobile && <Header />}
        <Box sx={{ 
          minHeight: isMobile ? '100vh' : 'calc(100vh - 160px)',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          position: 'relative'
        }}>
          {isMobile && (
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ 
                position: 'absolute',
                top: 16,
                left: 16,
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
            You need to be registered as an agent or owner to list on{' '}
            <Link 
              href="/"
              sx={{ 
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Aparté
            </Link>
          </Typography>
          <Button 
            variant="contained"
            onClick={() => navigate('/signup?role=agent')}
            sx={{ 
              textTransform: 'none',
              borderRadius: 1.5,
              py: 1,
              px: 3
            }}
          >
            Sign up as Agent/Owner
          </Button>
        </Box>
        {!isMobile && <Partner />}
        {!isMobile && <Footer />}
      </>
    );
  }

  const handleNextFlow = () => setCurrentFlow((prev) => Math.min(prev + 1, flows.length));
  const handleBackFlow = () => setCurrentFlow((prev) => Math.max(prev - 1, 1));

  const handleBackClick = () => {
    if (currentFlow > 1) {
      handleBackFlow();
    } else {
      navigate(-1);
    }
  };

  // Array of flow components for dynamic rendering
  const flows = [
    <ListFlow1 onNext={handleNextFlow} />,
    <ListFlow2 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow3 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow4 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow5 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow6 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow7 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    // <ListFlow8 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    // <ListFlow9 onNext={handleNextFlow} onBack={handleBackFlow} formData={formData} setFormData={setFormData} />,
    <ListFlow10 onNext={handleNextFlow} onBack={handleBackFlow}  />,
    <ListFlow11 onNext={handleNextFlow} formData={formData} />,
  ];

  return (
    <>
      {!isMobile && <Header />}
      <Box sx={{ 
        position: 'relative',
        minHeight: isMobile ? '100vh' : 'calc(100vh - 160px)' // Account for header and footer
      }}>
        {isMobile && (
          <IconButton 
            onClick={handleBackClick}
            sx={{ 
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: 1,
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        {flows[currentFlow - 1] || <div>Flow not found</div>}
      </Box>
      {!isMobile && <Partner />}
      {!isMobile && <Footer />}
    </>
  );
};

export default ListApartePage;
