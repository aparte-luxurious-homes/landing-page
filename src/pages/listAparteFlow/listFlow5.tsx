import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const ListFlow5: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: any }> = ({ onNext, onBack, formData, setFormData }) => {
  type GuestType = {
    adults: number;
    children: number;
    pets: number;
  };

  const [guestType, setGuestType] = useState<GuestType>({
    adults: formData.guestType?.adults || 0,
    children: formData.guestType?.children || 0,
    pets: formData.guestType?.pets || 0,
  });

  useEffect(() => {
    setFormData({ ...formData, guestType });
  }, [guestType]);

  const handleGuestChange = (guest: keyof GuestType, increment: number) => {
    setGuestType((prevGuestType) => {
      const newValue = Math.max(0, prevGuestType[guest] + increment);
      return {
        ...prevGuestType,
        [guest]: newValue,
      };
    });
  };

  const formatGuestName = (guest: string) => {
    switch (guest) {
      case 'adults':
        return 'Adults';
      case 'children':
        return 'Children';
      case 'pets':
        return 'Pets';
      default:
        return guest.charAt(0).toUpperCase() + guest.slice(1);
    }
  };

  const getGuestDescription = (guest: keyof GuestType) => {
    switch (guest) {
      case 'adults':
        return 'Ages 15 and above';
      case 'children':
        return 'Ages 14 and above';
      case 'pets':
        return 'Domestic animals';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6 md:pt-50">
      <h1 className="text-3xl md:text-2xl text-center text-black mb-2 md:mb-2">How many guests are allowed?</h1>
      <p className="text-lg text-gray-700 text-center mb-2">Specify the number of guests and their types</p>
      <p className="text-xs text-gray-700 mb-8 text-center max-w-md mx-auto">
        This includes considerations and such as number of beds, bedrooms, and available living space to ensure 
        a pleasant stay for all guests.
      </p>
      <div className="w-full max-w-lg bg-white border border-gray-300 rounded-lg ">
        {(['adults', 'children', 'pets'] as Array<keyof GuestType>).map((guest, _index) => (
          <div key={guest} className="border-b border-gray-300 last:border-0 p-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="font-normal">{formatGuestName(guest)}</span>
                <span className="block text-xs text-gray-500">{getGuestDescription(guest)}</span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handleGuestChange(guest, -1)}
                  className="px-2 bg-gray-300 rounded-md"
                >
                  -
                </button>
                <span className="mx-3 text-gray-400 text-sm" style={{ minWidth: '20px', textAlign: 'center' }}>{guestType[guest]}</span>
                <button
                  onClick={() => handleGuestChange(guest, 1)}
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

export default ListFlow5;