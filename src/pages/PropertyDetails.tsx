import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useMediaQuery } from '@mui/material';

import {
  Star as StarIcon,
  Wifi as WifiIcon,
  Tv as TvIcon,
  AcUnit as AcUnitIcon,
  FitnessCenter as FitnessCenterIcon,
  Group as GroupIcon,
  BedroomParent as BedroomParentIcon,
  Weekend as LivingIcon,
  Security as SecurityIcon,
  Speaker as SpeakerIcon,
  Bolt as BoltIcon,
  Kitchen as KitchenIcon,
  KingBed as KingBedIcon,
  Pool as PoolIcon,
} from '@mui/icons-material';
import ManagerProfileImage from '../assets/images/Apartment/Profileaparteicon.jpg';
import { Tabs, Tab, Box, Skeleton, Grid, Container, Typography, Button } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import BreadCrumb from '../components/breadcrumb';
import ApartmentHero from './ApartmentHero';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../components/pagelayout';
import {
  useGetPropertyByIdQuery,
  useLazyGetUnitAvailabilityQuery,
} from '../api/propertiesApi';
import { useBooking } from '../context/UserBooking';
import DateRangePicker from '../components/DateRangePicker';
import PhotoSlider from '../components/PhotoSlider';

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
  media: {
    fileUrl: string;
  }[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
  propertyId: number;
  createdAt: string;
  updatedAt: string;
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

interface Property {
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
  amenities: Amenity[];
  units: Unit[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
}

interface ApiResponse {
  data: Property;
}

const PropertyDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetPropertyByIdQuery(String(id)) as { data: ApiResponse | undefined, isLoading: boolean, error: unknown };
  const [trigger, { data: availabilityResult }] =
    useLazyGetUnitAvailabilityQuery();
  const [value, setValue] = useState<number>(0);
  const [propertyDetail, setPropertyDetail] = useState<Property | null>(null);
  const [showGuestsInput, setShowGuestsInput] = useState(false);
  const guestsInputRef = useRef<HTMLDivElement>(null);
  const [adults, setAdults] = useState<number>(0);
  const [children, setChildren] = useState<number>(0);
  const [pets, setPets] = useState<number>(0);
  const [nights, setNights] = useState<number>(1);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [datePrice, setDateprice] = useState<number | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [showConfirmBooking] = useState(false);
  const { setBooking } = useBooking();
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const displayCount = useMediaQuery('(min-width:600px)') ? 8 : 4;
  const [showPhotoSlider, setShowPhotoSlider] = useState(false);

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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isLoading && data) {
      setPropertyDetail(data?.data);
      if (data?.data?.units && data?.data?.units?.length > 0) {
        setValue(data?.data?.units[0]?.id);
      }
    }
  }, [isLoading, data]);

  useEffect(() => {
    if (propertyDetail?.id && value) {
      trigger({
        propertyId: propertyDetail.id.toString(),
        unitId: value.toString(),
      });
    }
  }, [value, propertyDetail?.id, trigger]);

  // Get the currently active unit by filtering
  const activeUnit =
    propertyDetail?.units && value
      ? propertyDetail?.units.find((unit) => unit.id === value)
      : undefined;

  useEffect(() => {
    if (availabilityResult?.data?.length) {
      const priceForDate = Number(activeUnit?.pricePerNight || 0);
      setDateprice(priceForDate);
    }
  }, [availabilityResult?.data, activeUnit?.pricePerNight]);

  console.log('value:', propertyDetail?.units?.[0]?.id);
  console.log('API Response:', data);
  console.log('Property Detail State:', propertyDetail);
  console.log('Availability:', availabilityResult);
  console.log('Error:', error);
  console.log('Is Loading:', isLoading);
  console.log("checkOutDate", checkOutDate);
  console.log("checkInDate", checkInDate);

  // Get Availabilty dates
  const availability = availabilityResult?.data?.map((a) => ({ date: a?.date }));

  console.log("availability", availability);

  console.log('activeUnit', activeUnit);

  // This Set Base Price and Caution fee
  const basePrice = Number(datePrice ||  activeUnit?.pricePerNight || 0);
  const cautionFeePercentage = activeUnit?.cautionFee;
  const title = activeUnit?.name;
  const unitImage = activeUnit?.media[0]?.fileUrl;

  const handleClickOutside = (event: MouseEvent) => {
    if (guestsInputRef.current && !guestsInputRef.current.contains(event.target as Node)) {
      setShowGuestsInput(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNights(Math.max(1, parseInt(e.target.value) || 1));
  };
    
  const totalChargingFee = (datePrice || basePrice) * nights + pets;
  // const vAT = totalChargingFee + 0.15 * totalChargingFee;
  const cautionFee = totalChargingFee * Number(cautionFeePercentage || 0);

  const handleConfirmBookingClick = () => {
    if ((!datePrice && !basePrice) || !nights || adults === 0) {
      toast.error("Please ensure Unit price, nights, and adults are set before proceeding.");
      return;
    }
    setBooking({
      id: id || '',
      title: title || '',
      checkInDate: checkInDate
        ? checkInDate.toLocaleDateString("en-CA").substring(0, 10)
        : '',
      checkOutDate: checkOutDate
        ? checkOutDate.toLocaleDateString("en-CA").substring(0, 10)
        : '',
      adults,
      children,
      pets,
      nights,
      basePrice,
      totalChargingFee,
      unitImage: unitImage || '',
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
    <PageLayout>
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 4, 
          px: { xs: 2, sm: 3, md: 4 },
          mt: '4em'
        }}
      >
        <BreadCrumb
          description="View detailed information about the property"
          active={propertyDetail?.name ?? ''}
          link_one="/"
          link_one_name="Home"
        />
        
        {/* Hero Section */}
        <Box sx={{ mt: 3, mb: 4 }}>
          {isLoading ? (
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          ) : (
            <ApartmentHero
              title={propertyDetail?.name ?? ''}
              unitImages={{
                ...activeUnit,
                media: activeUnit?.media?.map(m => ({ fileUrl: m.fileUrl })) ?? []
              } as Unit}
            />
          )}
        </Box>

        <Grid container spacing={6}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Host Info */}
            <Box sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {isLoading ? (
                    <Skeleton variant="circular" width={48} height={48} />
                  ) : (
                    <img
                      src={ManagerProfileImage}
                      alt="Host"
                      style={{ width: 48, height: 48, borderRadius: '50%' }}
                    />
                  )}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>
                      Managed by Adetunji Muideen
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      3 weeks ago
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} sx={{ fontSize: 20, color: 'primary.main' }} />
                    ))}
                  </Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {propertyDetail?.meta?.average_rating}
                  </Typography>
                  <Typography variant="body2" color="primary.main">
                    ({propertyDetail?.meta?.total_reviews || 0} Reviews)
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Unit Details */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" gutterBottom fontWeight={500}>
                Unit Details
              </Typography>
              <TabContext value={value.toString()}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={value}
                    onChange={(_, newValue) => setValue(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="property units"
                  >
                    {propertyDetail?.units?.map((unit) => (
                      <Tab
                        key={unit.id}
                        label={unit.name}
                        value={unit.id}
                        sx={{
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Tabs>
                </Box>

                {propertyDetail?.units?.map((unit) => (
                  <TabPanel key={unit.id} value={unit.id.toString()}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Box sx={{ 
                          p: 3, 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                        }}>
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={4} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <GroupIcon sx={{ fontSize: 20 }} />
                                <Typography>{unit.maxGuests} Guests</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BedroomParentIcon sx={{ fontSize: 20 }} />
                                <Typography>{unit.bedroomCount} Bedrooms</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LivingIcon sx={{ fontSize: 20 }} />
                                <Typography>{unit.livingRoomCount} Living Room</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6} sm={4} md={3}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <KitchenIcon sx={{ fontSize: 20 }} />
                                <Typography>{unit.kitchenCount} Kitchen</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>
                  </TabPanel>
                ))}
              </TabContext>
            </Box>

            {/* Amenities */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight={500}>
                What this place offers
              </Typography>
              <Grid container spacing={1.5}>
                {propertyDetail?.amenities?.slice(0, showAllAmenities ? undefined : displayCount).map((amenity, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      '&:hover': { 
                        bgcolor: 'action.hover',
                      }
                    }}>
                      {amenityIcons[amenity?.amenity?.name.toUpperCase() as keyof typeof amenityIcons]}
                      <Typography variant="body2" noWrap>{amenity?.amenity?.name}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              {propertyDetail?.amenities && propertyDetail.amenities.length > displayCount && (
                <Button 
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  sx={{ 
                    mt: 1.5,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  {showAllAmenities ? 'Show less' : `Show all ${propertyDetail.amenities.length} amenities`}
                </Button>
              )}
            </Box>

            {/* Description */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" gutterBottom fontWeight={500}>
                About this place
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {activeUnit?.description}
              </Typography>
            </Box>
          </Grid>

          {/* Booking Section */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              position: 'sticky',
              top: 24,
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              {/* Price Display */}
              <Typography variant="h4" sx={{ 
                color: 'primary.main', 
                mb: 2,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'baseline',
                gap: 1
              }}>
                {isLoading ? <Skeleton width={150} /> : formatPrice(datePrice || basePrice)}
                <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>/night</Typography>
              </Typography>

              <DateRangePicker
                startDate={checkInDate}
                endDate={checkOutDate}
                onStartDateChange={setCheckInDate}
                onEndDateChange={setCheckOutDate}
                disabled={isLoading}
              />

              {/* Nights and Guests Inputs */}
              <Box sx={{ my: 2, display: 'flex', gap: 2 }}>
                {/* Nights Input */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Nights</Typography>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }}>
                    <input
                      type="number"
                      value={nights}
                      onChange={handleNightsChange}
                      min="1"
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        textAlign: 'center',
                      }}
                    />
                  </Box>
                </Box>

                {/* Guests Input */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Guests</Typography>
                  <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: 'primary.main',
                    }
                  }}>
                    <input
                      type="number"
                      value={adults + children}
                      onChange={(e) => {
                        const total = Math.max(0, parseInt(e.target.value) || 0);
                        setAdults(total);
                        setChildren(0);
                      }}
                      min="1"
                      max={activeUnit?.maxGuests || 1}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        textAlign: 'center',
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Pets Input */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>Pets (Optional)</Typography>
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'primary.main',
                  }
                }}>
                  <input
                    type="number"
                    value={pets}
                    onChange={(e) => setPets(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: '1rem',
                      textAlign: 'center',
                      '&::-webkit-inner-spin-button': {
                        opacity: 1
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Total Price Breakdown */}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Price Details</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{nights} night{nights !== 1 ? 's' : ''}</Typography>
                  <Typography>{formatPrice(totalChargingFee)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Caution Fee</Typography>
                  <Typography>{formatPrice(cautionFee)}</Typography>
                </Box>
              </Box>

              {/* Book Now Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleConfirmBookingClick}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                Book Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <ToastContainer position="bottom-right" />
    </PageLayout>
  );
};

export default PropertyDetails;