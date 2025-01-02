import React, { useState} from 'react';
import {
  Star as StarIcon,
  Wifi as WifiIcon,
  Tv as TvIcon,
  AcUnit as AcUnitIcon,
  FitnessCenter as FitnessCenterIcon,
  Group as GroupIcon,
  BedroomParent as BedroomParentIcon,
  Bathtub as BathtubIcon,
  Weekend as LivingIcon,
  LibraryBooks as LibraryBooksIcon,
  Security as SecurityIcon,
  Speaker as SpeakerIcon,
  Bolt as BoltIcon,
  Kitchen as KitchenIcon,
  KingBed as KingBedIcon,
  PersonAdd as AddGuestIcon
} from '@mui/icons-material';
import ManagerProfileImage from '../assets/images/Apartment/Profileaparteicon.jpg';

import ApartmentHero from './ApartmentHero';
import { useLocation, useNavigate } from 'react-router-dom';
import GuestsInput from "../components/search/GuestsInput";
import DateInput from "../components/search/DateInput"; 

const PropertyDetails: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { title } = location.state;

  const [showGuestsInput, setShowGuestsInput] = useState(false);
  const [showDateInput, setShowDateInput] = useState(false);
  const [adults, setAdults] = useState<number>(0);
  const [children, setChildren] = useState<number>(0);
  const [pets, setPets] = useState<number>(0);
  const [nights, setNights] = useState<number>(1);
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [showConfirmBooking] = useState(false);

  const basePrice = 300000;
  const cautionFeePercentage = 0.1;

  const toggleGuestsInput = () => {
    setShowGuestsInput((prev) => !prev);
  };

  const toggleDateInput = () => {
    setShowDateInput((prev) => !prev);
  };

  const handleNightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNights(Math.max(1, parseInt(e.target.value) || 1));
  };

  const handleDateSelect = (checkIn: Date, checkOut: Date) => {
    setCheckInDate(checkIn.toISOString().split('T')[0]);
    setCheckOutDate(checkOut.toISOString().split('T')[0]);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setNights(diffDays);
    setShowDateInput(false); 
  };

  const totalChargingFee = basePrice * nights + pets * 20000;
  const cautionFee = totalChargingFee * cautionFeePercentage;

  const handleConfirmBookingClick = () => {
    navigate('/confirm-booking', {
      state: {
        title,
        checkInDate,
        checkOutDate,
        adults,
        children,
        pets,
        nights,
        basePrice,
        totalChargingFee
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('NGN', '₦');
  };

  if (showConfirmBooking) {
    return (
      <div>
        <h2>Booking Confirmation</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <ApartmentHero title={title} />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={ManagerProfileImage}
                  alt="Manager Profile"
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h2 className="text-[12px] font-medium mt-10">Managed by Adetunji Muideen</h2>
                  <p className="text-[11px] text-gray-500 mb-3">3 weeks ago</p>
                  <a href="#" className="text-black underline text-[12px]">
                    Message manager
                  </a>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-center sm:space-x-2 space-y-0 sm:space-y-0">
                <div className="block sm:hidden">
                  <StarIcon className="text-black" style={{ fontSize: '16px' }} />
                </div>
                <div className="hidden sm:flex space-x-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <StarIcon key={index} className="text-black" style={{ fontSize: '16px' }} />
                  ))}
                </div>
                <span className="font-semibold text-base sm:text-lg">5.0</span>
                <span className="text-[#028090] text-sm sm:text-base">625 Reviews</span>
              </div>
            </div>
          </div>

          <div className="py-6">
            <div className="rounded-md p-6 border border-solid border-black">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="flex items-center">
                  <GroupIcon className="text-black mr-2" style={{ fontSize: '16px' }} />
                  <span className="text-sm">8 Guests</span>
                </div>
                <div className="flex items-center">
                  <BedroomParentIcon className="text-black mr-2" style={{ fontSize: '16px' }} />
                  <span className="text-sm">4 Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <BathtubIcon className="text-black mr-2" style={{ fontSize: '16px' }} />
                  <span className="text-sm">5 Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <LivingIcon className="text-black mr-2" style={{ fontSize: '16px' }} />
                  <span className="text-sm">3 Living Rooms</span>
                </div>
                <div className="flex items-center">
                  <LibraryBooksIcon className="text-black mr-2" style={{ fontSize: '16px' }} />
                  <span className="text-sm">Library</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-300" />

          <div className="py-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">About this place</h3>
            <p className="text-gray-600 mt-4 text-[15px]">
              Discover a stunning 6-bedroom duplex that redefines modern living. Located in the heart of Lagos, this exquisite property boasts a perfect blend of comfort, style, and functionality. It features:
            </p>
            <ul className="list-inside mt-4 text-gray-600">
              <li className="mb-3 text-[15px]">6 Spacious Bedrooms: All en-suite, designed with large windows for ample natural light, and fitted with premium wardrobe systems.</li>
              <li className="mb-3 text-[15px]">This property is ideal for families or those seeking a spacious retreat in a prime location. It offers unparalleled comfort, security, and convenience, with close proximity to top-rated schools, shopping centers, and recreational facilities.</li>
            </ul>
          </div>

          <div className="py-6">
            <h3 className="text-xl font-semibold">Available Amenities</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex items-center">
                <WifiIcon className="text-black mr-2" />
                <span>Free WiFi</span>
              </div>
              <div className="flex items-center">
                <TvIcon className="text-black mr-2" />
                <span>Smart TV</span>
              </div>
              <div className="flex items-center">
                <AcUnitIcon className="text-black mr-2" />
                <span>Air Conditioner</span>
              </div>
              <div className="flex items-center">
                <FitnessCenterIcon className="text-black mr-2" />
                <span>Compact Gym</span>
              </div>
              <div className="flex items-center">
                <SecurityIcon className="text-black mr-2" />
                <span>Security Doors</span>
              </div>
              <div className="flex items-center">
                <SpeakerIcon className="text-black mr-2" />
                <span>Wall-Inbuilt Speakers</span>
              </div>
              <div className="flex items-center">
                <BoltIcon className="text-black mr-2" />
                <span>24/7 Electricity</span>
              </div>
              <div className="flex items-center">
                <KitchenIcon className="text-black mr-2" />
                <span>Open Kitchen</span>
              </div>
              <div className="flex items-center">
                <KingBedIcon className="text-black mr-2" />
                <span>King-Sized Bed</span>
              </div>
            </div>
          </div>

          <hr className="my-6 border-gray-300" />
           
          <div className="text-center">
            You need to be logged in before you can rate this apartment
          </div>
        </div>

        {/* Right Section - Booking Card */}
        <div className="lg:w-1/3">
          <div className="p-6 border rounded-md shadow-lg mb-6">
          <h3 className="text-2xl font-semibold text-[#028090]">{formatPrice(basePrice)}</h3>
            <div className="mt-4">
              {/* Check-in / Check-out Input */}
              <div className="relative mb-4">
                <div
                  className="border p-3 w-full pl-10 rounded-md text-[12px] text-center cursor-pointer"
                  onClick={toggleDateInput}
                >
                  {checkInDate && checkOutDate ? `${checkInDate} - ${checkOutDate}` : 'Select Check-in / Check-out'}
                </div>
                {showDateInput && (
                  <DateInput
                    onClose={toggleDateInput}
                    onDateSelect={handleDateSelect}
                    showTwoMonths={false} 
                  />
                )}
              </div>

              {/* Nights Input */}
              <div className="relative mb-4">
                <div className="flex items-center border p-2 rounded-md">
                  <div className="flex-1 text-center">
                    <span className="text-[12px] pl-6"> Nights</span>
                  </div>
                  <input
                    type="number"
                    value={nights}
                    onChange={handleNightsChange}
                    className="w-8 text-center border rounded-md"
                    min="1"
                  />
                </div>
              </div>

              {/* Guests Input */}
              <div className="relative mb-4">
                <AddGuestIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <div
                  className="flex items-center border p-2 rounded-md cursor-pointer"
                  onClick={toggleGuestsInput}
                >
                  <div className="flex-1 text-center">
                    <span className="text-[12px]">Add Guests</span>
                  </div>
                </div>
                {showGuestsInput && (
                  <GuestsInput
                    adults={adults}
                    children={children}
                    pets={pets}
                    setAdults={setAdults}
                    setChildren={setChildren}
                    setPets={setPets}
                  />
                )}
              </div>


              {/* Booking Breakdown */}
              <div className="mt-6">
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-gray-500">Base price</span>
                  <span className="text-[12px] text-gray-500">{formatPrice(basePrice)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-gray-500">{nights} Nights</span>
                  <span className="text-[12px] text-gray-500">{formatPrice(basePrice * nights)}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-gray-500">{adults} Guests</span>
                  
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-gray-500">{children} Children</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-gray-500">{pets} Pets</span>
                </div>
                <hr className="my-4" />
                 
                <div className="flex justify-between text-lg">
                  <span className="text-[12px] font-medium">Rental fee</span>
                  <span className="text-[12px]">{formatPrice(totalChargingFee)}</span>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="text-[12px] font-medium">Caution fee</span>
                  <span className="text-[12px]">{formatPrice(cautionFee)}</span>
                </div>

                <div className="flex justify-between text-lg mt-2">
                  <span className="text-[14px] font-medium ">Total charging fee</span>
                  <span className="text-[12px]">{formatPrice(totalChargingFee)}</span>
                </div>
                <div className="text-[12px] text-gray-500">
                  (Including 15% VAT)
                </div>
              </div>

              {/* Confirm Button */}
              <button
                className="mt-6 w-full py-3 bg-[#028090] text-white rounded-md text-[14px]"
                onClick={handleConfirmBookingClick}
              >
                Confirm Booking
              </button>
            </div>
          </div>
          
          {/* Link Section */}
          <div className="text-center mb-6">
            <a href="#" className="text-[#028090] underline">
              View More Details
            </a>
          </div>

          {/* Map/Image Below the Link */}
          <div className="rounded-md shadow-md w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345093746!2d144.95373631580664!3d-37.81627974202195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5df1ed69fd%3A0x1a0b91559a0ec8b0!2sFederation%20Square!5e0!3m2!1sen!2sus!4v1614801111429!5m2!1sen!2sus"
              width="100%"
              height="400"
              className="rounded-md"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
      <hr className="my-10 border-gray-300" />

      <div>
        <h1 className="text-[20px] mt-6 font-medium">Things you should know</h1>
      </div>
          
      <div className="flex justify-between gap-6 mt-6">
        {/* House Rules Section */}
        <div className="flex-1">
          <h2 className="text-[16px] mb-4 font-medium">House Rules</h2>
          <ul className="space-y-2 text-[14px]">
            <li>Check-in: After 12:00 PM</li>
            <li>Maximum of 15 guests</li>
          </ul>
        </div>

        {/* Safety Tips Section */}
        <div className="flex-1">
          <h2 className="text-[16px] mb-4 font-medium">Safety Tips</h2>
          <ul className="space-y-2 text-[14px]">
            <li>Carbon monoxide alarm not reported</li>
            <li>Smoke alarm not reported</li>
            <li>Exterior security cameras on property</li>
          </ul>
        </div>

        {/* Cancellation Policy Section */}
        <div className="flex-1">
          <h2 className="text-[16px] mb-4 font-medium">Cancellation Policy</h2>
          <ul className="space-y-2 text-[14px]">
            <li>Cancel before check-in on Nov 15 for a partial refund.</li>
            <li>The first 30 nights are non-refundable.</li>
            <li>Review this Host's full policy for details.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;