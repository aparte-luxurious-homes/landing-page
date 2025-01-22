import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button, Typography, IconButton } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';

const ImageUploadCard = styled(Box)(() => ({
  width: '100%',
  maxWidth: '800px',
  height: '400px',
  backgroundColor: '#f0f0f0',
  borderRadius: '15px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',
  padding: '10px',
  border: '2px dashed #ccc',
}));

const ImageCard = styled(Box)(() => ({
  width: '30%',
  height: '180px',
  borderRadius: '10px',
  backgroundColor: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  '&:hover .delete-icon': {
    display: 'block',
  },
}));

const UploadPlaceholder = styled(Box)(() => ({
  width: '30%',
  height: '180px',
  borderRadius: '10px',
  backgroundColor: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: '2px dashed #ccc',
  cursor: 'pointer',
}));

const CoverLabel = styled(Typography)(() => ({
  position: 'absolute',
  top: '0',
  left: '0',
  backgroundColor: '#fff',
  color: '#028090',
  padding: '2px 8px',
  borderRadius: '0 0 10px 0',
  fontSize: '0.75rem',
}));

const DeleteButton = styled(IconButton)(() => ({
  position: 'absolute',
  bottom: '3px',
  right: '10px',
  display: 'none',
}));

const ListFlow8: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: any }> = ({ onNext, onBack }) => {
  const [images, setImages] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newImages = Array.from(event.target.files).slice(0, 6 - images.length);
      setImages((prevImages) => [...prevImages, ...newImages]);
      if (coverIndex === null && newImages.length > 0) {
        setCoverIndex(images.length);
      }
    }
  };

  const handleImageClick = (index: number) => {
    const input = document.getElementById(`upload-photo-${index}`) as HTMLInputElement;
    input.click();
    input.onchange = (event) => {
      const changeEvent = event as unknown as React.ChangeEvent<HTMLInputElement>;
      if (changeEvent.target.files) {
        const newImage = changeEvent.target.files[0];
        setImages((prevImages) => prevImages.map((img, i) => (i === index ? newImage : img)));
      }
    };
  };

  const handleDeleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    if (coverIndex === index) {
      setCoverIndex(null);
    } else if (coverIndex !== null && coverIndex > index) {
      setCoverIndex(coverIndex - 1);
    }
  };

  const handleNext = () => {
    onNext();
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6">
      <h1 className="text-3xl md:text-3xl text-center font-medium text-black mb-6 md:mb-6">
        Add up photos of your apartment
      </h1>
      <h2 className="text-xl md:text-xl text-center font-medium text-black mb-4">
        Share photos to better show off your apartment
      </h2>
      <p className="text-sm text-gray-600 text-center max-w-md mb-6">
        Capture and share stunning photos of your apartment to attract potential renters or buyers. A picture-perfect way to showcase your home!
      </p>
      <ImageUploadCard>
        {images.map((image, index) => (
          <ImageCard key={index} onClick={() => handleImageClick(index)}>
            <img src={URL.createObjectURL(image)} alt={`Apartment ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {index === coverIndex && <CoverLabel>Cover Photo</CoverLabel>}
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id={`upload-photo-${index}`}
              type="file"
              onChange={handleImageUpload}
            />
            <DeleteButton className="delete-icon" onClick={() => handleDeleteImage(index)}>
              <DeleteIcon sx={{ color: '#fff' }} />
            </DeleteButton>
          </ImageCard>
        ))}
        {images.length < 6 && (
          <label htmlFor="upload-photo">
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-photo"
              type="file"
              multiple
              onChange={handleImageUpload}
            />
            {images.length === 0 ? (
              <Button
                variant="contained"
                component="span"
                startIcon={<ImageIcon />}
                sx={{
                  backgroundColor: '#fff',
                  color: 'black',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '12px 50px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#f0f0f0',
                  },
                }}
              >
                Upload photos
              </Button>
            ) : (
              <UploadPlaceholder>
                <AddIcon sx={{ color: '#ccc', fontSize: '2rem' }} />
              </UploadPlaceholder>
            )}
          </label>
        )}
      </ImageUploadCard>
      <div className="flex justify-between w-full max-w-2xl mt-8">
        <button
          className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          onClick={handleBack}
        >
          <ArrowBackIcon className="mr-2" />
          Back
        </button>
        <button
          className={`flex items-center px-14 py-2 rounded-md ${images.length > 0 ? 'bg-[#028090] text-white hover:bg-[#026f7a]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          onClick={handleNext}
          disabled={images.length === 0}
        >
          Continue
          <ArrowForwardIcon className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ListFlow8;