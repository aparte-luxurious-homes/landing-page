import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppDispatch } from '../../hooks';
import { setApartmentType } from '../../features/property/propertySlice';

interface Section {
  name: string;
  units: number;
  price: string;
}

interface ListFlow3Props {
  onNext: () => void;
  onBack: () => void;
  formData: {
    apartmentType: string;
    sections: Section[];
    description: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    apartmentType: string;
    sections: Section[];
    description: string;
  }>>;
}

const ListFlow3: React.FC<ListFlow3Props> = ({ onNext, onBack, formData, setFormData }) => {
  const [selectedType, setSelectedType] = useState<string>(formData.apartmentType || '');
  const [otherType, setOtherType] = useState<string>('');
  const dispatch = useAppDispatch();

  const handleTypeClick = (type: string) => {
    setSelectedType(type);
    setOtherType('');
  };

  const handleOtherTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType('Others');
    setOtherType(event.target.value);
  };

  const handleNext = () => {
    if (selectedType === 'Others' && otherType) {
      setFormData({ ...formData, apartmentType: otherType });
      dispatch(setApartmentType(otherType.toUpperCase()));
    } else {
      setFormData({ ...formData, apartmentType: selectedType });
      dispatch(setApartmentType(selectedType.toUpperCase()));
    }
    onNext();
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 md:pt-40">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Select Your Apartment Type</h2>
      <div className="flex flex-col w-full max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {['Duplex', 'Bungalow', 'Villa', 'Apartment', 'Hotel', 'Office', 'Others'].map((type) => (
            <div
              key={type}
              className={`flex items-center justify-center h-44 p-14 px-24 bg-[#FAFEFF] rounded-md shadow-md border cursor-pointer transition-all duration-300 ease-in-out ${
                selectedType === type ? 'bg-[#028090] text-white' : 'hover:bg-[#028090]'
              }`}
              onClick={() => handleTypeClick(type)}
            >
              <span className={`text-lg font-medium ${selectedType === type ? 'text-[#028090]' : 'text-black group-hover:text-white'}`}>{type}</span>
            </div>
          ))}
          {selectedType === 'Others' && (
            <input
              type="text"
              value={otherType}
              onChange={handleOtherTypeChange}
              placeholder="Please specify"
              className="mb-8 p-2 border rounded-md col-span-3"
            />
          )}
        </div>
        <div className="flex justify-end items-center">
          <button
            className="flex items-center px-4 py-2 text-gray-700 rounded-md mr-14"
            onClick={onBack}
          >
            <ArrowBackIcon className="mr-2" />
            Back
          </button>
          <button
            className="flex items-center px-14 py-2 bg-[#028090] text-white rounded-md hover:bg-[#026f7a]"
            onClick={handleNext}
            disabled={!selectedType || (selectedType === 'Others' && !otherType)}
          >
            Continue
            <ArrowForwardIcon className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListFlow3;