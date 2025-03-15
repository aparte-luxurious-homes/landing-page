import React, { useState } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Typography, IconButton, CircularProgress } from '@mui/material'
import { styled } from '@mui/system'
import { useAppDispatch } from '../../hooks'
import { setAmenities } from '../../features/property/propertySlice'
import { useGetAmenitiesQuery } from '../../api/propertiesApi'
import { AparteFormData } from '../../pages/ListApartePage'

const AmenitiesGrid = styled(Box)(() => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '16px',
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  '@media (max-width: 600px)': {
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '12px'
  }
}))

const AmenityCard = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }
}))

interface ListFlow6Props {
  onNext: () => void
  onBack: () => void
  formData: AparteFormData
  setFormData: React.Dispatch<React.SetStateAction<AparteFormData>>
}

const ListFlow6: React.FC<ListFlow6Props> = ({ onNext, onBack, formData, setFormData }) => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(formData.amenities || [])
  const dispatch = useAppDispatch()
  const { data: amenities, isLoading, error } = useGetAmenitiesQuery()

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev => {
      const newAmenities = prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
      
      setFormData(prevData => ({
        ...prevData,
        amenities: newAmenities
      }))
      
      return newAmenities
    })
  }

  const handleSubmit = () => {
    dispatch(setAmenities(selectedAmenities))
    setFormData(prevData => ({
      ...prevData,
      amenities: selectedAmenities
    }))
    setTimeout(() => {
      onNext()
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    )
  }

  if (error || !amenities?.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Typography variant="h6" color="error" gutterBottom>
          Failed to load amenities
        </Typography>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-[#028090] text-white rounded-md hover:bg-[#026f7a]"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl md:text-3xl text-center font-medium text-black mb-4">
          What amenities does your property have?
        </h1>
        <p className="text-lg text-gray-700 text-center mb-2">
          Select all the amenities available at your property
        </p>
        <p className="text-xs text-gray-600 text-center max-w-md mx-auto mb-8">
          Choose from our comprehensive list of amenities to showcase what makes your property special
        </p>

        <AmenitiesGrid>
          {amenities.data.map((amenity) => (
            <AmenityCard
              key={amenity.id}
              onClick={() => handleAmenityToggle(amenity.id)}
              sx={{
                borderColor: selectedAmenities.includes(amenity.id) ? '#028090' : 'grey.300',
                backgroundColor: selectedAmenities.includes(amenity.id)
                  ? 'rgba(2, 128, 144, 0.05)'
                  : 'transparent',
                '&:hover': {
                  borderColor: '#028090',
                  backgroundColor: 'rgba(2, 128, 144, 0.05)'
                }
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: selectedAmenities.includes(amenity.id) ? 500 : 400,
                  color: selectedAmenities.includes(amenity.id) ? '#028090' : 'text.primary'
                }}
              >
                {amenity.name}
              </Typography>
            </AmenityCard>
          ))}
        </AmenitiesGrid>

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
              selectedAmenities.length > 0
                ? 'bg-[#028090] text-white hover:bg-[#026f7a]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={selectedAmenities.length === 0}
          >
                Continue
                <ArrowForwardIcon className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ListFlow6 