import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HouseIcon from '@mui/icons-material/House';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';

import {
  Card,
  CardContent,
  Stack,
  TextField,
  Collapse,
  IconButton,
  InputAdornment,
  Typography,
  Checkbox,
  FormControlLabel,
  Grid,
  Button,
  Box,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  useGetAmenitiesQuery,
  useAddPropertyUnitMutation,
  useAssignAmenitiesToUnitMutation,
  useUploadUnitMediaMutation,
  useDeletePropertyUnitMutation,
} from '../../api/propertiesApi';
import { setFeaturedUnit } from '../../features/property/propertySlice';
import { styled } from '@mui/system';

const ImageUploadCard = styled(Box)(() => ({
  width: '100%',
  maxWidth: '800px',
  height: '150px',
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
  width: '20%',
  height: '120px',
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

const DeleteButton = styled(IconButton)(() => ({
  position: 'absolute',
  bottom: '3px',
  right: '10px',
  display: 'none',
}));

interface ListFlow7Props {
  onNext: () => void;
  onBack: () => void;
  formData: any;
  setFormData?: any;
}

type PropertyUnit = {
  id?: string | null;
  propertyId?: string | null;
  name: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  count: number;
  is_whole_property: boolean;
  bedroom_count: number;
  living_room_count: number;
  kitchen_count: number;
  image?: File | null;
};

type PropertyCardProps = {
  deletingId?: string | null;
  unit: PropertyUnit;
  onEdit: (property: PropertyUnit) => void;
  onDelete: (property: PropertyUnit) => void;
};


const _isImage = (file: File) => file.type.startsWith('image/');

const ListFlow7: React.FC<ListFlow7Props> = ({ onNext, onBack,}) => {
  const dispatch = useAppDispatch();
  const { data: queryResult, isLoading } = useGetAmenitiesQuery();
  const [addPropertyUnit] = useAddPropertyUnitMutation();
  const [uploadUnitMedia] = useUploadUnitMediaMutation();
  const [assignAmenitiesToUnit] = useAssignAmenitiesToUnitMutation();
  const [deletePropertyUnit] = useDeletePropertyUnitMutation();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCollapsed, setCollapse] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<Array<string>>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [propertyUnits, setPropertyUnits] = useState<Array<PropertyUnit>>([]);

  // const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [newUnit, setNewUnit] = useState<any>({
    title: '',
    description: '',
    price: '',
    max_guests: '',
    bedroom: '',
    living_room: '',
    kitchen: '',
    bathroom: '',
    is_whole_property: false,
    units: 0,
  });

  const {
    propertyFormData: { propertyId },
  } = useAppSelector((state) => state.property);

  const handleSubmission = async () => {
    if (!propertyId) {
      alert('NO property found');
      return;
    }
    try {
      setLoading(true);
      const unitParam = {
        name: newUnit.title,
        description: newUnit.description,
        price_per_night: newUnit.price,
        max_guests: newUnit.max_guests,
        count: newUnit.units,
        is_whole_property: newUnit.is_whole_property,
        bedroom_count: newUnit.bedroom,
        bathroom_count: newUnit.bathroom,
        living_room_count: newUnit.living_room,
        kitchen_count: newUnit.kitchen,
        image: newUnit.title,
      };
      const result = await addPropertyUnit({
        id: propertyId,
        units: [unitParam],
      }).unwrap();
      if (!result?.data) {
        // ID not found, error occured - sharp
        // Display a toastr to re-run
        return;
      }
      const _unitId = result.data[0].id;

      // upload amenities
      await assignAmenitiesToUnit({
        propertyId,
        unitId: _unitId,
        amenityIds: selectedAmenities,
      }).unwrap();

      // Upload Property Media :)
      const mediaUploadResult = await Promise.allSettled(
        mediaFiles.map((_media) =>
          uploadUnitMedia({
            propertyId,
            unitId: _unitId,
            mediaType: _isImage(_media) ? 'IMAGE' : 'VIDEO',
            media: _media,
          }).unwrap()
        )
      );

      const propertyUnitsCopy = [...propertyUnits];
      propertyUnitsCopy.push({
        propertyId,
        id: _unitId,
        ...unitParam,
        image: mediaFiles.find((file) => _isImage(file)) || null,
      });
      setPropertyUnits(propertyUnitsCopy);
      resetForm();
      console.log('Property Media Upload Result: ', mediaUploadResult);
      // onNext();
    } catch (err) {
      console.log('Create property error: ', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (newUnit.title) {
      // setFormData({
      //   ...formData,
      //   sections: [
      //     ...formData.sections,
      //     { ...newUnit, amenities: selectedAmenities, media: mediaFiles },
      //   ],
      // });
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
        units: 0,
      });
      setSelectedAmenities([]);
      setMediaFiles([]);
      // setExpandedSections((prev) => [...prev, newUnit.title]);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setNewUnit({ ...newUnit, [field]: value });
  };

  const handleEdit = (unit: PropertyUnit) => {
    console.log('Edit', unit);
  };


  const handleDelete = async (unit: PropertyUnit) => {
    console.log('Delete', unit);
    if (!unit.id || !unit.propertyId) return;
    try {
      setDeletingId(unit.id);
      // await delay(5000);
      await deletePropertyUnit({
        propertyId: unit.propertyId,
        unitId: unit.id,
      }).unwrap();
      const currentIndex =propertyUnits.findIndex(u => u.id === unit.id);
      const propertyUnitCopy = [...propertyUnits];
  
      propertyUnitCopy.splice(currentIndex, 1);
  
    setPropertyUnits(propertyUnitCopy);
      console.log('Deleted successfully!');
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    const currentIndex = selectedAmenities.indexOf(amenityId);
    const newSelectedAmenities = [...selectedAmenities];

    if (currentIndex === -1) {
      newSelectedAmenities.push(amenityId);
    } else {
      newSelectedAmenities.splice(currentIndex, 1);
    }

    setSelectedAmenities(newSelectedAmenities);
  };

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setMediaFiles(Array.from(event.target.files));
    }
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
  const navigateNext = () => {
    dispatch(setFeaturedUnit(propertyUnits[0]));
    onNext();
    // navigate('/add-amenities-media');
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6 md:pt-50">
      <h1 className="text-2xl md:text-3xl text-black mb-2 md:mb-4 text-center">
        Add units to your apartment building
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        Add one or more units to proceed
      </p>
      <div className="w-full max-w-2xl">
        <div className="flex flex-col mb-2 bg-[#FAFEFF] border border-gray-300 rounded-lg">
          <div className="flex items-center justify-between py-2 px-4">
            <div className="flex items-center">
              <HouseIcon className="mr-4" />
              <span className="text-lg">Uploaded units</span>
            </div>
            <div className="flex items-center">
              <IconButton onClick={() => setCollapse(!isCollapsed)}>
                {isCollapsed ? <RemoveIcon /> : <AddIcon />}
              </IconButton>
            </div>
          </div>

          <Collapse in={isCollapsed}>
            <div className="p-4">
              <Stack spacing={4}>
                {propertyUnits.map((unit, index) => (
                  <PropertyCard
                    key={index}
                    deletingId={deletingId}
                    unit={unit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </Stack>
            </div>
          </Collapse>
        </div>
        {/* ))} */}
      </div>
      <div className="w-full max-w-2xl mt-4">
        <div className="flex flex-col mb-4 bg-[#FAFEFF] border border-gray-300 rounded-lg p-4">
          <Typography variant="h6" className="mb-2">
            Add New Unit
          </Typography>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={newUnit.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                sx={{ marginBottom: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                value={newUnit.description}
                onChange={(e) =>
                  handleInputChange('description', e.target.value)
                }
                sx={{ marginBottom: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Price"
                fullWidth
                value={newUnit.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                sx={{ marginBottom: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontWeight: 'bold' }}>₦</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max Guests"
                fullWidth
                value={newUnit.max_guests}
                onChange={(e) =>
                  handleInputChange('max_guests', e.target.value)
                }
                sx={{ marginBottom: 2 }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Bedroom"
                fullWidth
                type="number"
                value={newUnit.bedroom}
                onChange={(e) => handleInputChange('bedroom', e.target.value)}
                sx={{ marginBottom: 2 }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Living Room"
                type="number"
                fullWidth
                value={newUnit.living_room}
                onChange={(e) =>
                  handleInputChange('living_room', e.target.value)
                }
                sx={{ marginBottom: 2 }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Kitchen"
                type="number"
                fullWidth
                value={newUnit.kitchen}
                onChange={(e) => handleInputChange('kitchen', e.target.value)}
                sx={{ marginBottom: 2 }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Bathroom"
                type="number"
                fullWidth
                value={newUnit.bathroom}
                onChange={(e) => handleInputChange('bathroom', e.target.value)}
                sx={{ marginBottom: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <div className="flex justify-center items-center mb-4">
                <FormControlLabel
                  // sx={{ paddingTop: '8px' }}
                  control={
                    <Checkbox
                      checked={newUnit.is_whole_property}
                      onChange={(e) =>
                        handleInputChange('is_whole_property', e.target.checked)
                      }
                    />
                  }
                  label="Whole Property"
                />
                <div className="flex items-center">
                  <IconButton
                    onClick={() =>
                      handleInputChange('units', newUnit.units - 1)
                    }
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography className="mx-2">
                    {newUnit.units} Units
                  </Typography>
                  <IconButton
                    onClick={() =>
                      handleInputChange('units', newUnit.units + 1)
                    }
                  >
                    <AddIcon />
                  </IconButton>
                </div>
              </div>
            </Grid>
            {/* <Grid item xs={4}>
              
            </Grid> */}
          </Grid>

          <Typography variant="h6" className="mb-4">
            Add Amenities for this Unit
          </Typography>
          <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg p-4 mt-2">
            <div className="flex flex-wrap gap-4 mb-8">
              {isLoading
                ? 'Loading...'
                : queryResult?.data.map((amenity) =>
                    amenityBox(amenity.id, amenity.name)
                  )}
            </div>
          </div>
          <Box mt={4}>
            <Typography variant="h6" className="mb-2">
              Upload Media for this Unit
            </Typography>
            <ImageUploadCard mt={1}>
              {mediaFiles.map((file, index) => (
                <ImageCard key={index}>
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`media-${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      controls
                    />
                  )}
                  <DeleteButton
                    className="delete-icon"
                    onClick={() =>
                      setMediaFiles((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <DeleteIcon sx={{ color: '#fff' }} />
                  </DeleteButton>
                </ImageCard>
              ))}
              <label htmlFor="upload-media">
                <input
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  id="upload-media"
                  type="file"
                  multiple
                  onChange={handleMediaChange}
                />
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<AddIcon />}
                  sx={{
                    backgroundColor: '#fff',
                    color: 'black',
                    border: '1px solid #ccc',
                    borderRadius: '10px',
                    padding: '4px 15px',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#f0f0f0',
                    },
                  }}
                >
                  Upload media
                </Button>
              </label>
            </ImageUploadCard>
          </Box>
          <Box mt={4}>
            <Button
              disabled={!newUnit.title}
              variant="contained"
              color="primary"
              onClick={handleSubmission}
            >
              {loading ? 'Submitting' : 'Add Unit'}
              {loading && (
                <CircularProgress
                  size="20px"
                  color="inherit"
                  className="ml-2"
                />
              )}
            </Button>
          </Box>
        </div>
      </div>
      <div className="flex justify-between w-full max-w-2xl mt-12">
        <button
          className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          onClick={onBack}
        >
          <ArrowBackIcon className="mr-2" />
          Back
        </button>
        <button
          className="flex items-center px-14 py-2 bg-[#028090] text-white rounded-md hover:bg-[#026f7a]"
          onClick={navigateNext}
          
        >
          Continue
          <ArrowForwardIcon className="ml-2" />
        </button>
      </div>
    </div>
  );
};

const PropertyCard: React.FC<PropertyCardProps> = ({
  deletingId,
  unit,
  onEdit,
  onDelete,
}) => {
  return (
    <Grid item xs={12}>
      <Card sx={{ width: '100%', borderRadius: 3, boxShadow: 3 }}>
        {/*  <CardMedia
          component="img"
          height="100px"
          image={property.image}
          alt={property.name}
        /> */}
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" fontWeight="bold">
                {unit.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unit.description}
              </Typography>
              <Typography variant="h6" color="primary" mt={1}>
                NGN {unit.price_per_night.toLocaleString()} / night
              </Typography>
            </div>
            <div>
              <Typography variant="body2">
                🏡 {unit.is_whole_property ? 'Whole Property' : 'Shared Space'}
              </Typography>
              <Typography variant="body2">
                🛏 {unit.bedroom_count} Bedrooms • 🛋 {unit.living_room_count}{' '}
                Living Room • 🍽 {unit.kitchen_count} Kitchen
              </Typography>
              <Typography variant="body2">
                👤 Max Guests: {unit.max_guests}
              </Typography>
              <Typography variant="body2">
                Available: {unit.count} units
              </Typography>
            </div>
          </div>
        </CardContent>
        <Grid container justifyContent="start" pb={2} ml={1}>
          <IconButton color="primary" onClick={() => onEdit(unit)}>
            <EditIcon />
          </IconButton>
          <IconButton
            disabled={!!deletingId}
            color="error"
            onClick={() => onDelete(unit)}
          >
            {deletingId == unit.id ? (
              <CircularProgress size="20px" color="inherit" />
            ) : (
              <DeleteIcon />
            )}
          </IconButton>
        </Grid>
      </Card>
    </Grid>
  );
};

export default ListFlow7;