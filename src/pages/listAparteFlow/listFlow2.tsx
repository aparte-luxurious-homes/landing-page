import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks';
import { setApartmentNameAndDesc } from '../../features/property/propertySlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { TextField } from '@mui/material';
import { styled } from '@mui/system';


const GrayInput = styled(TextField)(() => ({
  backgroundColor: '#f0f0f0',
  border: '0.2px solid #b0b0b0',
  borderRadius: '10px',
  '& .MuiInputBase-input': {
    padding: '10px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#b0b0b0',
  },
}));

const ListFlow2: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: (data: any) => void }> = ({ onNext, onBack, formData = {}, setFormData }) => {
  const [propertyName, setPropertyName] = useState(formData.propertyName || '');
  const [propertyDescription, setPropertyDescription] = useState(formData.propertyDescription || '');
  const dispatch = useAppDispatch();
  // const { token } = useAppSelector((state) => state.root.auth);

  const handleNext = () => {
    setFormData({ ...formData, propertyName, propertyDescription });
    onNext();
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="flex flex-col items-center h-full py-16 md:py-20">
      <div className="flex flex-col items-center max-w-2xl w-full px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl text-center font-medium text-black mb-4">
          What is the name of your apartment?
        </h1>
        <h2 className="text-lg md:text-xl text-center text-black mb-3">
          Give your apartment a name for users to remember
        </h2>
        <p className="text-sm text-gray-500 text-center max-w-md mb-8">
          Whether it reflects the style, location, or ambiance of your apartment, the right name can leave a lasting impression and attention to your property.
        </p>
        
        <div className="w-full space-y-8">
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h3 className="text-lg font-medium text-black mb-3">Property name</h3>
            <GrayInput
              fullWidth
              placeholder="Start typing here"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              sx={{ 
                height: '60px',
                '& .MuiInputBase-root': {
                  height: '100%'
                }
              }}
            />
            <p className="text-sm text-gray-600 text-right mt-2">You can always change this</p>
          </div>

          <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
            <h3 className="text-lg font-medium text-black mb-3">Property description</h3>
            <p className="text-sm text-gray-600 mb-3">Write a brief and detailed description of your property</p>
            <GrayInput
              fullWidth
              multiline
              rows={6}
              placeholder="Start typing here"
              value={propertyDescription}
              onChange={(e) => setPropertyDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-between w-full mt-8">
          <button
            className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={handleBack}
          >
            <ArrowBackIcon className="mr-2" />
            Back
          </button>
          <button
            className={`flex items-center px-14 py-2 rounded-md ${
              propertyName && propertyDescription 
                ? 'bg-[#028090] text-white hover:bg-[#026f7a]' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={() => {
              dispatch(setApartmentNameAndDesc({
                name: propertyName,
                desc: propertyDescription
              }));
              handleNext();
            }}
            disabled={!propertyName || !propertyDescription}
          >
            Continue
            <ArrowForwardIcon className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListFlow2;