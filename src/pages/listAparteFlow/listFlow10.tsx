import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useAppSelector } from '../../hooks';

import defaultImage from '../../assets/images/guest/apart1.6.jpg';

const PreviewCard = styled(Box)(() => ({
  border: '2px solid #028090',
  borderRadius: '12px',
  padding: '16px',
  width: '100%',
  maxWidth: '470px',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  backgroundColor: '#fff',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
}));

const PreviewImage = styled('img')(() => ({
  borderRadius: '10px',
  width: '100%',
  height: 'auto',
  maxHeight: '300px',
  objectFit: 'cover',
}));

const RatingBox = styled(Box)(() => ({
  backgroundColor: '#028090',
  borderRadius: '4px',
  padding: '4px 6px',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
}));

const StyledButton = styled('button')(({ variant }: { variant: 'outlined' | 'contained' }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: variant === 'contained' ? '12px 32px' : '12px 16px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontWeight: 500,
  ...(variant === 'contained' ? {
    backgroundColor: '#028090',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#026f7a',
    },
  } : {
    backgroundColor: 'transparent',
    color: '#4a5568',
    '&:hover': {
      backgroundColor: '#f7fafc',
    },
  }),
}));

const ListFlow10: React.FC<{
  onNext: () => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const {
    propertyFormData: {
      name,
      address,
      featuredMedia,
      featuredUnit,
    },
  } = useAppSelector((state) => state.property);

  return (
    <Box className="flex flex-col items-center justify-center py-16 px-4 md:py-32 md:px-6">
      <Typography 
        variant="h4" 
        sx={{ 
          fontSize: { xs: '1.75rem', md: '2rem' },
          fontWeight: 600,
          textAlign: 'center',
          mb: 2,
          color: '#1a202c'
        }}
      >
        Preview Your Property
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          fontSize: { xs: '1rem', md: '1.125rem' },
          textAlign: 'center',
          color: '#4a5568',
          mb: 6,
          maxWidth: '600px'
        }}
      >
        Here's how your property will appear after verification
      </Typography>

      <Box className="flex flex-col md:flex-row w-full max-w-5xl gap-8 md:gap-16">
        <PreviewCard>
          {featuredMedia ? (
            <PreviewImage
              src={URL.createObjectURL(featuredMedia)}
              alt="Property Preview"
            />
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
              <RatingBox>4.5</RatingBox>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {[...Array(5)].map((_, index) => (
                  <StarIcon key={index} sx={{ fontSize: '0.875rem', color: '#2d3748' }} />
                ))}
              </Box>
              <Typography sx={{ fontSize: '0.75rem', color: '#718096' }}>
                1267 Reviews
              </Typography>
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

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#1a202c', mb: 2, fontWeight: 600 }}>
              Almost there!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <CheckCircleIcon sx={{ color: '#028090' }} />
              <Box>
                <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                  Review your listing details
                </Typography>
                <Typography sx={{ color: '#718096' }}>
                  Take a moment to verify all property information before proceeding.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <VerifiedIcon sx={{ color: '#028090' }} />
              <Box>
                <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                  Verification Process
                </Typography>
                <Typography sx={{ color: '#718096' }}>
                  After submission, our agents will verify your property in person. Once approved, your listing will be made public on Aparte.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <SendIcon sx={{ color: '#028090' }} />
              <Box>
                <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                  Submit for Verification
                </Typography>
                <Typography sx={{ color: '#718096' }}>
                  Ready to proceed? Click 'Submit' to begin the verification process. We'll be in touch to schedule a visit.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        width: '100%', 
        maxWidth: '600px', 
        mt: 6,
        px: { xs: 2, md: 0 }
      }}>
        <StyledButton variant="outlined" onClick={onBack}>
          <ArrowBackIcon sx={{ mr: 1 }} />
          Back
        </StyledButton>
        <StyledButton variant="contained" onClick={onNext}>
          Submit
          <ArrowForwardIcon sx={{ ml: 1 }} />
        </StyledButton>
      </Box>
    </Box>
  );
};

export default ListFlow10;
