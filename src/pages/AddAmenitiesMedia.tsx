import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';

const AddAmenitiesMedia: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => {
  const navigate = useNavigate();
  const [newAmenity, setNewAmenity] = useState<string>('');
  const [newMedia, setNewMedia] = useState<string>('');

  const handleInputChange = (section: string, field: string, value: string | string[]) => {
    const updatedSections = formData.sections.map((sec: any) => {
      if (sec.title === section) {
        return { ...sec, [field]: value };
      }
      return sec;
    });
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleAddAmenity = (section: string) => {
    if (newAmenity) {
      const updatedSections = formData.sections.map((sec: any) => {
        if (sec.title === section) {
          return { ...sec, amenities: [...(sec.amenities || []), newAmenity] };
        }
        return sec;
      });
      setFormData({ ...formData, sections: updatedSections });
      setNewAmenity('');
    }
  };

  const handleAddMedia = (section: string) => {
    if (newMedia) {
      const updatedSections = formData.sections.map((sec: any) => {
        if (sec.title === section) {
          return { ...sec, media: [...(sec.media || []), newMedia] };
        }
        return sec;
      });
      setFormData({ ...formData, sections: updatedSections });
      setNewMedia('');
    }
  };

  const handleFinish = () => {
    navigate('/');
  };

  return (
    <Box className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6 md:pt-50">
      <Typography variant="h4" className="mb-4">Add Amenities and Media</Typography>
      <div className="w-full max-w-2xl">
        {formData.sections.map((section: any) => (
          <div key={section.title} className="flex flex-col mb-4 bg-[#FAFEFF] border border-gray-300 rounded-lg p-4">
            <Typography variant="h6" className="mb-4">{section.title}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Amenities"
                  fullWidth
                  value={section.amenities?.join(', ') || ''}
                  onChange={(e) => handleInputChange(section.title, 'amenities', e.target.value.split(', '))}
                  sx={{ marginBottom: 2 }}
                />
                <div className="flex items-center mt-2">
                  <TextField
                    label="Add Amenity"
                    fullWidth
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    sx={{ marginRight: 2 }}
                  />
                  <IconButton color="primary" onClick={() => handleAddAmenity(section.title)}>
                    <AddIcon />
                  </IconButton>
                </div>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Media"
                  fullWidth
                  value={section.media?.join(', ') || ''}
                  onChange={(e) => handleInputChange(section.title, 'media', e.target.value.split(', '))}
                  sx={{ marginBottom: 2 }}
                />
                <div className="flex items-center mt-2">
                  <TextField
                    label="Add Media"
                    fullWidth
                    value={newMedia}
                    onChange={(e) => setNewMedia(e.target.value)}
                    sx={{ marginRight: 2 }}
                  />
                  <IconButton color="primary" onClick={() => handleAddMedia(section.title)}>
                    <AddIcon />
                  </IconButton>
                </div>
              </Grid>
            </Grid>
          </div>
        ))}
      </div>
      <Button variant="contained" color="primary" onClick={handleFinish}>
        Finish
      </Button>
    </Box>
  );
};

export default AddAmenitiesMedia;