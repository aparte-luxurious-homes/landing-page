import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Skeleton from '@mui/material/Skeleton';
import { useAppDispatch } from '../../hooks';
import { setAmenities } from '../../features/property/propertySlice';
import { useGetAmenitiesQuery } from '../../api/propertiesApi';

const ListFlow5: React.FC<{
  onNext: () => void;
  onBack: () => void;
  formData: any;
  setFormData: any;
}> = ({ onNext, onBack, formData, setFormData }) => {
  const dispatch = useAppDispatch();
  const [selectedAmenities, setSelectedAmenities] = useState<Array<string>>([]);
  const {
    data: queryResult,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetAmenitiesQuery();

  const handleAmenityToggle = (amenityId: string) => {
    const currentIndex = selectedAmenities.indexOf(amenityId);
    const newSelectedAmenities = [...selectedAmenities];

    if (currentIndex === -1) {
      newSelectedAmenities.push(amenityId);
    } else {
      newSelectedAmenities.splice(currentIndex, 1);
    }

    setSelectedAmenities(newSelectedAmenities);
    setFormData({ ...formData, amenities: newSelectedAmenities });
  };

  const amenityBox = (id: string, amenity: string) => (
    <div
      key={id}
      className={`flex items-center p-4 border rounded-md cursor-pointer ${
        selectedAmenities.includes(id) ? 'border-[#028090]' : 'border-gray-300'
      }`}
      onClick={() => handleAmenityToggle(id)}
    >
      <span className="text-sm">{amenity}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6 md:pt-50">
      <h1 className="text-3xl md:text-2xl text-center text-black mb-2 md:mb-2">
        Select the amenities your property offers
      </h1>
      <p className="text-lg text-gray-700 text-center mb-2">
        Choose from the available amenities
      </p>
      <p className="text-xs text-gray-700 mb-8 text-center max-w-md mx-auto">
        Select the amenities that your property offers to provide a better
        experience for your guests.
      </p>
      <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex justify-center flex-wrap gap-4 mb-8">
          {isLoading || isFetching ? (
            <AmenitySkeleton />
          ) : error ? (
            <div>
              <p>error {JSON.stringify(error)}</p>
              <button
                className="flex items-center px-14 py-2 bg-[#028090] text-white rounded-md hover:bg-[#026f7a]"
                onClick={refetch}
              >Reload</button>
            </div>
          ) : (
            queryResult?.data.map((amenity) =>
              amenityBox(amenity.id, amenity.name)
            )
          )}
        </div>
      </div>
      <div className="flex justify-between w-full max-w-lg mt-8">
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
  );
};

const AmenitySkeleton = () =>
  Array(12)
    .fill(1)
    .map((_, i) => (
      <Skeleton key={i} variant="rounded" width={80} height={40} />
    ));

export default ListFlow5;
