import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HouseIcon from '@mui/icons-material/House';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { TextField, Collapse, IconButton, InputAdornment, Typography } from '@mui/material';

const ListFlow3: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: any }> = ({ onNext, onBack, formData, setFormData }) => {
  const sections = [
    'Single Room', 'Mini Flat', '2 Bedroom', '3 Bedroom', '4 Bedroom', '5 Bedroom', '6 Bedroom', 'Others'
  ];

  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [customSection, setCustomSection] = useState<string>('');

  const handleAddSection = (section: string) => {
    if (section === 'Others' && customSection) {
      section = customSection;
    }
    if (!formData.sections.some((sec: any) => sec.name === section)) {
      setFormData({ ...formData, sections: [...formData.sections, { name: section, units: 0, price: '' }] });
    }
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((sec) => sec !== section) : [...prev, section]
    );
  };

  const handleInputChange = (section: string, field: string, value: string | number) => {
    const updatedSections = formData.sections.map((sec: any) => {
      if (sec.name === section) {
        return { ...sec, [field]: value };
      }
      return sec;
    });
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleUnitsChange = (section: string, increment: boolean) => {
    const updatedSections = formData.sections.map((sec: any) => {
      if (sec.name === section) {
        const newUnits = increment ? sec.units + 1 : sec.units - 1;
        return { ...sec, units: newUnits >= 0 ? newUnits : 0 };
      }
      return sec;
    });
    setFormData({ ...formData, sections: updatedSections });
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6 md:pt-60">
      <h1 className="text-3xl md:text-4xl text-black mb-6 md:mb-8">Add up sections of your apartment building</h1>
      <p className="text-lg text-gray-700 mb-4">Add one or more to proceed</p>
      <p className="text-sm text-gray-700 mb-8 text-center max-w-3xl mx-auto">
        To proceed, ensure you’ve added at least one section of your building. This allows us to tailor the next steps to your property’s specifics, ensuring a seamless experience. Add your section now to continue!
      </p>
      <div className="w-full max-w-2xl">
        {sections.map((section) => (
          <div key={section} className="flex flex-col mb-4 bg-[#FAFEFF] border border-gray-300 rounded-lg">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <HouseIcon className="mr-4" />
                <span className="text-lg">{section}</span>
              </div>
              {section === 'Others' ? (
                <TextField
                  label="Type here"
                  value={customSection}
                  onChange={(e) => setCustomSection(e.target.value)}
                  sx={{ marginRight: 2, height: '40px' }}
                  InputProps={{
                    style: { height: '40px' }
                  }}
                />
              ) : null}
              <AddIcon className="cursor-pointer" onClick={() => handleAddSection(section)} />
            </div>
            <Collapse in={expandedSections.includes(section)}>
              <div className="flex justify-between p-4">
                <TextField
                  label="Units"
                  fullWidth
                  value={formData.sections.find((sec: any) => sec.name === section)?.units || 0}
                  onChange={(e) => handleInputChange(section, 'units', parseInt(e.target.value))}
                  sx={{ marginRight: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => handleUnitsChange(section, false)}>
                          <RemoveIcon />
                        </IconButton>
                        <span>{formData.sections.find((sec: any) => sec.name === section)?.units || 0}</span>
                        <IconButton size="small" onClick={() => handleUnitsChange(section, true)}>
                          <AddIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Price"
                  fullWidth
                  value={formData.sections.find((sec: any) => sec.name === section)?.price || ''}
                  onChange={(e) => handleInputChange(section, 'price', e.target.value)}
                  sx={{ marginLeft: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontWeight: 'bold' }}>
                          ₦
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
            </Collapse>
          </div>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-2xl mt-8">
        <button
          className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-400"
          onClick={onBack}
        >
          <ArrowBackIcon className="mr-2" />
          Back
        </button>
        <button
          className="flex items-center px-4 py-2 bg-[#028090] text-white rounded-md hover:bg-[#026f7a]"
          onClick={onNext}
          disabled={formData.sections.length === 0}
        >
          Continue
          <ArrowForwardIcon className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ListFlow3;