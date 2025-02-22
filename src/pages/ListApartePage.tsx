import React, { useState, useMemo, useCallback } from 'react';
import { Box, IconButton, useMediaQuery, useTheme, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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

export interface AparteFormData {
  apartmentType: string;
  sections: Section[];
  description: string;
  media: File[];
  coverIndex: number | null;
  amenities: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
}

const ListApartePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { data, isLoading } = useGetProfileQuery();
  const [currentFlow, setCurrentFlow] = useState(1);
  const [formData, setFormData] = useState<AparteFormData>({
    apartmentType: '',
    sections: [],
    description: '',
    media: [],
    coverIndex: null,
    amenities: [],
  });

  const handleNextFlow = useCallback((): void => 
    setCurrentFlow((prev) => Math.min(prev + 1, 11)), []);
    
  const handleBackFlow = useCallback((): void => 
    setCurrentFlow((prev) => Math.max(prev - 1, 1)), []);

  // Memoize the flows array to prevent unnecessary re-renders
  const flows: JSX.Element[] = useMemo(() => [
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
  ], [formData, handleNextFlow, handleBackFlow]);

  // Show nothing while checking auth status
  if (isLoading) {
    return null;
  }

  // If not logged in, show auth dialog
  if (!data?.data) {
    return (
      <Dialog
        fullWidth
        open={true}
        sx={{ backdropFilter: 'blur(50px)' }}
      >
        <DialogTitle>Authentication Required</DialogTitle>
        <DialogContent>
          <Typography>You need to be logged in to list your property on Aparté.</Typography>
        </DialogContent>
        <DialogActions sx={{ padding: "16px"}}>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
          <Button
            onClick={() => navigate('/signup?role=owner')}
            color="primary"
            variant="contained"
          >
            Sign up as Owner
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Check if user is an agent/owner
  const userRole = data.data.role;
  const canAccessListing = userRole === 'AGENT' || userRole === 'OWNER';

  // If logged in but not agent/owner, show upgrade prompt
  if (!canAccessListing) {
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
            You need to be registered as an agent or owner to list on Aparté
          </Typography>
          <Button 
            variant="contained"
            onClick={() => navigate('/signup?role=owner')}
            sx={{ 
              textTransform: 'none',
              borderRadius: 1.5,
              py: 1,
              px: 3
            }}
          >
            Upgrade to Owner Account
          </Button>
        </Box>
        {!isMobile && <Partner />}
        {!isMobile && <Footer />}
      </>
    );
  }

  const handleBackClick = () => {
    if (currentFlow > 1) {
      handleBackFlow();
    } else {
      navigate(-1);
    }
  };

  return (
    <Box 
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {!isMobile && <Header />}
      
      <Box sx={{
        flex: 1,
        position: 'relative',
        px: isMobile ? 2 : 4,
        py: isMobile ? 2 : 4,
        maxWidth: '1200px',
        mx: 'auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: isMobile ? '100vh' : 'auto',
        overflow: isMobile ? 'hidden' : 'visible'
      }}>
        {isMobile && (
          <IconButton 
            onClick={handleBackClick}
            sx={{ 
              position: 'absolute',
              top: 16,
              left: 16,
              zIndex: theme.zIndex.appBar,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'background.paper',
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        
        <Box sx={{
          mt: isMobile ? 7 : 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: isMobile ? 'hidden' : 'visible'
        }}>
          {flows[currentFlow - 1] || <div>Flow not found</div>}
        </Box>
      </Box>

      {!isMobile && <Partner />}
      {!isMobile && <Footer />}
    </Box>
  );
};

export default ListApartePage;
