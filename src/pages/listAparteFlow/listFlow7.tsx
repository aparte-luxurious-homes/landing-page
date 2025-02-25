import React, { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import HouseIcon from '@mui/icons-material/House';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';

import {
  TextField,
  Collapse,
  IconButton,
  InputAdornment,
  Typography,
  Grid,
  Button,
  Box,
  FormControlLabel,
  Switch,
} from '@mui/material';

import { useAppSelector, useAppDispatch } from '../../hooks';
import {
  useGetAmenitiesQuery,
  useAddPropertyUnitMutation,
  useAssignAmenitiesToUnitMutation,
  useUploadUnitMediaMutation,
} from '../../api/propertiesApi';
import { styled } from '@mui/system';
import {
  addPendingUnit,
  clearPendingUnits,
  addUploadedUnits,
} from '../../features/property/propertySlice';

const ImageUploadCard = styled(Box)(() => ({
  width: '100%',
  maxWidth: '800px',
  minHeight: '150px',
  borderRadius: '8px',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '12px',
  border: '1px dashed #e0e0e0',
  '@media (max-width: 480px)': {
    justifyContent: 'center',
    gap: '8px',
    padding: '8px'
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
    width: '45%',
    height: '150px'
  },
  '&:hover .delete-icon': {
    opacity: 1
  }
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
  '@media (max-width: 480px)': {
    opacity: 1
  }
}));

const FormContainer = styled(Box)(() => ({
  width: '100%',
  maxWidth: '800px',
  margin: '0 auto',
  padding: '16px',
  marginTop: '60px',
  '@media (max-width: 768px)': {
    padding: '12px',
    marginTop: '40px'
  }
}));

const UnitAccordion = styled('div')(() => ({
  marginBottom: '24px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  overflow: 'hidden',
  '& .MuiCollapse-root': {
    borderTop: '1px solid #e0e0e0'
  }
}));

const FormSection = styled('div')(() => ({
  marginBottom: '24px',
  '@media (max-width: 768px)': {
    marginBottom: '16px'
  }
}));

const InputGrid = styled(Grid)(() => ({
  display: 'grid',
  gap: '20px',
  '& .MuiGrid-item': {
    width: '100%',
    padding: 0
  },
  '@media (min-width: 768px)': {
    gridTemplateColumns: 'repeat(12, 1fr)',
    '& .unit-name': { gridColumn: 'span 8' },
    '& .unit-count': { gridColumn: 'span 4' },
    '& .unit-description': { gridColumn: 'span 12' },
    '& .price': { gridColumn: 'span 5' },
    '& .guests': { gridColumn: 'span 4' },
    '& .whole-property': { gridColumn: 'span 3' },
    '& .room-count': { gridColumn: 'span 3' }
  },
  '@media (max-width: 767px)': {
    gap: '12px',
    gridTemplateColumns: 'repeat(4, 1fr)',
    '& .unit-name': { gridColumn: 'span 3' },
    '& .unit-count': { gridColumn: 'span 1' },
    '& .unit-description': { gridColumn: 'span 4' },
    '& .price': { gridColumn: 'span 2' },
    '& .guests': { gridColumn: 'span 2' },
    '& .whole-property': { gridColumn: 'span 4' },
    '& .room-count': { gridColumn: 'span 1' }
  }
}));

const StyledTextField = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: '1px solid #e0e0e0',
    '&:hover': {
      borderColor: '#028090',
    },
    '&.Mui-focused': {
      borderColor: '#028090',
      backgroundColor: 'transparent',
    },
    '&.Mui-error': {
      borderColor: '#d32f2f',
    }
  },
  '@media (max-width: 768px)': {
    '& .MuiInputLabel-root': {
      fontSize: '0.75rem',
      transform: 'translate(12px, 8px) scale(1)',
      '&.Mui-focused, &.MuiFormLabel-filled': {
        transform: 'translate(12px, -9px) scale(0.75)',
      }
    },
    '& .MuiInputBase-input': {
      padding: '8px 12px',
      fontSize: '0.875rem',
      height: '20px'
    },
    '& .MuiFormHelperText-root': {
      display: 'none'
    },
    '& .MuiInputBase-root.Mui-error': {
      borderColor: '#d32f2f',
      borderWidth: '2px'
    }
  }
}));

