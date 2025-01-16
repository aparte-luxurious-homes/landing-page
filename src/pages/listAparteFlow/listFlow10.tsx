import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SendIcon from '@mui/icons-material/Send';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import { Box } from '@mui/material';
import { styled } from '@mui/system';
import defaultImage from '../../assets/images/guest/apart1.6.jpg'; 

const PreviewCard = styled(Box)(() => ({
  border: '2px solid #028090',
  borderRadius: '10px',
  padding: '10px',
  width: '470px',
  height: '420px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
}));

const PreviewImage = styled('img')(() => ({
  borderRadius: '10px',
  width: '95%',
  height: '300px',
  objectFit: 'cover',
}));

const RatingBox = styled(Box)(() => ({
  backgroundColor: '#028090',
  borderRadius: '4px',
  padding: '2px 3px',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
}));

const ListFlow10: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: any }> = ({ onNext, onBack, formData, setFormData }) => {
  const handleNext = () => {
    setFormData({ ...formData, status: 'published' });
    onNext();
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6">
      <h1 className="text-3xl md:text-3xl text-center font-medium text-black mb-6 md:mb-6">
        Preview property
      </h1>
      <p className="text-xl md:text-xl text-center text-black mb-16">
        This is how users see your apartment
      </p>
      <div className="flex w-full max-w-4xl">
        <PreviewCard>
          {formData.images && formData.images.length > 0 ? (
            <PreviewImage src={URL.createObjectURL(formData.images[0])} alt="Apartment" />
          ) : (
            <PreviewImage src={defaultImage} alt="Default Apartment" />
          )}
          <h3 style={{ textAlign: 'left', width: '100%', paddingLeft: '5px', fontSize: '12px', lineHeight: '0.2', marginTop: '3px'}}>{formData.propertyName}</h3>
          <Box display="flex" alignItems="center" gap="3px" width="100%" paddingLeft={0.3} fontSize= "12px" lineHeight='0.2'>
            <LocationOnIcon sx={{ fontSize: '12px', color: '#028090' }} />
            <p style={{ color: '#028090', fontSize: '12px' }}>Alagbado, Lagos</p>
          </Box>
          <Box display="flex" alignItems="center" gap="5px" width="100%" paddingLeft={0.3} fontSize= "12px" lineHeight='0.2'>
            <RatingBox>
              <p style={{ fontSize: '7px' }}>4.5</p>
            </RatingBox>
            <Box display="flex" alignItems="center" gap="2px">
              {[...Array(5)].map((_, index) => (
                <StarIcon key={index} sx={{ fontSize: '10px', color: 'black' }} />
              ))}
            </Box>
            <p style={{ fontSize: '9px' }}>1267 Reviews</p>
          </Box>
          <Box display="flex" alignItems="center" gap="5px" width="100%" paddingLeft={0.3}>
            <p style={{ color: '#028090', fontSize: '0.8rem', font: 'bold'}}>₦300,000</p>
            <p style={{ color: 'gray', fontSize: '8px' }}>per night</p>
          </Box>
        </PreviewCard>
        <Box ml={10} mt={10} display="flex" flexDirection="column" gap="30px">
          <Box>
            <h3 style={{ color: 'black', fontSize: '24px', marginBottom: '5px'}}>You did great!</h3>
            <Box display="flex" alignItems="center" gap="10px">
              <CheckCircleIcon sx={{ color: 'black' }} />
              <p>Check again before proceeding</p>
            </Box>
            <p style={{ color: 'gray', paddingLeft: '35px'  }}>
              A crucial reminder to verify all property details, terms, and conditions before finalizing your decision.
            </p>
          </Box>
          <Box>
            <Box display="flex" alignItems="center" gap="10px">
              <SendIcon sx={{ color: 'black' }} />
              <p>Go ahead and publish your property</p>
            </Box>
            <p style={{ color: 'gray', paddingLeft: '35px' }}>
              You're all set! Your property details are complete and ready to go live. Click 'Publish' to make your listing go live!
            </p>
          </Box>
        </Box>
      </div>
      <div className="flex justify-between w-full max-w-2xl mt-8">
        <button
          className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          onClick={handleBack}
        >
          <ArrowBackIcon className="mr-2" />
          Back
        </button>
        <button
          className="flex items-center px-14 py-2 rounded-md bg-[#028090] text-white hover:bg-[#026f7a]"
          onClick={handleNext}
        >
          Publish
          <ArrowForwardIcon className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ListFlow10;