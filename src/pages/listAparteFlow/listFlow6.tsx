import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WifiIcon from '@mui/icons-material/Wifi';
import TvIcon from '@mui/icons-material/Tv';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import KitchenIcon from '@mui/icons-material/Kitchen';
import WorkIcon from '@mui/icons-material/Work';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import SpeakerIcon from '@mui/icons-material/Speaker';
import SecurityIcon from '@mui/icons-material/Security';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import KingBedIcon from '@mui/icons-material/KingBed';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PoolIcon from '@mui/icons-material/Pool';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import OutdoorGrillIcon from '@mui/icons-material/OutdoorGrill';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FireExtinguisherIcon from '@mui/icons-material/FireExtinguisher';
import SmokeFreeIcon from '@mui/icons-material/SmokeFree';
import VideocamIcon from '@mui/icons-material/Videocam';

const ListFlow6: React.FC<{ onNext: () => void; onBack: () => void; formData: any; setFormData: any }> = ({ onNext, onBack, formData, setFormData }) => {
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

  const basicAmenities = [
    { name: 'Wifi', icon: WifiIcon },
    { name: 'Tv', icon: TvIcon },
    { name: 'Air Conditioner', icon: AcUnitIcon },
    { name: 'Kitchen', icon: KitchenIcon },
    { name: 'Workspace', icon: WorkIcon },
    { name: 'Parking Lot', icon: LocalParkingIcon },
    { name: '24/7 Electricity', icon: FlashOnIcon },
    { name: 'In-built Speakers', icon: SpeakerIcon },
    { name: 'Security Doors', icon: SecurityIcon },
    { name: 'Heater', icon: WhatshotIcon },
    { name: 'King-sized Bed', icon: KingBedIcon },
    { name: 'Compact Gym', icon: FitnessCenterIcon },
  ];

  const specialAmenities = [
    { name: 'Pool (snooker)', icon: PoolIcon },
    { name: 'Swimming pool', icon: PoolIcon },
    { name: 'Beach', icon: BeachAccessIcon },
    { name: 'Lake', icon: BeachAccessIcon },
    { name: 'Grand piano', icon: LocalLibraryIcon },
    { name: 'Grill Spot', icon: OutdoorGrillIcon },
    { name: 'Library', icon: LocalLibraryIcon },
    { name: 'Outdoor Shower', icon: OutdoorGrillIcon },
  ];

  const safetyAmenities = [
    { name: 'First aid box', icon: LocalHospitalIcon },
    { name: 'Fire extinguisher', icon: FireExtinguisherIcon },
    { name: 'Smoke alarm', icon: SmokeFreeIcon },
    { name: 'CCTV', icon: VideocamIcon },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 md:py-40 md:px-6 md:pt-50">
      <h1 className="text-3xl md:text-2xl text-center text-black mb-2 md:mb-2">Select the amenities your property offers</h1>
      <p className="text-lg text-gray-700 text-center mb-2">Choose from the available amenities</p>
      <p className="text-xs text-gray-700 mb-8 text-center max-w-md mx-auto">
        Select the amenities that your property offers to provide a better experience for your guests.
      </p>
      <div className="w-full max-w-2xl bg-white border border-gray-300 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Basic Amenities</h2>
        <div className="flex flex-wrap gap-4 mb-8">
          {basicAmenities.map((amenity) => renderAmenityBox(amenity.name, amenity.icon))}
        </div>
        <h2 className="text-xl font-semibold mb-4">Special Amenities</h2>
        <div className="flex flex-wrap gap-4 mb-8">
          {specialAmenities.map((amenity) => renderAmenityBox(amenity.name, amenity.icon))}
        </div>
        <h2 className="text-xl font-semibold mb-4">Safety Amenities</h2>
        <div className="flex flex-wrap gap-4 mb-8">
          {safetyAmenities.map((amenity) => renderAmenityBox(amenity.name, amenity.icon))}
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

export default ListFlow6;