const ActionButtons = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '24px',
  '@media (max-width: 768px)': {
    marginTop: '16px'
  }
}));

const UploadPlaceholder = styled('label')(() => ({
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

const UnitCard = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  margin: '8px 16px',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  '@media (max-width: 768px)': {
    padding: '12px',
    gap: '12px',
    margin: '8px'
  }
}));

const UnitImage = styled('img')(() => ({
  width: '100px',
  height: '100px',
  borderRadius: '8px',
  objectFit: 'cover',
  border: '1px solid #e0e0e0',
  '@media (max-width: 768px)': {
    width: '80px',
    height: '80px'
  }
}));

interface PropertyUnit {
  id?: string | null;
  propertyId?: string | null;
  name: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  count: number;
  is_whole_property: boolean;
  bedroom_count: number;
  bathroom_count: number;
  living_room_count: number;
  kitchen_count: number;
  image?: File | null;
}

interface ListFlow7Props {
  onNext: () => void;
  onBack?: () => void;
}

interface NewUnit {
  title: string;
  description: string;
  price: string;
  max_guests: string;
  bedroom: string;
  living_room: string;
  kitchen: string;
  bathroom: string;
  is_whole_property: boolean;
  units: string;
}

interface FormErrors {
  title: string;
  description: string;
  units: string;
  price: string;
  max_guests: string;
  bedroom: string;
  bathroom: string;
  living_room: string;
  kitchen: string;
  media: string;
  amenities: string;
}

interface CreatedUnitResponse {
  id: string;
  name: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  count: number;
  is_whole_property: boolean;
  bedroom_count: number;
  bathroom_count: number;
  living_room_count: number;
  kitchen_count: number;
}

const _isImage = (file: File) => file.type.startsWith('image/');

