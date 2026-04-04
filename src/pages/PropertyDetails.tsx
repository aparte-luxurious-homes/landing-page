import React, { useState, useRef, useEffect, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useMediaQuery } from '@mui/material';

import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@mui/material';
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
} from '@react-google-maps/api';
import { LocationOn as LocationOnIcon } from '@mui/icons-material';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import usePageTitle from '../hooks/usePageTitle';

import {
  Box,
  Grid,
  Container,
  Typography,
  Button,
  Skeleton,
} from '@mui/material';
import ApartmentHero from './ApartmentHero';
import ReviewsList from '../components/property/ReviewsList';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageLayout from '../components/pagelayout';
import {
  useGetPropertyByIdQuery,
  useLazyGetUnitAvailabilityQuery,
} from '../api/propertiesApi';
import { BookingContext } from '../context/UserBooking';
import { useAppSelector } from '../hooks';
import { Icon } from '@iconify/react';
import MobileBookingSummary from '../components/property/MobileBookingSummary';
import PropertyHostInfo from '../components/property/PropertyHostInfo';
import PropertyQuickInfo from '../components/property/PropertyQuickInfo';
import UnitDetailsList from '../components/property/UnitDetailsList';
import BookingSidebar from '../components/property/BookingSidebar';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const libraries: any = ['places'];

