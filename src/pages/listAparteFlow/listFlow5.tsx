import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Skeleton from '@mui/material/Skeleton';
import { useAppDispatch } from '../../hooks';
import { setAmenities } from '../../features/property/propertySlice';
import { useGetAmenitiesQuery } from '../../api/propertiesApi';

interface FormData {
  amenities: string[];
}

interface ListFlow5Props {
  onNext: () => void;
  onBack: () => void;
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const ListFlow5: React.FC<ListFlow5Props> = ({ onNext, onBack, formData, setFormData }) => {
  const dispatch = useAppDispatch();
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(formData.amenities || []);
  const { data: queryResult, error, isLoading, isFetching, refetch } = useGetAmenitiesQuery();

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev => {
      const newAmenities = prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId];
      return newAmenities;
    });
    
    const newAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter(id => id !== amenityId)
      : [...selectedAmenities, amenityId];
    setFormData({ ...formData, amenities: newAmenities });
  };

  const renderAmenityBox = (id: string, amenity: string) => (
    <div
      key={id}
      className={`
        flex items-center p-4 border rounded-md cursor-pointer transition-all duration-200
        ${selectedAmenities.includes(id) 
          ? 'border-[#028090] bg-[#028090]/5' 
          : 'border-gray-300 hover:border-[#028090]/50'
        }
        w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-8px)]
      `}
      onClick={() => handleAmenityToggle(id)}
    >
      <span className="text-sm font-medium">{amenity}</span>
    </div>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-500 mb-4">Failed to load amenities</p>
        <button
          className="px-6 py-2 bg-[#028090] text-white rounded-md hover:bg-[#026f7a]"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6 md:pt-50">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl md:text-2xl text-center text-black mb-2">
          Select the amenities your property offers
        </h1>
        <p className="text-lg text-gray-700 text-center mb-2">
          Choose from the available amenities
        </p>
        <p className="text-xs text-gray-700 mb-8 text-center max-w-md mx-auto">
          Select the amenities that your property offers to provide a better
          experience for your guests.
        </p>
        
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <div className="flex flex-wrap gap-4">
            {isLoading || isFetching ? (
              <AmenitySkeleton />
            ) : (
              queryResult?.data.map(amenity => renderAmenityBox(amenity.id, amenity.name))
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={onBack}
          >
            <ArrowBackIcon className="mr-2" />
            Back
          </button>
          <button
            className="flex items-center px-14 py-2 bg-[#028090] text-white rounded-md hover:bg-[#026f7a]"
            onClick={() => {
              dispatch(setAmenities(selectedAmenities));
              onNext();
            }}
          >
            Continue
            <ArrowForwardIcon className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AmenitySkeleton = () =>
  Array(12)
    .fill(1)
    .map((_, i) => (
      <Skeleton key={i} variant="rounded" width={80} height={40} />
    ));

export default ListFlow5;