const ListFlow7: React.FC<ListFlow7Props> = ({ onNext }) => {
  const dispatch = useAppDispatch();
  const { units } = useAppSelector((state) => state.property);
  const { propertyFormData } = useAppSelector((state) => state.property);
  const { propertyId } = propertyFormData;
  const { data: queryResult } = useGetAmenitiesQuery();
  const [addPropertyUnit] = useAddPropertyUnitMutation();
  const [uploadUnitMedia] = useUploadUnitMediaMutation();
  const [assignAmenitiesToUnit] = useAssignAmenitiesToUnitMutation();

  const [loading, setLoading] = useState<boolean>(false);
  const [isCollapsed, setCollapse] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<Array<string>>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [coverIndex, setCoverIndex] = useState<number | null>(null);

  const [newUnit, setNewUnit] = useState<NewUnit>({
    title: '',
    description: '',
    price: '',
    max_guests: '',
    bedroom: '',
    living_room: '',
    kitchen: '',
    bathroom: '',
    is_whole_property: false,
    units: '',
  });

  const [errors, setErrors] = useState<FormErrors>({
    title: '',
    description: '',
    units: '',
    price: '',
    max_guests: '',
    bedroom: '',
    bathroom: '',
    living_room: '',
    kitchen: '',
    media: '',
    amenities: ''
  });

  const validateForm = (): boolean => {
    console.log('Validating form with values:', newUnit);
    console.log('Selected amenities:', selectedAmenities);
    console.log('Media files:', mediaFiles);
    console.log('Cover index:', coverIndex);

    const newErrors: FormErrors = {
      title: '',
      description: '',
      units: '',
      price: '',
      max_guests: '',
      bedroom: '',
      bathroom: '',
      living_room: '',
      kitchen: '',
      media: '',
      amenities: ''
    };

    let isValid = true;

    // Required fields validation with detailed logging
    if (!newUnit.title.trim()) {
      newErrors.title = 'Unit title is required';
      isValid = false;
      console.log('Title validation failed');
    }
    if (!newUnit.description.trim()) {
      newErrors.description = 'Unit description is required';
      isValid = false;
      console.log('Description validation failed');
    }
    if (!newUnit.units || Number(newUnit.units) <= 0) {
      newErrors.units = 'At least one unit is required';
      isValid = false;
      console.log('Units validation failed:', newUnit.units);
    }
    if (!newUnit.price || Number(newUnit.price) <= 0) {
      newErrors.price = 'Valid price is required';
      isValid = false;
      console.log('Price validation failed:', newUnit.price);
    }
    if (!newUnit.max_guests || Number(newUnit.max_guests) <= 0 || Number(newUnit.max_guests) > 20) {
      newErrors.max_guests = 'Guests must be between 1 and 20';
      isValid = false;
      console.log('Max guests validation failed:', newUnit.max_guests);
    }

    // Room validations
    if (newUnit.bedroom === '' || Number(newUnit.bedroom) > 10) {
      newErrors.bedroom = 'Bedrooms must be between 0 and 10';
      isValid = false;
      console.log('Bedroom validation failed:', newUnit.bedroom);
    }
    if (newUnit.bathroom === '' || Number(newUnit.bathroom) > 10) {
      newErrors.bathroom = 'Bathrooms must be between 0 and 10';
      isValid = false;
      console.log('Bathroom validation failed:', newUnit.bathroom);
    }
    if (newUnit.living_room === '' || Number(newUnit.living_room) > 5) {
      newErrors.living_room = 'Living rooms must be between 0 and 5';
      isValid = false;
      console.log('Living room validation failed:', newUnit.living_room);
    }
    if (newUnit.kitchen === '' || Number(newUnit.kitchen) > 3) {
      newErrors.kitchen = 'Kitchens must be between 0 and 3';
      isValid = false;
      console.log('Kitchen validation failed:', newUnit.kitchen);
    }

    // Media and amenities validation
    if (mediaFiles.length === 0) {
      newErrors.media = 'At least one image is required';
      isValid = false;
      console.log('Media validation failed: No files');
    }
    if (coverIndex === null && mediaFiles.length > 0) {
      newErrors.media = 'Please select a cover photo';
      isValid = false;
      console.log('Media validation failed: No cover photo selected');
    }
    if (selectedAmenities.length === 0) {
      newErrors.amenities = 'Please select at least one amenity';
      isValid = false;
      console.log('Amenities validation failed: None selected');
    }

    console.log('Validation errors:', newErrors);
    console.log('Form is valid:', isValid);
    
    setErrors(newErrors);
    return isValid;
  };

  // Add this helper function to show error message at the top if needed
  const renderFormError = () => {
    const errorMessages = Object.values(errors).filter(error => error !== '');
    if (errorMessages.length > 0) {
      return (
        <Box 
          sx={{ 
            backgroundColor: '#fdeded', 
            color: '#5f2120',
            padding: 2,
            borderRadius: 1,
            marginBottom: 2
          }}
        >
          <Typography variant="body2" component="div">
            Please fix the following errors:
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
              {errorMessages.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const handleSubmission = async () => {
    console.log('handleSubmission called');
    try {
      if (!propertyId) {
        console.error('PropertyId missing:', propertyId);
        throw new Error('No property ID found');
      }

      const isValid = validateForm();
      console.log('Form validation result:', isValid);
      if (!isValid) {
        return;
      }

      // Prepare unit data
      const unitParam = {
        name: newUnit.title.trim(),
        description: newUnit.description.trim(),
        price_per_night: Number(newUnit.price),
        max_guests: Number(newUnit.max_guests),
        count: Number(newUnit.units),
        is_whole_property: newUnit.is_whole_property,
        bedroom_count: Number(newUnit.bedroom),
        bathroom_count: Number(newUnit.bathroom),
        living_room_count: Number(newUnit.living_room),
        kitchen_count: Number(newUnit.kitchen)
      };

      // Add to pending units in Redux
      dispatch(addPendingUnit({
        unit: {
          ...unitParam,
          propertyId
        },
        amenities: selectedAmenities,
        media: mediaFiles,
        coverIndex: coverIndex || 0
      }));

      // Reset form state
      resetForm();

      console.log('Unit added to pending list');
    } catch (err) {
      console.error('Error adding unit to pending list:', err);
      setErrors(prev => ({
        ...prev,
        general: err instanceof Error ? err.message : 'Failed to add unit'
      }));
    }
  };

  const handleUploadAll = async () => {
    if (units.pending.length === 0) return;
    
    setLoading(true);
    try {
      // Upload all units at once
      const result = await addPropertyUnit({
        id: propertyId!,
        units: units.pending.map(pu => pu.unit)
      }).unwrap();

      console.log('Add Property Units API Response:', result);

      if (!result?.data?.length) {
        throw new Error('Failed to create units: No units returned');
      }

      // Process each created unit
      await Promise.all(result.data.map(async (createdUnit: CreatedUnitResponse, index: number) => {
        const pendingUnit = units.pending[index];
        const unitId = createdUnit.id;

        const uploadPromises = [];

        // Add amenities assignment promise
        if (pendingUnit.amenities.length > 0) {
          uploadPromises.push(
            assignAmenitiesToUnit({
              propertyId: propertyId!,
              unitId,
              amenityIds: pendingUnit.amenities,
            }).unwrap()
          );
        }

        // Add media upload promises
        pendingUnit.media.forEach((media) => {
          if (_isImage(media)) {
            uploadPromises.push(
              uploadUnitMedia({
                propertyId: propertyId!,
                unitId,
                mediaType: 'IMAGE',
                media
              }).unwrap()
            );
          }
        });

        await Promise.all(uploadPromises);

        // Add to uploaded units in Redux
        dispatch(addUploadedUnits([{
          ...pendingUnit.unit,
          id: unitId,
          image: pendingUnit.media[pendingUnit.coverIndex]
        }]));
      }));

      // Clear pending units
      dispatch(clearPendingUnits());
      console.log('All units uploaded successfully');

    } catch (err) {
      console.error('Upload all units error:', err);
      setErrors(prev => ({
        ...prev,
        general: err instanceof Error ? err.message : 'Failed to upload units'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    if (field === 'is_whole_property') {
      setNewUnit(prev => ({ 
        ...prev, 
        [field]: value as boolean,
        units: value ? '1' : prev.units 
      }));
    } else if (typeof value === 'string' && ['units', 'price', 'max_guests', 'bedroom', 'living_room', 'kitchen', 'bathroom'].includes(field)) {
      // Handle numeric inputs
      const numValue = value.replace(/^0+/, ''); // Remove leading zeros
      
      // Allow empty string or valid positive numbers
      if (numValue === '' || /^\d+$/.test(numValue)) {
        // Prevent negative values by only accepting positive numbers
        setNewUnit(prev => ({ 
          ...prev, 
          [field]: numValue
        }));
      }
    } else {
      setNewUnit(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setMediaFiles((prev) => {
        const updatedFiles = [...prev, ...newFiles];
        // If this is the first image being uploaded and no cover is selected, set it as cover
        if (coverIndex === null && updatedFiles.length > 0) {
          setCoverIndex(0);
        }
        return updatedFiles;
      });
    }
  };

  const handleMediaClick = (index: number) => {
    setCoverIndex(index);
  };

  const navigateNext = () => {
    if (units.uploaded.length > 0) {
      onNext();
    }
  };

  const resetForm = () => {
    setNewUnit({
      title: '',
      description: '',
      price: '',
      max_guests: '',
      bedroom: '',
      living_room: '',
      kitchen: '',
      bathroom: '',
      is_whole_property: false,
      units: '',
    });
    setSelectedAmenities([]);
    setMediaFiles([]);
    setCoverIndex(null);
    setErrors({
      title: '',
      description: '',
      units: '',
      price: '',
      max_guests: '',
      bedroom: '',
      bathroom: '',
      living_room: '',
      kitchen: '',
      media: '',
      amenities: ''
    });
  };

  // Add this function to check if a whole property unit exists
  const hasWholePropertyUnit = () => {
    return units.uploaded.some(unit => unit.is_whole_property) || 
           units.pending.some(pu => pu.unit.is_whole_property);
  };

  return (
    <FormContainer>
      <Typography 
        variant="h5" 
        sx={{ 
          fontSize: '1.5rem', 
          fontWeight: 500, 
          textAlign: 'center', 
          mb: 1 
        }}
      >
        Add units to your property
      </Typography>
      
      {/* Add error message display */}
      {renderFormError()}

      {hasWholePropertyUnit() && (
        <Box 
          sx={{ 
            backgroundColor: '#e3f2fd', 
            color: '#1565c0',
            padding: 2,
            borderRadius: 1,
            marginBottom: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Typography variant="body2">
            A whole property unit has already been added. You cannot add more units.
          </Typography>
        </Box>
      )}

      <Typography 
        variant="body2" 
        sx={{ 
          color: 'text.secondary', 
          textAlign: 'center', 
          mb: 2,
          maxWidth: '600px',
          mx: 'auto'
        }}
      >
        Add one or more units to your property. Each unit can have its own amenities, photos, and pricing.
      </Typography>

      {/* Existing Units Accordion */}
      <UnitAccordion>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: { xs: 2, md: 3 },
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f8f9fa'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HouseIcon sx={{ color: '#028090' }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontSize: { xs: '1rem', md: '1.125rem' },
                fontWeight: 600,
                color: '#2c3e50'
              }}
            >
              Uploaded Units ({units.uploaded.length})
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setCollapse(!isCollapsed)}
            sx={{ 
              transform: isCollapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease-in-out',
              color: '#028090',
              '&:hover': {
                backgroundColor: 'rgba(2, 128, 144, 0.08)'
              }
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
        <Collapse in={isCollapsed}>
          <Box sx={{ py: 2, backgroundColor: '#f8f9fa' }}>
            {units.uploaded.length === 0 ? (
              <Typography 
                variant="body2" 
                sx={{ 
                  textAlign: 'center',
                  color: '#7f8c8d',
                  py: 4
                }}
              >
                No units uploaded yet
              </Typography>
            ) : (
              units.uploaded.map((unit) => (
                <PropertyCard
                  key={unit.id || unit.name}
                  unit={unit}
                />
              ))
            )}
          </Box>
        </Collapse>
      </UnitAccordion>

      {/* Pending Units Section */}
      {units.pending.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Pending Units ({units.pending.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {units.pending.map((pu, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="subtitle1">{pu.unit.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {pu.unit.count} unit(s) • ₦{pu.unit.price_per_night.toLocaleString()} per night
                </Typography>
              </Box>
            ))}
          </Box>
          <Button
            variant="contained"
            onClick={handleUploadAll}
            disabled={loading}
            sx={{
              mt: 2,
              backgroundColor: '#028090',
              '&:hover': {
                backgroundColor: '#026f7a'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              `Upload ${units.pending.length} Unit${units.pending.length > 1 ? 's' : ''}`
            )}
          </Button>
        </Box>
      )}

      {/* New Unit Form - Hide if whole property exists */}
      {!hasWholePropertyUnit() && (
        <>
          <FormSection>
            <InputGrid container>
              <Grid item className="unit-name">
                <StyledTextField
                  fullWidth
                  label="Title"
                  value={newUnit.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={!!errors.title}
                  helperText={errors.title}
                />
              </Grid>
              <Grid item className="unit-count">
                <StyledTextField
                  fullWidth
                  label="# of Units"
                  type="number"
                  value={newUnit.units}
                  onChange={(e) => handleInputChange('units', e.target.value)}
                  error={!!errors.units}
                  helperText={errors.units}
                  disabled={newUnit.is_whole_property}
                  InputProps={{
                    readOnly: newUnit.is_whole_property
                  }}
                />
              </Grid>

              <Grid item className="unit-description">
                <StyledTextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={newUnit.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={!!errors.description}
                  helperText={errors.description}
                />
              </Grid>

              <Grid item className="price">
                <StyledTextField
                  fullWidth
                  label="Price per night"
                  type="number"
                  value={newUnit.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                  }}
                  error={!!errors.price}
                  helperText={errors.price}
                />
              </Grid>
              <Grid item className="guests">
                <StyledTextField
                  fullWidth
                  label="Max Guests"
                  type="number"
                  value={newUnit.max_guests}
                  onChange={(e) => handleInputChange('max_guests', e.target.value)}
                  error={!!errors.max_guests}
                  helperText={errors.max_guests}
                />
              </Grid>
              <Grid item className="whole-property">
                <FormControlLabel
                  control={
                    <Switch
                      checked={newUnit.is_whole_property}
                      onChange={(e) => handleInputChange('is_whole_property', e.target.checked)}
                    />
                  }
                  label="Whole Property"
                />
              </Grid>

              <Grid item className="room-count">
                <StyledTextField
                  fullWidth
                  label="Bedrooms"
                  type="number"
                  value={newUnit.bedroom}
                  onChange={(e) => handleInputChange('bedroom', e.target.value)}
                  error={!!errors.bedroom}
                  helperText={errors.bedroom}
                />
              </Grid>
              <Grid item className="room-count">
                <StyledTextField
                  fullWidth
                  label="Living Rooms"
                  type="number"
                  value={newUnit.living_room}
                  onChange={(e) => handleInputChange('living_room', e.target.value)}
                  error={!!errors.living_room}
                  helperText={errors.living_room}
                />
              </Grid>
              <Grid item className="room-count">
                <StyledTextField
                  fullWidth
                  label="Kitchens"
                  type="number"
                  value={newUnit.kitchen}
                  onChange={(e) => handleInputChange('kitchen', e.target.value)}
                  error={!!errors.kitchen}
                  helperText={errors.kitchen}
                />
              </Grid>
              <Grid item className="room-count">
                <StyledTextField
                  fullWidth
                  label="Bathrooms"
                  type="number"
                  value={newUnit.bathroom}
                  onChange={(e) => handleInputChange('bathroom', e.target.value)}
                  error={!!errors.bathroom}
                  helperText={errors.bathroom}
                />
              </Grid>
            </InputGrid>
          </FormSection>

          <FormSection>
            {/* <Typography 
              variant="h6" 
              sx={{ 
                fontSize: '1.125rem',
                fontWeight: 500,
                color: 'text.primary',
                mb: 1.5
              }}
            >
              Amenities
            </Typography> */}
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary',
                mb: 2
              }}
            >
              Select the amenities available in this unit
            </Typography>
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              '& > *': {
                flex: {
                  xs: '0 0 calc(50% - 12px)',
                  sm: '0 0 calc(33.33% - 12px)',
                  md: '0 0 calc(25% - 12px)'
                }
              }
            }}>
              {queryResult?.data.map((amenity) => (
                <Box
                  key={amenity.id}
                  onClick={() => handleAmenityToggle(amenity.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: selectedAmenities.includes(amenity.id) ? '#028090' : 'grey.300',
                    backgroundColor: selectedAmenities.includes(amenity.id) ? 'rgba(2, 128, 144, 0.05)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#028090',
                      backgroundColor: 'rgba(2, 128, 144, 0.05)',
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
                </Box>
              ))}
            </Box>
          </FormSection>

          {/* Image Upload Section */}
          <FormSection>
            <Typography variant="h6" sx={{ mb: 2 }}>Property Images</Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              multiple
              onChange={handleMediaChange}
            />
            <ImageUploadCard>
              {mediaFiles.map((file, index) => (
                <ImageCard key={index} onClick={() => handleMediaClick(index)}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Unit ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {index === coverIndex && <CoverLabel>Cover Photo</CoverLabel>}
                  <DeleteButton
                    className="delete-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newFiles = mediaFiles.filter((_, i) => i !== index);
                      setMediaFiles(newFiles);
                      if (coverIndex === index) {
                        setCoverIndex(newFiles.length > 0 ? 0 : null);
                      }
                    }}
                  >
                    <DeleteIcon sx={{ color: '#fff' }} />
                  </DeleteButton>
                </ImageCard>
              ))}
              {mediaFiles.length < 9 && (
                <UploadPlaceholder htmlFor="image-upload" sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <AddIcon sx={{ fontSize: 40, color: '#666' }} />
                  <Typography variant="body2" color="textSecondary">
                    Add Photos
                  </Typography>
                </UploadPlaceholder>
              )}
            </ImageUploadCard>
          </FormSection>

          {/* Action Buttons */}
          <ActionButtons>
            <Button
              variant="contained"
              onClick={handleSubmission}
              disabled={loading}
              sx={{
                backgroundColor: '#028090',
                '&:hover': {
                  backgroundColor: '#026f7a'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Add Unit'
              )}
            </Button>
            <Button
              variant="contained"
              onClick={navigateNext}
              disabled={units.uploaded.length === 0}
              sx={{
                backgroundColor: '#028090',
                '&:hover': {
                  backgroundColor: '#026f7a'
                }
              }}
            >
              Continue
            </Button>
          </ActionButtons>
        </>
      )}

      {/* Always show continue button if units exist */}
      {hasWholePropertyUnit() && units.uploaded.length > 0 && (
        <ActionButtons>
          <Button
            variant="contained"
            onClick={navigateNext}
            sx={{
              backgroundColor: '#028090',
              '&:hover': {
                backgroundColor: '#026f7a'
              }
            }}
          >
            Continue
          </Button>
        </ActionButtons>
      )}
    </FormContainer>
  );
};

const PropertyCard: React.FC<{ unit: PropertyUnit }> = ({
  unit
}) => {
  return (
    <UnitCard>
      <UnitImage 
        src={unit.image ? URL.createObjectURL(unit.image) : '/placeholder-image.jpg'} 
        alt={unit.name} 
      />
      <Box sx={{ flex: 1 }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600,
            color: '#2c3e50',
            mb: 0.5 
          }}
        >
          {unit.name}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#34495e',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <span style={{ fontWeight: 500 }}>{unit.count} unit{unit.count > 1 ? 's' : ''}</span>
          •
          <span style={{ color: '#028090' }}>₦{unit.price_per_night.toLocaleString()}</span>
          <span style={{ color: '#7f8c8d' }}>per night</span>
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#7f8c8d',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'wrap'
          }}
        >
          <span>{unit.max_guests} guests</span>
          •
          <span>{unit.bedroom_count} bedroom{unit.bedroom_count !== 1 ? 's' : ''}</span>
          •
          <span>{unit.bathroom_count} bathroom{unit.bathroom_count !== 1 ? 's' : ''}</span>
          {unit.is_whole_property && (
            <>
              •
              <span style={{ color: '#028090', fontWeight: 500 }}>Entire Property</span>
            </>
          )}
        </Typography>
      </Box>
    </UnitCard>
  );
};

export default ListFlow7;