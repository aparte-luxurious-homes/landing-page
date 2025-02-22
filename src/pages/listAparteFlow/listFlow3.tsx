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
    <div className="flex flex-col items-center h-full py-20 md:py-32">
      <div className="flex flex-col items-center max-w-2xl w-full px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl text-center font-medium text-black mb-4">
          What type of property are you listing?
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-md mb-8">
          Select the category that best describes your property
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full mb-8">
          {['Duplex', 'Bungalow', 'Villa', 'Apartment', 'Hotel', 'Office', 'Others'].map((type) => (
            <div
              key={type}
              onClick={() => handleTypeClick(type)}
              className={`
                flex items-center justify-center p-6 rounded-lg cursor-pointer min-h-[100px]
                transition-all duration-300 ease-in-out
                ${selectedType === type 
                  ? 'bg-[#028090] text-white border-2 border-[#028090]' 
                  : 'bg-white border-2 border-gray-200 hover:border-[#028090]'
                }
              `}
            >
              <span className="text-lg font-medium">{type}</span>
            </div>
          ))}
        </div>

        {selectedType === 'Others' && (
          <div className="w-full mb-8">
            <input
              type="text"
              value={otherType}
              onChange={handleOtherTypeChange}
              placeholder="Specify your property type"
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#028090] focus:outline-none"
            />
          </div>
        )}

        <div className="flex justify-between w-full mt-auto">
          <button
            className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={onBack}
          >
            <ArrowBackIcon className="mr-2" />
            Back
          </button>
          <button
            className={`flex items-center px-14 py-2 rounded-md ${
              selectedType && (selectedType !== 'Others' || (selectedType === 'Others' && otherType))
                ? 'bg-[#028090] text-white hover:bg-[#026f7a]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
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