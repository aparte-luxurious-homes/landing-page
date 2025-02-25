import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/system';
import defaultImage from '../../assets/images/guest/apart1.6.jpg'; 
import { useAppSelector, useAppDispatch} from '../../hooks';
import { resetFormData } from '../../features/property/propertySlice';

const PreviewCard = styled(Box)(() => ({
  border: '2px solid #028090',
  borderRadius: '12px',
  padding: '16px',
  width: '100%',
  maxWidth: '400px',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#fff',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  marginBottom: '24px',
}));

const PreviewImage = styled('img')(() => ({
  borderRadius: '10px',
  width: '100%',
  height: '280px',
  objectFit: 'cover',
}));

const StyledButton = styled(Button)(() => ({
  backgroundColor: '#028090',
  color: '#fff',
  padding: '12px 32px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#026f7a',
  },
}));

const StatusBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: '#e6f7ff',
  padding: '12px 16px',
  borderRadius: '8px',
  marginBottom: '24px',
  width: '100%',
  maxWidth: '400px',
}));

interface ListFlow11Props {
  onNext: () => void;
}

const ListFlow11: React.FC<ListFlow11Props> = ({ onNext }) => {
  const dispatch = useAppDispatch(); 
  const {
    propertyFormData: {
      name,
      address,
      featuredMedia,
      featuredUnit,
    },
  } = useAppSelector((state) => state.property);
    
  const handleNext = () => {
    dispatch(resetFormData());
    onNext();
  };

  return (
    <Box className="flex flex-col items-center justify-center py-16 px-4 md:py-32 md:px-6">
      <Typography 
        variant="h3" 
        sx={{ 
          color: '#028090',
          fontWeight: 600,
          textAlign: 'center',
          mb: 2
        }}
      >
        Submission Successful!
      </Typography>
      <Typography 
        variant="h6" 
        sx={{ 
          textAlign: 'center',
          color: '#4a5568',
          mb: 4,
          maxWidth: '600px'
        }}
      >
        Your property has been submitted for verification
      </Typography>

      <StatusBox>
        <CalendarMonthIcon sx={{ color: '#028090' }} />
        <Box>
          <Typography sx={{ fontWeight: 500, color: '#1a202c' }}>
            Next Steps
          </Typography>
          <Typography variant="body2" sx={{ color: '#4a5568' }}>
            Our agents will contact you within 24-48 hours to schedule a verification visit
          </Typography>
        </Box>
      </StatusBox>

      <PreviewCard>
        {featuredMedia ? (
          <PreviewImage src={URL.createObjectURL(featuredMedia)} alt="Property Preview" />
        ) : (
          <PreviewImage src={defaultImage} alt="Default Property" />
        )}
        <Box sx={{ width: '100%', px: 1 }}>
          <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 600, mb: 1 }}>
            {name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LocationOnIcon sx={{ fontSize: '1rem', color: '#028090' }} />
            <Typography sx={{ color: '#028090', fontSize: '0.875rem' }}>
              {address}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedIcon sx={{ fontSize: '1rem', color: '#facc15' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#718096' }}>
                Pending Verification
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography sx={{ color: '#028090', fontSize: '1.25rem', fontWeight: 600 }}>
              ₦{featuredUnit?.price_per_night.toLocaleString()}
            </Typography>
            <Typography sx={{ color: '#718096', fontSize: '0.875rem' }}>
              per night
            </Typography>
          </Box>
        </Box>
      </PreviewCard>

      <StyledButton
        onClick={handleNext}
        endIcon={<ArrowForwardIcon />}
      >
        Go to Dashboard
      </StyledButton>
    </Box>
  );
};

export default ListFlow11;