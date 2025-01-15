import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { styled } from '@mui/system';
import defaultImage from '../../assets/images/guest/apart1.6.jpg'; 

const PreviewCard = styled('div')(() => ({
  border: '2px solid #028090',
  borderRadius: '10px',
  padding: '10px',
  width: '340px',
  height: '440px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '20px',
}));

const PreviewImage = styled('img')(() => ({
  borderRadius: '10px',
  width: '95%',
  height: '290px',
  objectFit: 'cover',
}));

const RatingBox = styled('div')(() => ({
  backgroundColor: '#028090',
  borderRadius: '5px',
  padding: '2px 2px',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
}));

const ListFlow11: React.FC<{ onNext: () => void; formData: any }> = ({ onNext, formData }) => {
  const handleNext = () => {
    onNext();
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6">
      <h1 className="text-4xl md:text-5xl text-center font-medium" style={{ color: '#028090', marginBottom: '20px' }}>
        Awesome!
      </h1>
      <p className="text-xl md:text-2xl text-center text-black mb-10">
        Your property has been successfully published
      </p>
      <PreviewCard>
        {formData.images && formData.images.length > 0 ? (
          <PreviewImage src={URL.createObjectURL(formData.images[0])} alt="Apartment" />
        ) : (
          <PreviewImage src={defaultImage} alt="Default Apartment" />
        )}
        <h2 style={{ textAlign: 'left', width: '100%', paddingLeft: '5px'}}>{formData.propertyName}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', width: '100%' , paddingLeft: '2px'}}>
          <LocationOnIcon sx={{ fontSize: '1rem', color: '#028090' }} />
          <p style={{ color: '#028090', fontSize: '0.8rem' }}>Alagbado, Lagos</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%', paddingLeft: '5px'}}>
          <RatingBox>
            <p style={{ fontSize: '10px' }}>4.5</p>
          </RatingBox>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', paddingLeft: '5px' }}>
            {[...Array(5)].map((_, index) => (
              <StarIcon key={index} sx={{ fontSize: '0.8rem', color: 'black' }} />
            ))}
          </div>
          <p style={{ fontSize: '0.7rem' }}>1267 Reviews</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%', paddingLeft: '5px' }}>
          <p style={{ color: '#028090', fontSize: '0.8rem' }}>₦300,000</p>
          <p style={{ color: 'gray', fontSize: '0.8rem' }}>per night</p>
        </div>
      </PreviewCard>
      <button
        className="flex items-center px-24 py-2 rounded-md bg-[#028090] text-white hover:bg-[#026f7a] mt-6"
        onClick={handleNext}
      >
        My listings
        <ArrowForwardIcon className="ml-2" />
      </button>
    </div>
  );
};

export default ListFlow11;