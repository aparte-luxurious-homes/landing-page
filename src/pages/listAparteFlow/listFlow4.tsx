import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ListFlow4: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: any }> = ({ onNext, onBack, formData, setFormData }) => {
  type DetailsType = {
    livingRoom: number;
    kitchen: number;
    bathroom: number;
  };

  const [details, setDetails] = useState<DetailsType>({
    livingRoom: formData.details?.livingRoom || 0,
    kitchen: formData.details?.kitchen || 0,
    bathroom: formData.details?.bathroom || 0,
  });

  useEffect(() => {
    setFormData({ ...formData, details });
  }, [details]);

  const handleDetailChange = (detail: keyof DetailsType, increment: number) => {
    setDetails((prevDetails) => {
      const newValue = Math.max(0, prevDetails[detail] + increment);
      return {
        ...prevDetails,
        [detail]: newValue,
      };
    });
  };

  const formatDetailName = (detail: string) => {
    switch (detail) {
      case 'livingRoom':
        return 'Living Room';
      case 'kitchen':
        return 'Kitchen';
      case 'bathroom':
        return 'Bathroom';
      default:
        return detail.charAt(0).toUpperCase() + detail.slice(1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6 md:pt-50">
      <h1 className="text-3xl md:text-2xl text-center text-black mb-2 md:mb-2">Add up your apartment details</h1>
      <p className="text-lg text-gray-700 text-center mb-2">Share the rooms, beds, and other details</p>
      <p className="text-xs text-gray-700 mb-8 text-center max-w-md mx-auto">
        Provide clear and detailed information about the property's layout and accommodations.
        Mention the number of rooms, beds, and other features.
      </p>
      <div className="w-full max-w-lg bg-white border border-gray-300 rounded-lg ">
        {(['livingRoom', 'kitchen', 'bathroom'] as Array<keyof DetailsType>).map((detail, _index) => (
          <div key={detail} className="border-b border-gray-300 last:border-0 p-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-normal">{formatDetailName(detail)}</span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handleDetailChange(detail, -1)}
                  className="px-2 bg-gray-300 rounded-md"
                >
                  -
                </button>
                <span className="mx-3 text-gray-400 text-sm" style={{ minWidth: '20px', textAlign: 'center' }}>{details[detail]}</span>
                <button
                  onClick={() => handleDetailChange(detail, 1)}
                  className="px-2 bg-gray-300 rounded-md"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
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
          onClick={onNext}
        >
          Continue
          <ArrowForwardIcon className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ListFlow4;