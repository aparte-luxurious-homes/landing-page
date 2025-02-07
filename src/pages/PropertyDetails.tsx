import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';

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
  PersonAdd as AddGuestIcon,
  Pool as PoolIcon,
} from '@mui/icons-material';
import ManagerProfileImage from '../assets/images/Apartment/Profileaparteicon.jpg';
import { Tabs, Tab, Box, Skeleton } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import BreadCrumb from '../components/breadcrumb';
import ApartmentHero from './ApartmentHero';
import { useNavigate, useParams } from 'react-router-dom';
import GuestsInput from '../components/search/GuestsInput';
import DateInput from '../components/search/DateInput';
import {
  useGetPropertyByIdQuery,
  useLazyGetUnitAvailabilityQuery,
} from '../api/propertiesApi';
import { useBooking } from '../context/UserBooking';

interface Unit {
  id: number;
  name: string;
  description: string;
  bedroomCount: number;
  kitchenCount: number;
  livingRoomCount: number;
  maxGuests: number;
  pricePerNight: string;
  cautionFee: string;
  amenities: string[];
  availability: string[];
  isVerified: boolean;
  isWholeProperty: boolean;
  media: any[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
  propertyId: number;
  createdAt: string;
  updatedAt: string;
}
interface PropertyType {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  propertyType: string;
  isVerified: boolean;
  isPetAllowed: boolean;
  createdAt: string;
  media: any[];
  amenities: Amenity[];
  units: Unit[];
}

interface Amenity {
  id: number;
  amenityId: number;
  assignableId: number;
  assignableType: string;
  createdAt: string;
  amenity: {
    id: number;
    name: string;
  };
}

const PropertyDetails: React.FC = () => {
  // const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetPropertyByIdQuery(String(id));
  const [trigger, { data: availabilityResult, isFetching }] =
    useLazyGetUnitAvailabilityQuery();

  const [value, setValue] = useState<number | string>('');
  const [propertyDetail, setPropertyDetail] = useState<any | null>(null);
  const [showGuestsInput, setShowGuestsInput] = useState(false);
  const [showDateInput, setShowDateInput] = useState<'in' | 'out' | null>(null);
  const [adults, setAdults] = useState<number>(0);
  const [children, setChildren] = useState<number>(0);
  const [pets, setPets] = useState<number>(0);
  const [nights, setNights] = useState<number>(1);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [showConfirmBooking] = useState(false);
  const { setBooking } = useBooking();

  const amenityIcons = {
    'FREE WIFI': <WifiIcon className="text-black mr-2" />,
    'SMART TV': <TvIcon className="text-black mr-2" />,
    'AIR CONDITIONER': <AcUnitIcon className="text-black mr-2" />,
    'COMPACT GYM': <FitnessCenterIcon className="text-black mr-2" />,
    'SECURITY DOORS': <SecurityIcon className="text-black mr-2" />,
    'WALL-INBUILT SPEAKERS': <SpeakerIcon className="text-black mr-2" />,
    '24/7 ELECTRICITY': <BoltIcon className="text-black mr-2" />,
    'OPEN KITCHEN': <KitchenIcon className="text-black mr-2" />,
    'KING-SIZED BED': <KingBedIcon className="text-black mr-2" />,
    'SWIMMING POOL': <PoolIcon className="text-black mr-2" />,
  };

  useEffect(() => {
    if (!isLoading && data) {
      setPropertyDetail(data);

      // Check if units exist and are not empty
      if (data?.units?.length > 0) {
        setValue(data?.units[0]?.id);
      }
    }
  }, [isLoading, data]);

  useEffect(() => {
    //  alert(`Value: ${propertyDetail?.data.id}`)
    trigger({
      propertyId: propertyDetail?.data.id,
      unitId: value.toString(),
    });
  }, [value]);

  console.log('value', value);
  console.log('Property Detail:', propertyDetail?.data);
  console.log('Availability:', availabilityResult);
  console.log('Error:', error);
  console.log('Is Loading:', isLoading);

  // Get Availabilty dates
  const availability = availabilityResult?.data?.map((a) => ({ date: a.date }));

  // Get the currently active unit by filtering
  const activeUnit =
    propertyDetail?.data?.units && value
      ? propertyDetail?.data?.units.find((unit: Unit) => unit?.id === value)
      : undefined;
  console.log('activeUnit', activeUnit);

  // This Set Base Price and Caution fee
  const basePrice = Number(activeUnit?.pricePerNight || 0);
  const cautionFeePercentage = activeUnit?.cautionFee;
  const title = activeUnit?.name;
  const unitImage = activeUnit?.media[0]?.fileUrl;
  const toggleGuestsInput = () => {
    setShowGuestsInput((prev) => !prev);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const toggleDateInput = (type: 'in' | 'out' | null) => {
    if (isFetching) {
      toast.error('Fetching availability ... please wait!');
      return;
    }
    setShowDateInput(type);
  };

  const handleNightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNights(Math.max(1, parseInt(e.target.value) || 1));
  };

  const displayError = (message: string) => toast.error(message);

  const handleDateSelect = (date: Date) => {
    if (showDateInput === 'in') {
      setCheckInDate(date);
      setCheckOutDate(null);
      setNights(0);
    } else {
      if (!checkInDate) {
        toast.error('Select a check-in date!');
        return;
      }
      if (date.getDate() <= checkInDate.getDate()) {
        toast.error('Check-out date must be ahead of check-in date!');
        return;
      }
      setCheckOutDate(date);
      const diffTime = Math.abs(date.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays);
    }
  };

  const totalChargingFee = basePrice * nights + pets * 20000;
  const vAT = totalChargingFee + 0.15 * totalChargingFee;
  const cautionFee = totalChargingFee * cautionFeePercentage;

  const handleConfirmBookingClick = () => {
    setBooking({
      id: id || '',
      title,
      checkInDate: checkInDate
        ? checkInDate.toISOString().substring(0, 10)
        : '',
      checkOutDate: checkOutDate
        ? checkOutDate.toISOString().substring(0, 10)
        : '',
      adults,
      children,
      pets,
      nights,
      basePrice,
      totalChargingFee,
      unitImage,
      unitId: typeof value === 'number' ? value : 0,
    });
    navigate('/confirm-booking');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace('NGN', '₦');
  };

  if (showConfirmBooking) {
    return (
      <div>
        <h2>Booking Confirmation</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 mt-20">
      <BreadCrumb
        description="View detailed information about the property"
        active={propertyDetail?.data?.name}
        link_one="/"
        link_one_name="Home"
      />
      <div className="mt-9">
        {isLoading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={400}
            sx={{ borderRadius: '10px' }}
          />
        ) : (
          <ApartmentHero
            title={propertyDetail?.data?.name}
            unitImages={activeUnit}
          />
        )}
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isLoading ? (
                  <Skeleton variant="circular" width={40} height={40} />
                ) : (
                  <img
                    src={ManagerProfileImage}
                    alt="Manager Profile"
                    className="w-10 h-10 rounded-full mr-3"
                  />
                )}
                <div>
                  {isLoading ? (
                    <>
                      <Skeleton width={100} height={20} />
                      <Skeleton width={80} height={15} />
                    </>
                  ) : (
                    <>
                      <h2 className="text-[12px] font-medium mt-3">
                        Managed by Adetunji Muideen
                      </h2>
                      <p className="text-[11px] text-gray-500 mb-3">
                        3 weeks ago
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-center sm:space-x-2 space-y-0 sm:space-y-0">
                <div className="block sm:hidden">
                  <StarIcon
                    className="text-black"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <div className="hidden sm:flex space-x-1">
                  {Array.from({ length: 5 }, (_, index) => (
                    <StarIcon
                      key={index}
                      className="text-black"
                      style={{ fontSize: '16px' }}
                    />
                  ))}
                </div>
                <span className="font-semibold text-base sm:text-lg">
                  {propertyDetail?.data?.meta?.average_rating}
                </span>
                <span className="text-[#028090] text-sm sm:text-base">{` || ${propertyDetail?.data?.meta?.total_reviews} Reviews`}</span>
              </div>
            </div>
          </div>

          <Box sx={{ marginTop: '15px' }}>
            <TabContext value={value || 1}>
              <Tabs
                value={value || 1}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="property types tabs"
                sx={{
                  textAlign: 'center',
                  borderBottom: 1,
                  borderColor: 'divider',
                  justifyContent: 'center',
                }}
              >
                {isLoading ? (
                  <Skeleton width="100%" height={40} />
                ) : (
                  propertyDetail?.data?.units.map((type: PropertyType) => (
                    <Tab
                      key={type?.id}
                      label={type?.name}
                      value={type?.id}
                      sx={{
                        textTransform: 'none',
                        fontSize: { xs: '0.4rem', sm: '1rem' },
                        minWidth: { xs: 'auto', sm: '100px' },
                      }}
                    />
                  ))
                )}
              </Tabs>
              {isLoading ? (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={200}
                  sx={{ borderRadius: '10px', mt: 2 }}
                />
              ) : (
                propertyDetail?.data?.units.map((unit: any) => (
                  <TabPanel key={unit?.id} value={unit?.id}>
                    {/* Additional Unit Details */}
                    <div className="py-3">
                      <div className="rounded-md p-6 border border-solid border-black">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          <div className="flex items-center">
                            <GroupIcon
                              className="text-black mr-2"
                              style={{ fontSize: '16px' }}
                            />
                            <span className="text-sm">
                              {unit?.maxGuests} Guests
                            </span>
                          </div>
                          <div className="flex items-center">
                            <BedroomParentIcon
                              className="text-black mr-2"
                              style={{ fontSize: '16px' }}
                            />
                            <span className="text-sm">
                              {unit?.bedroomCount} Bedrooms
                            </span>
                          </div>
                          <div className="flex items-center">
                            <BathtubIcon
                              className="text-black mr-2"
                              style={{ fontSize: '16px' }}
                            />
                            <span className="text-sm">
                              {unit?.bedroomCount} Bathrooms
                            </span>
                          </div>
                          <div className="flex items-center">
                            <LivingIcon
                              className="text-black mr-2"
                              style={{ fontSize: '16px' }}
                            />
                            <span className="text-sm">
                              {unit?.livingRoomCount} Living Rooms
                            </span>
                          </div>
                          <div className="flex items-center">
                            <LibraryBooksIcon
                              className="text-black mr-2"
                              style={{ fontSize: '16px' }}
                            />
                            <span className="text-sm">
                              {unit?.library
                                ? 'Library Available'
                                : 'No Library'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                ))
              )}
            </TabContext>
          </Box>

          <hr className="mb-3 border-gray-300" />

          <div className="py-6 border-b border-gray-200">
            {isLoading ? (
              <Skeleton width="100%" height={100} />
            ) : (
              <p className="text-gray-600 mt-4 text-[15px]">
                {activeUnit?.description}
              </p>
            )}
          </div>

          <div className="py-6">
            <h3 className="text-xl font-semibold">Available Amenities</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {isLoading
                ? Array.from(new Array(10)).map((_, index) => (
                    <Skeleton key={index} width="100%" height={30} />
                  ))
                : propertyDetail?.data?.amenities?.map(
                    (amenity: Amenity, index: number) => (
                      <div key={index} className="flex items-center">
                        {/* Render the icon if it exists in the mapping */}
                        {amenityIcons[
                          amenity?.amenity?.name.toUpperCase() as keyof typeof amenityIcons
                        ] || (
                          <span className="text-black mr-2">🛠️</span> // Default icon or text
                        )}
                        <span>
                          {amenity?.amenity?.name ||
                            "ammenity name wasn't added"}
                        </span>
                      </div>
                    )
                  )}
            </div>
          </div>

          <hr className="my-6 border-gray-300" />

          {/* <div className="text-center">
            You need to be logged in before you can rate this apartment
          </div> */}
        </div>

        {/* Right Section - Booking Card */}
        <div className="lg:w-1/3">
          <div className="p-6 border rounded-md shadow-lg mb-6">
            <h3 className="text-2xl font-semibold text-[#028090]">
              {isLoading ? <Skeleton width={100} /> : formatPrice(basePrice)}
            </h3>
            <div className="mt-4">
              <div className="relative mb-4">
                <div className="flex justify-between items-center">
                  <div
                    className="border p-3 w-full rounded-md text-[12px] text-center cursor-pointer mr-2"
                    onClick={() => toggleDateInput('in')}
                  >
                    {checkInDate
                      ? format(checkInDate, 'yyyy-MM-dd')
                      : 'Select Check-in'}
                  </div>
                  -
                  <div
                    className="border p-3 w-full rounded-md text-[12px] text-center cursor-pointer ml-2"
                    onClick={() => toggleDateInput('out')}
                  >
                    {checkOutDate
                      ? format(checkOutDate, 'yyyy-MM-dd')
                      : 'Select Check-out'}
                  </div>
                  {/* </div> */}
                </div>
                {showDateInput && (
                  <DateInput
                    onClose={() => toggleDateInput(null)}
                    onDateSelect={handleDateSelect}
                    showTwoMonths={false}
                    availableDates={availability}
                    displayError={displayError}
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
                    readOnly
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
                    maxGuest={activeUnit?.maxGuests}
                  />
                )}
              </div>

              {/* Booking Breakdown */}
              <div className="mt-6">
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-gray-500">Base price</span>
                  <span className="text-[12px] text-gray-500">
                    {formatPrice(basePrice)}
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-gray-500">
                    {nights} Nights
                  </span>
                  <span className="text-[12px] text-gray-500">
                    {formatPrice(basePrice * nights)}
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-gray-500">
                    {adults} Guests
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-gray-500">
                    {children} Children
                  </span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[12px] text-gray-500">{pets} Pets</span>
                </div>
                <hr className="my-4" />

                <div className="flex justify-between text-lg">
                  <span className="text-[12px] font-medium">Rental fee</span>
                  <span className="text-[12px]">
                    {formatPrice(totalChargingFee || 0)}
                  </span>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="text-[12px] font-medium">Caution fee</span>
                  <span className="text-[12px]">{formatPrice(cautionFee)}</span>
                </div>

                <div className="flex justify-between text-lg mt-2">
                  <span className="text-[14px] font-medium ">
                    Total charging fee
                  </span>
                  <span className="text-[12px]">{formatPrice(vAT || 0)}</span>
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
                Book Your Aparte
              </button>
            </div>
          </div>

          {/* Link Section */}
          {/* <div className="text-center mb-6">
            <a href="#" className="text-[#028090] underline">
              View More Details
            </a>
          </div> */}

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
            <li>{`Maximum of ${activeUnit?.maxGuests} guests`}</li>
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
      <ToastContainer />
    </div>
  );
};

export default PropertyDetails;
