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
  minWidth: '200px',
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

const ListFlow9: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: any }> = ({ onNext, onBack }) => {
  const [media, setMedia] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(null);

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newMedia = Array.from(event.target.files).slice(0, 9 - media.length);
      setMedia((prevMedia) => [...prevMedia, ...newMedia]);
      if (coverIndex === null && newMedia.length > 0) {
        setCoverIndex(media.length);
      }
    }
  };

  const handleMediaClick = (index: number) => {
    const input = document.getElementById(`upload-media-${index}`) as HTMLInputElement;
    input.click();
    input.onchange = (event) => {
      const changeEvent = event as unknown as React.ChangeEvent<HTMLInputElement>;
      if (changeEvent.target.files) {
        const newMedia = changeEvent.target.files[0];
        setMedia((prevMedia) => prevMedia.map((file, i) => (i === index ? newMedia : file)));
      }
    };
  };

  const handleDeleteMedia = (index: number) => {
    setMedia((prevMedia) => prevMedia.filter((_, i) => i !== index));
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
        Add media of your property unit
      </h1>
      <h2 className="text-xl md:text-xl text-center font-medium text-black mb-4">
        Share photos and videos to better show off your property unit
      </h2>
      <p className="text-sm text-gray-600 text-center max-w-md mb-6">
        Capture and share stunning photos and videos of your property unit to attract potential renters or buyers. A picture-perfect way to showcase your home!
      </p>
      <ImageUploadCard>
        {media.map((file, index) => (
          <ImageCard key={index} onClick={() => handleMediaClick(index)}>
            {file.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(file)} alt={`Apartment ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <video src={URL.createObjectURL(file)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} controls />
            )}
            {index === coverIndex && <CoverLabel>Cover Photo</CoverLabel>}
            <input
              accept="image/*,video/*"
              style={{ display: 'none' }}
              id={`upload-media-${index}`}
              type="file"
              onChange={handleMediaUpload}
            />
            <DeleteButton className="delete-icon" onClick={() => handleDeleteMedia(index)}>
              <DeleteIcon sx={{ color: '#fff' }} />
            </DeleteButton>
          </ImageCard>
        ))}
        {media.length < 9 && (
          <label htmlFor="upload-media">
            <input
              accept="image/*,video/*"
              style={{ display: 'none' }}
              id="upload-media"
              type="file"
              multiple
              onChange={handleMediaUpload}
            />
            {media.length === 0 ? (
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
                Upload media
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
          className={`flex items-center px-14 py-2 rounded-md ${media.length > 0 ? 'bg-[#028090] text-white hover:bg-[#026f7a]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          onClick={handleNext}
          disabled={media.length === 0}
        >
          Continue
          <ArrowForwardIcon className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ListFlow9;