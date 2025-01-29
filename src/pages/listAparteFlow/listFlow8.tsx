import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WifiIcon from '@mui/icons-material/Wifi';
import TvIcon from '@mui/icons-material/Tv';
import KitchenIcon from '@mui/icons-material/Kitchen';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import BathtubIcon from '@mui/icons-material/Bathtub';
import BedIcon from '@mui/icons-material/Bed';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import FireplaceIcon from '@mui/icons-material/Fireplace';
import BalconyIcon from '@mui/icons-material/Balcony';
import VideocamIcon from '@mui/icons-material/Videocam';

const ListFlow8: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: any }> = ({ onNext, onBack, formData, setFormData }) => {
  const [selectedAmenities, setSelectedAmenities] = useState(formData.amenities || []);

  const handleAmenityToggle = (amenity: string) => {
    const currentIndex = selectedAmenities.indexOf(amenity);
    const newSelectedAmenities = [...selectedAmenities];

    if (currentIndex === -1) {
      newSelectedAmenities.push(amenity);
    } else {
      newSelectedAmenities.splice(currentIndex, 1);
    }

    setSelectedAmenities(newSelectedAmenities);
    setFormData({ ...formData, amenities: newSelectedAmenities });
  };

  const renderAmenityBox = (amenity: string, IconComponent: React.ElementType) => (
    <div
      key={amenity}
      className={`flex items-center p-4 border rounded-md cursor-pointer ${selectedAmenities.includes(amenity) ? 'border-[#028090]' : 'border-gray-300'} w-full sm:w-[calc(50%-8px)] md:w-[calc(33.33%-16px)] lg:w-[calc(25%-16px)] h-20`}
      onClick={() => handleAmenityToggle(amenity)}
    >
      <IconComponent className="mr-4" />
      <span className="text-sm">{amenity}</span>
    </div>
  );

  const amenities = [
    { name: 'Wifi', icon: WifiIcon },
    { name: 'TV', icon: TvIcon },
    { name: 'Kitchen', icon: KitchenIcon },
    { name: 'Air Conditioning', icon: AcUnitIcon },
    { name: 'Laundry Service', icon: LocalLaundryServiceIcon },
    { name: 'Bathtub', icon: BathtubIcon },
    { name: 'Bed', icon: BedIcon },
    { name: 'Dining Area', icon: LocalDiningIcon },
    { name: 'Fireplace', icon: FireplaceIcon },
    { name: 'Balcony', icon: BalconyIcon },
    { name: 'CCTV', icon: VideocamIcon },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6 md:pt-50">
      <h1 className="text-3xl md:text-2xl text-center text-black mb-2 md:mb-2">Select the amenities your property units offer</h1>
      <p className="text-lg text-gray-700 text-center mb-2">Choose from the available amenities</p>
      <p className="text-xs text-gray-700 mb-8 text-center max-w-md mx-auto">
        Select the amenities that your property units offer to provide a better experience for your guests.
      </p>
      <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 mb-8">
          {amenities.map((amenity) => renderAmenityBox(amenity.name, amenity.icon))}
        </div>
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

export default ListFlow8;