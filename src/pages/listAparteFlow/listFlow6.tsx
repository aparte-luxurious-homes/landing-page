import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Typography, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/system';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  setFeaturedMedia,
  setPropertyId,
} from '../../features/property/propertySlice';
import {
  useCreatePropertyMutation,
  useUploadPropertyMediaMutation,
  useAssignAmenitiesToPropertyMutation,
} from '../../api/propertiesApi';
import { AparteFormData } from '~/pages/ListApartePage';

const ImageUploadCard = styled(Box)(() => ({
  width: '100%',
  maxWidth: '800px',
  minHeight: '400px',
  backgroundColor: '#f0f0f0',
  borderRadius: '15px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: '16px',
  padding: '16px',
  border: '2px dashed #ccc',
  '@media (max-width: 480px)': {
    justifyContent: 'center',
    gap: '10px',
    padding: '10px'
  }
}));

const ImageCard = styled(Box)(() => ({
  width: 'calc(33.33% - 11px)',
  height: '180px',
  borderRadius: '10px',
  backgroundColor: '#fff',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  position: 'relative',
  cursor: 'pointer',
  '@media (max-width: 480px)': {
    width: '45%'
  },
  '&:hover': {
    '& .delete-button': {
      opacity: 1
    }
  }
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
  top: '8px',
  right: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: '4px',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  '& svg': {
    fontSize: '20px',
    color: 'white'
  }
}));

const MoreCard = styled(Box)(() => ({
  width: 'calc(33.33% - 11px)',
  height: '180px',
  borderRadius: '10px',
  backgroundColor: 'rgba(0,0,0,0.05)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  cursor: 'pointer',
  '@media (max-width: 480px)': {
    display: 'none',
    '&.show-more': {
      display: 'flex',
      width: '45%',
      margin: 0
    }
  }
}));

const _isImage = (file: File) => file.type.startsWith('image/');

interface ListFlow6Props {
  onNext: () => void;
  onBack: () => void;
  formData: AparteFormData;
  setFormData: React.Dispatch<React.SetStateAction<AparteFormData>>;
}

const ListFlow6: React.FC<ListFlow6Props> = ({ onNext, onBack, formData, setFormData }) => {
  const [media, setMedia] = useState<File[]>(formData.media || []);
  const [coverIndex, setCoverIndex] = useState<number | null>(formData.coverIndex || null);
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const [createPropertyMutation] = useCreatePropertyMutation();
  const [uploadPropertyMedia] = useUploadPropertyMediaMutation();
  const [assignAmenitiesToProperty] = useAssignAmenitiesToPropertyMutation();

  const {
    propertyFormData: {
      propertyId,
      name,
      description,
      property_type,
      country,
      state,
      city,
      address,
      amenities,
    },
  } = useAppSelector((state) => state.property);

  const [descriptionState] = useState(formData.description);

  useEffect(() => {
    if (media.length > 0 || coverIndex !== null) {
      setFormData(prev => ({
        ...prev,
        media,
        coverIndex,
        description: descriptionState
      }));
    }
  }, [media, coverIndex, descriptionState, setFormData]);

  const handleSubmission = async () => {
    if(propertyId){
      onNext();
      return;
    }
    try {
      setLoading(true);
      const result = await createPropertyMutation({
        payload: {
          name,
          description,
          country,
          address,
          city,
          state,
          property_type,
          kyc_id: '1',
        },
      }).unwrap();
      if (!result?.data?.id) {
        // ID not found, error occured - sharp
        // Display a toastr to re-run
        return;
      }
      const _propertyId = result.data.id;

      // upload amenities
      await assignAmenitiesToProperty({
        id: _propertyId,
        amenityIds: amenities,
      }).unwrap();

      // Upload Property Media :)
      const mediaUploadResult = await Promise.allSettled(
        media.map((_media) =>
          uploadPropertyMedia({
            id: _propertyId,
            mediaType: _isImage(_media) ? 'IMAGE' : 'VIDEO',
            media: _media,
          }).unwrap()
        )
      );
      dispatch(setPropertyId(_propertyId));
      dispatch(setFeaturedMedia(media.find((file) => _isImage(file)) || null));
      console.log('Property Media Upload Result: ', mediaUploadResult);
      onNext();
    } catch (err) {
      console.log('Create property error: ', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newMedia = Array.from(event.target.files).slice(
        0,
        9 - media.length
      );
      setMedia((prevMedia) => [...prevMedia, ...newMedia]);
      if (coverIndex === null && newMedia.length > 0) {
        setCoverIndex(media.length);
      }
    }
  };

  const handleMediaClick = (index: number) => {
    const input = document.getElementById(
      `upload-media-${index}`
    ) as HTMLInputElement;
    input.click();
    input.onchange = (event) => {
      const changeEvent =
        event as unknown as React.ChangeEvent<HTMLInputElement>;
      if (changeEvent.target.files) {
        const newMedia = changeEvent.target.files[0];
        setMedia((prevMedia) =>
          prevMedia.map((file, i) => (i === index ? newMedia : file))
        );
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

  // const handleNext = () => {
  //   dispatch(setApartmentMedia(media));
  //   onNext();
  // };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl md:text-3xl text-center font-medium text-black mb-4">
          Add media to your apartment
        </h1>
        <p className="text-lg text-gray-700 text-center mb-2">
          Share photos and videos to better show off your apartment
        </p>
        <p className="text-xs text-gray-600 text-center max-w-md mx-auto mb-8">
          Capture and share stunning photos and videos of your apartment to
          attract potential renters.
        </p>

        <ImageUploadCard>
          {media.slice(0, window.innerWidth <= 480 ? 3 : 9).map((file, index) => (
            <ImageCard 
              key={index} 
              className={`relative ${index === coverIndex ? 'ring-2 ring-[#028090]' : ''}`}
              onClick={() => handleMediaClick(index)}
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Apartment ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <video
                  src={URL.createObjectURL(file)}
                  className="w-full h-full object-cover rounded-lg"
                  controls
                />
              )}
              {index === coverIndex && (
                <CoverLabel>Cover Photo</CoverLabel>
              )}
              <DeleteButton
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMedia(index);
                }}
              >
                <DeleteIcon />
              </DeleteButton>
            </ImageCard>
          ))}
          
          {window.innerWidth <= 480 && media.length > 3 && (
            <MoreCard className="show-more">
              <Typography variant="h6" color="text.secondary">
                +{media.length - 3} more
              </Typography>
            </MoreCard>
          )}

          {media.length < 9 && (
            <UploadPlaceholder>
              <label htmlFor="upload-media" className="cursor-pointer">
                <input
                  accept="image/*,video/*"
                  className="hidden"
                  id="upload-media"
                  type="file"
                  onChange={handleMediaUpload}
                  multiple
                />
                <AddIcon sx={{ fontSize: 40, color: '#666' }} />
              </label>
            </UploadPlaceholder>
          )}
        </ImageUploadCard>

        <div className="flex justify-between w-full mt-8">
          <button
            className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={onBack}
          >
            <ArrowBackIcon className="mr-2" />
            Back
          </button>
          <button
            className={`flex items-center px-14 py-2 rounded-md ${
              media.length > 0
                ? 'bg-[#028090] text-white hover:bg-[#026f7a]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSubmission}
            disabled={media.length === 0 || loading}
          >
            {loading ? (
              <CircularProgress size={24} className="text-white" />
            ) : (
              <>
                Continue
                <ArrowForwardIcon className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListFlow6;
