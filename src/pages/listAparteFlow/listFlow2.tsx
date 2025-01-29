import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks';
import { setApartmentNameAndDesc } from '../../features/property/propertySlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CircularProgress from '@mui/material/CircularProgress';
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
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6">
      <h1 className="text-3xl md:text-3xl text-center font-medium text-black mb-6 md:mb-6">
        What is the name of your apartment?
      </h1>
      <h2 className="text-xl md:text-xl text-center text-black mb-4">
        Give your apartment a name for users to remember
      </h2>
      <p className="text-xs text-gray-500 text-center max-w-md mb-6">
        Whether it reflects the style, location, or ambiance of your apartment, the right name can leave a lasting impression and attention to your property.
      </p>
      <div className="w-full max-w-2xl">
        {/* <p>{token}</p> */}
        <h3 className="text-lg font-medium text-black mb-2">Property name</h3>
        <GrayInput
          fullWidth
          placeholder="Start typing here"
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
          sx={{ height: '100px' }} 
          InputProps={{
            style: {
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            },
          }}
        />
        <p className="text-sm text-gray-600 text-right mt-2">You can always change this</p>
        <h3 className="text-lg font-medium text-black mt-6 mb-2">Property description</h3>
        <p className="text-sm text-gray-600 mb-2">Write a brief and detailed description of your property</p>
        <GrayInput
          fullWidth
          multiline
          rows={8}
          placeholder="Start typing here"
          value={propertyDescription}
          onChange={(e) => setPropertyDescription(e.target.value)}
          sx={{ height: '300px' }} 
        />
      </div>
      <div className="flex justify-between w-full max-w-2xl mt-8">
        <button
          className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
          onClick={handleBack}
        >
          <ArrowBackIcon className="mr-2" />
          Back
        </button>
        <button
          className={`flex items-center px-14 py-2 rounded-md ${propertyName && propertyDescription ? 'bg-[#028090] text-white hover:bg-[#026f7a]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          onClick={()=>{
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
  );
};

export default ListFlow2;