interface Unit {
  id: string;
  name: string;
  description: string;
  bedroom_count: number;
  kitchen_count: number;
  living_room_count: number;
  max_guests: number;
  count: number;
  price_per_night: string;
  caution_fee: string;
  amenities: {
    amenity: {
      name: string;
    };
  }[];
  availability: string[];
  is_verified: boolean;
  is_whole_property: boolean;
  media: {
    fileUrl: string;
  }[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
  property_id: string;
  createdAt: string;
  updatedAt: string;
}

interface Amenity {
  id: string;
  amenityId: string;
  assignableId: string;
  assignableType: string;
  createdAt: string;
  amenity: {
    id: string;
    name: string;
  };
}

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  property_type: string;
  is_verified: boolean;
  is_pet_allowed: boolean;
  booking_mode?: string;
  createdAt: string;
  amenities: Amenity[];
  units: Unit[];
  meta: {
    total_reviews: number;
    average_rating: number;
  };
  media: {
    fileUrl: string;
  }[];
  agent: {
    name: string;
    image?: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface ApiResponse {
  data: Property;
}

interface AvailabilityResponse {
  date: string;
  pricing: string;
  is_blackout: boolean;
  count: number;
}

const PropertyDetails: React.FC = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const preservedState = location.state?.preservedState;
  const { data, isLoading } = useGetPropertyByIdQuery(String(id)) as {
    data: ApiResponse | undefined;
    isLoading: boolean;
    error: unknown;
  };
  const [trigger, { data: availabilityResult }] =
    useLazyGetUnitAvailabilityQuery();
  const [value, setValue] = useState<string>('');
  const [propertyDetail, setPropertyDetail] = useState<Property | null>(null);
  const guestsInputRef = useRef<HTMLDivElement>(null);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [pets, setPets] = useState<number>(0);
  const [nights, setNights] = useState<number>(1);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [datePrice, setDateprice] = useState<number | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [showConfirmBooking] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<number>(1);
  const { setBooking } = useContext(BookingContext) || {};
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const displayCount = useMediaQuery('(min-width:600px)') ? 8 : 4;
  const auth = useAppSelector((state) => state.root.auth);
  const isAuthenticated = auth.isAuthenticated && !!auth.token;
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const unitAvailability: AvailabilityResponse[] =
    (availabilityResult?.data as AvailabilityResponse[]) || [];

  // Add title component
  const titleComponent = usePageTitle({
    title: data?.data?.name || 'Property Details',
  });

  const formatDateLocal = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isLoading && data) {
      setPropertyDetail(data?.data);
      console.log('API Response:', data);
      console.log('Property coordinates:', {
        lat: data?.data?.latitude,
        lng: data?.data?.longitude,
        rawData: data?.data,
      });
      if (data?.data?.units && data?.data?.units?.length > 0) {
        setValue(data?.data?.units[0]?.id);
      }
    }
  }, [isLoading, data]);

  useEffect(() => {
    if (propertyDetail?.id && value) {
      trigger({
        propertyId: propertyDetail.id,
        unitId: value,
      });
    }
  }, [value, propertyDetail?.id, trigger]);

  useEffect(() => {
    if (propertyDetail?.units) {
      const currentUnit = propertyDetail.units.find(
        (unit) => unit.id === value
      );
      if (currentUnit) {
        // Reset states for the new unit
        setShowFullDescription(false);
        setShowAllAmenities(false);
        setAdults(1);
        setChildren(0);
        setPets(0);
        setCheckInDate(null);
        setCheckOutDate(null);
        setNights(1);
        setDateprice(null);
        setSelectedUnits(1);
      }
    }
  }, [value, propertyDetail?.units]); // value is the tab ID

  const activeUnit =
    propertyDetail?.units && value
      ? propertyDetail?.units.find((unit) => unit.id === value)
      : undefined;

  useEffect(() => {
    if (availabilityResult?.data?.length && checkInDate) {
      const checkInStr = formatDateLocal(checkInDate);
      const avail = (availabilityResult.data as any[]).find((a: any) => {
        const aDate = new Date(a.date);
        return formatDateLocal(aDate) === checkInStr;
      });

      if (avail && (avail.is_blackout || avail.count < selectedUnits)) {
        // Current check-in is no longer available (or insufficient capacity), clear it
        setCheckInDate(null);
        setCheckOutDate(null);
        setNights(0);
        setDateprice(null);
      } else {
        const priceForDate = Number(activeUnit?.price_per_night || 0);
        setDateprice(priceForDate);
      }
    } else if (availabilityResult?.data?.length) {
      const priceForDate = Number(activeUnit?.price_per_night || 0);
      setDateprice(priceForDate);
    }
  }, [
    availabilityResult?.data,
    activeUnit?.price_per_night,
    checkInDate,
    selectedUnits,
  ]);

  useEffect(() => {
    if (preservedState) {
      // Restore the preserved state
      if (preservedState.checkInDate)
        setCheckInDate(new Date(preservedState.checkInDate));
      if (preservedState.checkOutDate)
        setCheckOutDate(new Date(preservedState.checkOutDate));
      if (typeof preservedState.adults === 'number')
        setAdults(preservedState.adults);
      if (typeof preservedState.children === 'number')
        setChildren(preservedState.children);
      if (typeof preservedState.pets === 'number') setPets(preservedState.pets);
      if (typeof preservedState.nights === 'number')
        setNights(preservedState.nights);
      if (typeof preservedState.basePrice === 'number')
        setDateprice(preservedState.basePrice);
      if (preservedState.unitId) setValue(preservedState.unitId);

      // Trigger availability check with preserved dates if we have all required data
      if (
        preservedState.checkInDate &&
        propertyDetail?.id &&
        preservedState.unitId
      ) {
        trigger({
          propertyId: propertyDetail.id,
          unitId: preservedState.unitId,
        });
      }
    }
  }, [preservedState, propertyDetail?.id, trigger]);

  // Get Availability dates
  // const availableDates = (availabilityResult?.data as AvailabilityResponse[] | undefined)?.map(a => new Date(a.date)) || [];

  // console.log('activeUnit', activeUnit);

  // This Set Base Price and Caution fee
  const basePriceValue = Number(activeUnit?.price_per_night || 0);
  const currentBasePrice = isNaN(basePriceValue) ? 0 : basePriceValue;
  const basePrice = Number(datePrice || currentBasePrice);
  const cautionFeeValue = Number(activeUnit?.caution_fee || 0);
  const cautionFeePercentage = isNaN(cautionFeeValue) ? 0 : cautionFeeValue;
  const totalChargingFee =
    basePrice * nights * selectedUnits + cautionFeePercentage;
  const title = activeUnit?.name;
  const unitImage =
    (activeUnit?.media?.[0] as any)?.media_url ||
    (activeUnit?.media?.[0] as any)?.mediaUrl ||
    activeUnit?.media?.[0]?.fileUrl ||
    (propertyDetail?.media?.[0] as any)?.media_url ||
    (propertyDetail?.media?.[0] as any)?.mediaUrl ||
    propertyDetail?.media?.[0]?.fileUrl ||
    '';

  const handleClickOutside = (event: MouseEvent) => {
    if (
      guestsInputRef.current &&
      !guestsInputRef.current.contains(event.target as Node)
    ) {
      // setShowGuestsInput(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      setNights(calculateNights(checkInDate, checkOutDate));
    }
  }, [checkInDate, checkOutDate]);

  // const vAT = totalChargingFee + 0.15 * totalChargingFee;
  // const cautionFee = totalChargingFee * Number(cautionFeePercentage || 0);

  const handleConfirmBookingClick = () => {
    if ((!datePrice && !basePrice) || !nights || adults === 0) {
      toast.error(
        'Please ensure Unit price, nights, and adults are set before proceeding.'
      );
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates.');
      return;
    }

    // Check if selected nights are blocked
    // A guest checking in on Jan 1 and out on Jan 5 occupies nights of 1, 2, 3, 4.
    const tempDate = new Date(checkInDate);
    while (tempDate < checkOutDate) {
      const dStr = formatDateLocal(tempDate);
      const avail = unitAvailability?.find((a: any) => {
        const aDate = new Date(a.date);
        return formatDateLocal(aDate) === dStr;
      });
      if (avail && (avail.is_blackout || avail.count === 0)) {
        toast.error(`The night of ${dStr} is no longer available.`);
        return;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const bookingDetails = {
      id: id || '',
      title: title || '',
      check_in_date: formatDateLocal(checkInDate),
      check_out_date: formatDateLocal(checkOutDate),
      adults,
      children,
      pets,
      nights,
      base_price: basePrice,
      caution_fee: cautionFeePercentage,
      total_charging_fee: totalChargingFee,
      unit_image: unitImage || '',
      unit_count: selectedUnits,
      unit_id: value,
      booking_mode: propertyDetail?.booking_mode || 'INSTANT',
      owner: propertyDetail?.agent,
    };

    if (setBooking) {
      setBooking(bookingDetails);
    }

    if (!isAuthenticated) {
      navigate('/login?redirect=/confirm-booking');
      return;
    }

    navigate('/confirm-booking');
  };

  const formatPrice = (price: number) => {
    const safePrice = isNaN(price) ? 0 : price;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(safePrice)
      .replace('NGN', '₦');
  };

  if (showConfirmBooking) {
    return (
      <div>
        <h2>Booking Confirmation</h2>
      </div>
    );
  }
  const calculateNights = (checkIn: Date | null, checkOut: Date | null) => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <PageLayout>
      {titleComponent}
      <Container
        maxWidth="xl"
        sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: { xs: 8, md: 13 } }}
      >
        <Box sx={{ display: { xs: 'none', md: 'block' }, mb: 3 }}>
          <Breadcrumbs
            separator="›"
            sx={{
              '.MuiBreadcrumbs-li': {
                fontSize: { xs: '0.875rem', md: '1rem' },
              },
            }}
          >
            <Link to="/" className="text-[#667185] no-underline">
              Home
            </Link>
            <Typography color="text.primary">{propertyDetail?.name}</Typography>
          </Breadcrumbs>
        </Box>

        <ApartmentHero
          images={propertyDetail?.media || []}
          title={propertyDetail?.name}
          unit={activeUnit || null}
        />

        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Host Info */}
            <PropertyHostInfo
              agent={propertyDetail?.agent}
              meta={propertyDetail?.meta}
            />

            {/* Property Quick Info */}
            <PropertyQuickInfo
              city={propertyDetail?.city}
              country={propertyDetail?.country}
              propertyType={propertyDetail?.property_type}
              isPetAllowed={propertyDetail?.is_pet_allowed}
            />

            {/* Unit Details */}
            <UnitDetailsList
              units={propertyDetail?.units}
              activeTab={value}
              onTabChange={setValue}
              showFullDescription={showFullDescription}
              setShowFullDescription={setShowFullDescription}
              showAllAmenities={showAllAmenities}
              setShowAllAmenities={setShowAllAmenities}
              displayCount={displayCount}
            />

            {/* Amenities */}
            {/* {propertyDetail?.amenities && propertyDetail.amenities.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom fontWeight={500}>
                  What this place offers
                </Typography>
                <Grid container spacing={1.5}>
                  {propertyDetail.amenities.slice(0, showAllAmenities ? undefined : displayCount).map((amenity, index) => (
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
                
                {propertyDetail.amenities.length > displayCount && (
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
            )} */}

            {/* Things you should know */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom fontWeight={500}>
                Things you should know
              </Typography>

              {/* Mobile Accordions */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="h6"
                      sx={{ fontSize: '1rem', fontWeight: 500 }}
                    >
                      House rules
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Check-in: From 12:00 PM
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Checkout: 11:00 AM
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No smoking
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No parties or events
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="h6"
                      sx={{ fontSize: '1rem', fontWeight: 500 }}
                    >
                      Safety & property
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Security cameras on property
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Carbon monoxide alarm
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Smoke alarm
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="h6"
                      sx={{ fontSize: '1rem', fontWeight: 500 }}
                    >
                      Cancellation policy
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      Please note that once your reservation is confirmed, a 20%
                      cancellation fee of the total amount paid will apply. This
                      fee remains in effect for all cancellations, including
                      those made on the scheduled date of check-in.
                      Additionally, a 50% penalty fee will be charged in the
                      event of a no-show.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Box>

              {/* Desktop Grid */}
              <Grid
                container
                spacing={3}
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontSize: '1rem' }}
                    >
                      House rules
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Check-in: 3:00 PM - 8:00 PM
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Checkout: 11:00 AM
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No smoking
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No parties or events
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontSize: '1rem' }}
                    >
                      Safety & property
                    </Typography>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Security cameras on property
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Carbon monoxide alarm
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Smoke alarm
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontSize: '1rem' }}
                    >
                      Cancellation policy
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      Free cancellation before 48 hours of check-in. After that,
                      cancel before check-in and get a 50% refund, minus the
                      service fee.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Location Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" gutterBottom fontWeight={500}>
                Location
              </Typography>

              <Box sx={{ position: 'relative' }}>
                {/* Address Display */}
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      filter: !isAuthenticated ? 'blur(4px)' : 'none',
                      userSelect: 'none',
                    }}
                  >
                    <LocationOnIcon sx={{ color: 'primary.main' }} />
                    {propertyDetail?.address && `${propertyDetail.address}, `}
                    {propertyDetail?.city}, {propertyDetail?.state}
                  </Typography>
                  {!isAuthenticated && (
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => navigate('/login')}
                      sx={{ mt: 1 }}
                    >
                      Log in to see exact location
                    </Button>
                  )}
                </Box>

                {/* Map Container */}
                <Box
                  sx={{
                    position: 'relative',
                    height: '400px',
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'action.hover',
                    '& .leaflet-container': {
                      height: '100%',
                      width: '100%',
                      zIndex: 1,
                    },
                  }}
                >
                  {!isAuthenticated && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        p: 3,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h6">
                        Sign in to see location
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        For security reasons, exact location is only visible to
                        logged-in users
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/login')}
                        sx={{ textTransform: 'none', px: 4 }}
                      >
                        Sign in
                      </Button>
                    </Box>
                  )}
                  <Box
                    sx={{
                      height: '100%',
                      filter: !isAuthenticated ? 'blur(8px)' : 'none',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {isLoaded ? (
                      propertyDetail?.latitude && propertyDetail?.longitude ? (
                        <GoogleMap
                          mapContainerStyle={{ height: '100%', width: '100%' }}
                          center={{
                            lat: propertyDetail.latitude,
                            lng: propertyDetail.longitude,
                          }}
                          zoom={15}
                        >
                          <Marker
                            position={{
                              lat: propertyDetail.latitude,
                              lng: propertyDetail.longitude,
                            }}
                            onClick={() => setShowInfoWindow(true)}
                          />
                          {showInfoWindow && (
                            <InfoWindow
                              position={{
                                lat: propertyDetail.latitude,
                                lng: propertyDetail.longitude,
                              }}
                              onCloseClick={() => setShowInfoWindow(false)}
                            >
                              <Box sx={{ p: 1, maxWidth: 200 }}>
                                <Box
                                  component="img"
                                  src={
                                    propertyDetail.media?.[0]?.fileUrl ||
                                    '/png/placeholder.png'
                                  }
                                  sx={{
                                    width: '100%',
                                    height: 100,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    mb: 1,
                                  }}
                                />
                                <Typography
                                  variant="subtitle2"
                                  sx={{ fontWeight: 'bold' }}
                                >
                                  {propertyDetail.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  {propertyDetail.address}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    mt: 1,
                                    fontWeight: 'bold',
                                    color: 'primary.main',
                                  }}
                                >
                                  ₦
                                  {Number(
                                    propertyDetail.units?.[0]
                                      ?.price_per_night || 0
                                  ).toLocaleString()}{' '}
                                  / night
                                </Typography>
                              </Box>
                            </InfoWindow>
                          )}
                        </GoogleMap>
                      ) : (
                        <Box
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            p: 3,
                            bgcolor: 'action.hover',
                          }}
                        >
                          <Icon icon="mdi:map-marker-off" fontSize={40} />
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            textAlign="center"
                          >
                            {propertyDetail?.address ? (
                              <>
                                Map view not available
                                <br />
                                {propertyDetail.address}
                                <br />
                                {propertyDetail?.city}, {propertyDetail?.state}
                              </>
                            ) : (
                              'Location details not available'
                            )}
                          </Typography>
                        </Box>
                      )
                    ) : (
                      <Skeleton variant="rectangular" height="100%" />
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Booking Section */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            <BookingSidebar
              isLoading={isLoading}
              basePrice={basePrice}
              datePrice={datePrice}
              checkInDate={checkInDate}
              checkOutDate={checkOutDate}
              setCheckInDate={setCheckInDate}
              setCheckOutDate={setCheckOutDate}
              unitAvailability={unitAvailability}
              selectedUnits={selectedUnits}
              setSelectedUnits={setSelectedUnits}
              activeUnit={activeUnit}
              adults={adults}
              children={children}
              setAdults={setAdults}
              setChildren={setChildren}
              pets={pets}
              setPets={setPets}
              isPetAllowed={propertyDetail?.is_pet_allowed || false}
              nights={nights}
              totalChargingFee={totalChargingFee}
              cautionFeePercentage={cautionFeePercentage}
              handleConfirmBookingClick={handleConfirmBookingClick}
              formatPrice={formatPrice}
              bookingMode={propertyDetail?.booking_mode || 'INSTANT'}
            />
          </Grid>
        </Grid>

        {/* Reviews Section */}
        {propertyDetail?.id && (
          <Box sx={{ mt: 8, mb: 4 }}>
            <ReviewsList propertyId={propertyDetail.id.toString()} />
          </Box>
        )}
      </Container>
      <MobileBookingSummary
        isLoading={isLoading}
        basePrice={basePrice}
        datePrice={datePrice}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        onStartDateChange={setCheckInDate}
        onEndDateChange={setCheckOutDate}
        nights={nights}
        guests={adults + children}
        maxGuests={activeUnit?.max_guests || 1}
        totalPrice={totalChargingFee}
        onGuestsChange={(total) => {
          setAdults(total);
          setChildren(0);
        }}
        formatPrice={formatPrice}
        onBookClick={handleConfirmBookingClick}
        unitAvailability={unitAvailability}
        selectedUnits={selectedUnits}
        onUnitsChange={setSelectedUnits}
        maxUnits={activeUnit?.count || 1}
        bookingMode={propertyDetail?.booking_mode || 'INSTANT'}
      />
      <ToastContainer position="bottom-right" />
    </PageLayout>
  );
};

export default PropertyDetails;
