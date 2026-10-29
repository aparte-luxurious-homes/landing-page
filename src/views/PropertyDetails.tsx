'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useMediaQuery } from '@mui/material';

import {
  GoogleMap,
  Marker,
  Circle,
  useJsApiLoader,
  InfoWindow,
} from '@react-google-maps/api';
import { LocationOn as LocationOnIcon } from '@mui/icons-material';
import {
  Gavel as GavelIcon,
  VerifiedUserOutlined as ShieldIcon,
  EventBusyOutlined as EventBusyIcon,
} from '@mui/icons-material';

import { Box, Grid, Container, Typography, Skeleton } from '@mui/material';
import ApartmentHero from './ApartmentHero';
import AttributionStrip from '../components/links/AttributionStrip';
import ReviewsList from '../components/property/ReviewsList';
import { useNavigate, useParams, useLocation } from '@/lib/router';
import PageLayout from '../components/pagelayout';
import {
  useGetPropertyByIdQuery,
  useLazyGetUnitAvailabilityQuery,
} from '../api/propertiesApi';
import { BookingContext } from '../context/UserBooking';
import { useGetBookingQuoteMutation } from '../api/booking';
import { useAppSelector } from '../hooks';
import { Icon } from '@iconify/react';
import MobileBookingSummary from '../components/property/MobileBookingSummary';
import PropertyHostInfo from '../components/property/PropertyHostInfo';
import PropertyQuickInfo from '../components/property/PropertyQuickInfo';
import PropertyHeader from '../components/property/PropertyHeader';
import SectionNav from '../components/property/SectionNav';
import { BRAND, INK, TEAL, SAND, SERIF, PAPER, SectionHeading } from '../components/property/ui';
import UnitDetailsList from '../components/property/UnitDetailsList';
import DiscountOffers from '../components/property/DiscountOffers';
import type { DiscountSummary } from '../utils/discounts';
import BookingSidebar from '../components/property/BookingSidebar';
import { amenityIconFor, isPublishableAmenity } from '@/lib/amenityIcons';
import {
  trackBookingStarted,
  trackPropertyViewed,
} from '../lib/mixpanel/track';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const libraries: any = ['places'];

interface Unit {
  id: string;
  name: string;
  description: string;
  bedroom_count: number;
  bathroom_count: number;
  kitchen_count: number;
  living_room_count: number;
  max_guests: number;
  count: number;
  price_per_night: string;
  caution_fee: string;
  amenities: Amenity[];
  availability: string[];
  is_verified: boolean;
  is_whole_property: boolean;
  media: {
    fileUrl: string;
    url: string;
  }[];
  seating_capacity?: number;
  standing_capacity?: number;
  car_park_spaces?: number;
  power_supply_provision?: string;
  additional_fees?: Array<{
    id: string;
    fee_name: string;
    fee_amount: number | string;
    is_mandatory: boolean;
  }>;
  meta: {
    total_reviews: number;
    average_rating: number;
  };
  property_id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * What the API actually returns. The previous declaration described a nested
 * `{ amenity: { name } }` row that the FastAPI serializer has not produced
 * since the rewrite — which is why every amenity read here resolved to
 * undefined and the sections rendered blank or not at all.
 */
interface Amenity {
  id: string;
  name: string;
}

interface Property {
  id: string;
  name: string;
  description: string;
  address: string | null;
  street_number?: string | null;
  street_name?: string | null;
  postal_code?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  // Server gates the precise location for non-booked viewers. APPROXIMATE
  // means address fields are blanked and lat/lng are deterministically fuzzed
  // within ~400m. See services/properties/access.py.
  location_visibility?: 'FULL' | 'APPROXIMATE';
  property_type: string;
  is_verified: boolean;
  is_pet_allowed: boolean;
  is_party_allowed: boolean;
  rules: string | null;
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
    id?: string;
    name: string;
    image?: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  // Best long-stay / extension offer anywhere on the listing, resolved
  // server-side across its units. Each unit also carries its own
  // `effective_*_discount_policy`, which is what <UnitDetailsList> shows —
  // this one is the headline for a listing whose units differ.
  discount_summary?: {
    long_stay: DiscountSummary | null;
    extension: DiscountSummary | null;
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
  const [billingDuration, setBillingDuration] = useState<number>(1);
  const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
  const [billingUnit, setBillingUnit] = useState<
    'PER_DAY' | 'PER_HOUR' | 'PER_HALF_DAY'
  >('PER_DAY');
  const [getBookingQuote, { data: quoteResponse, isLoading: isQuoteLoading }] =
    useGetBookingQuoteMutation();
  const quoteData = quoteResponse?.data;
  const [showConfirmBooking] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<number>(1);
  const { setBooking } = useContext(BookingContext) || {};
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllPropertyAmenities, setShowAllPropertyAmenities] =
    useState(false);
  const displayCount = useMediaQuery('(min-width:600px)') ? 8 : 4;

  // Filtered once. The section guard, the rendered list and the "Show all N"
  // count must agree — otherwise a listing whose only amenities are
  // unpublishable renders an empty box promising something, and the count
  // offers to reveal rows that will never appear.
  const publishableAmenities = (propertyDetail?.amenities ?? []).filter(
    (amenity) => isPublishableAmenity(amenity?.name)
  );
  const auth = useAppSelector((state) => state.root.auth);
  const isAuthenticated = auth.isAuthenticated && !!auth.token;
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const unitAvailability: AvailabilityResponse[] =
    (availabilityResult?.data as AvailabilityResponse[]) || [];

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
      if (data?.data?.units && data?.data?.units?.length > 0) {
        setValue(data?.data?.units[0]?.id);
      }
    }
  }, [isLoading, data]);

  useEffect(() => {
    if (!propertyDetail?.id) return;
    const firstUnit = propertyDetail.units?.[0];
    const nightly = Number(firstUnit?.price_per_night);
    trackPropertyViewed({
      property_id: propertyDetail.id,
      property_type: propertyDetail.property_type,
      location: [propertyDetail.city, propertyDetail.state]
        .filter(Boolean)
        .join(', '),
      nightly_price: Number.isFinite(nightly) ? nightly : undefined,
      agent_id: propertyDetail.agent?.id,
    });
  }, [propertyDetail?.id]);

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
        setSelectedFeeIds([]);
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

  // A venue is hired by the day: the guest picks ONE date plus a duration, and
  // the range the API holds is derived from both. A per-day hire runs for
  // `billingDuration` days; hourly and half-day hires are a single day, which
  // is what their duration counts slots inside.
  //
  // The calendar hands back check-out === check-in for a venue, so without
  // this the payload carried a zero-length range — `end_date` must be after
  // `start_date`, so the API rejected it outright, and `nights` came out 0 so
  // the Reserve button refused to submit in the first place. No guest could
  // book an event centre at all.
  const isEventCentre = propertyDetail?.property_type === 'EVENT_CENTRE';
  const eventDays = isEventCentre
    ? billingUnit === 'PER_DAY'
      ? Math.max(1, billingDuration)
      : 1
    : 0;
  const addDays = (d: Date, n: number) => {
    const next = new Date(d);
    next.setDate(next.getDate() + n);
    return next;
  };
  const effectiveCheckOut =
    isEventCentre && checkInDate ? addDays(checkInDate, eventDays) : checkOutDate;

  // How many slots one billing unit allows. Mirrors the API, which refuses
  // more than 24 hours or 2 half-days inside a single event day.
  const maxDurationFor = (u: string) =>
    u === 'PER_HOUR' ? 24 : u === 'PER_HALF_DAY' ? 2 : 30;

  const handleBillingUnitChange = (
    u: 'PER_DAY' | 'PER_HOUR' | 'PER_HALF_DAY'
  ) => {
    setBillingUnit(u);
    // Switching "10 days" to half-days would otherwise ask for 10 half-days in
    // one day, which the API refuses — clamp instead of sending a doomed quote.
    setBillingDuration((d) => Math.min(Math.max(1, d), maxDurationFor(u)));
  };

  useEffect(() => {
    if (
      checkInDate &&
      effectiveCheckOut &&
      value &&
      adults > 0 &&
      selectedUnits > 0
    ) {
      getBookingQuote({
        unit_id: value,
        start_date: formatDateLocal(checkInDate),
        end_date: formatDateLocal(effectiveCheckOut),
        guests_count: adults + children,
        unit_count: selectedUnits,
        selected_additional_fees:
          selectedFeeIds.length > 0 ? selectedFeeIds : undefined,
        // Without these the estimate was priced per night while the booking
        // was charged per hour or day — the guest was quoted one number and
        // billed another.
        ...(isEventCentre && {
          billing_unit: billingUnit,
          billing_duration: billingDuration,
        }),
      });
    }
  }, [
    checkInDate,
    effectiveCheckOut,
    value,
    adults,
    children,
    selectedUnits,
    selectedFeeIds,
    isEventCentre,
    billingUnit,
    billingDuration,
    getBookingQuote,
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
    (propertyDetail?.media?.[0] as any)?.mediaUrl ||
    propertyDetail?.media?.[0]?.fileUrl ||
    '';

  // `total_payable` is typed `string | number` because the API returns money
  // as strings; every consumer here needs a number (arithmetic, and the
  // `number` fields on BookingDetails / MobileBookingSummary). Coerce once at
  // the source rather than at each call site.
  const finalTotalFee = quoteData
    ? Number(quoteData.total_payable)
    : basePrice * nights * selectedUnits + cautionFeePercentage;
  const finalDiscount = quoteData?.discount_amount || 0;
  const finalCautionFee = quoteData
    ? quoteData.caution_fee
    : cautionFeePercentage;

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
    if (isEventCentre) {
      // For a venue the held days come from the duration, not from a second
      // calendar click — check-out equals check-in here, which would otherwise
      // read as zero nights and block the Reserve button.
      setNights(checkInDate ? eventDays : 0);
      return;
    }
    if (checkInDate && checkOutDate) {
      setNights(calculateNights(checkInDate, checkOutDate));
    }
  }, [checkInDate, checkOutDate, isEventCentre, eventDays]);

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
    // Walks every day the booking will actually hold — for a venue that is the
    // derived range, not the single date the calendar shows.
    const lastHeldDate = effectiveCheckOut ?? checkOutDate;
    const tempDate = new Date(checkInDate);
    while (tempDate < lastHeldDate) {
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
      check_out_date: formatDateLocal(effectiveCheckOut),
      adults,
      children,
      pets,
      nights,
      base_price: basePrice,
      caution_fee: finalCautionFee,
      total_charging_fee: Number(finalTotalFee),
      // Fee-free cost (no gateway processing fee). Charged when paying by wallet.
      total_price: quoteData
        ? Number(quoteData.total_price)
        : basePrice * nights * selectedUnits + cautionFeePercentage,
      discount_amount: finalDiscount,
      unit_image: unitImage || '',
      unit_count: selectedUnits,
      unit_id: activeUnit?.id || '',
      // Set on `window` during signin/signup rather than threaded through
      // props. Typed inline instead of `as any` so a rename is caught.
      should_show_payout_nudge: (
        window as Window & { shouldShowPayoutNudge?: boolean }
      ).shouldShowPayoutNudge,
      booking_mode: propertyDetail?.booking_mode || 'INSTANT',
      owner: propertyDetail?.agent,
      ...(isEventCentre && {
        billing_unit: billingUnit,
        billing_duration: billingDuration,
      }),
      selected_additional_fees: selectedFeeIds,
    };

    if (setBooking) {
      setBooking(bookingDetails);
    }

    trackBookingStarted({
      property_id: id || propertyDetail?.id,
      check_in: bookingDetails.check_in_date,
      check_out: bookingDetails.check_out_date,
      guests: adults + children,
      total_amount: totalChargingFee,
    });

    if (!isAuthenticated) {
      navigate('/login?redirect=/confirm-booking');
      return;
    }

    navigate('/confirm-booking');
  };

  const handleToggleFee = (feeId: string) => {
    setSelectedFeeIds((prev) =>
      prev.includes(feeId)
        ? prev.filter((id) => id !== feeId)
        : [...prev, feeId]
    );
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

  // ── Presentation-only derivations ────────────────────────────────────────
  const unitCount = propertyDetail?.units?.length ?? 0;
  const fallbackImage =
    (propertyDetail?.media?.[0] as any)?.mediaUrl ||
    propertyDetail?.media?.[0]?.fileUrl ||
    '';

  const navItems = [
    { id: 'spaces', label: unitCount > 1 ? `Spaces (${unitCount})` : 'The space' },
    ...(publishableAmenities.length > 0 ? [{ id: 'features', label: 'Features' }] : []),
    { id: 'house-rules', label: 'Good to know' },
    { id: 'location', label: 'Location' },
    ...(propertyDetail?.id ? [{ id: 'reviews', label: 'Reviews' }] : []),
  ];

  // House rules come from the listing. The old phone accordion hard-coded
  // check-in/out times and "No smoking" for every property and ignored
  // `rules` entirely, so a phone guest never saw what the host had written.
  const policyBlocks: { title: string; icon: React.ReactNode; body: React.ReactNode }[] = [
    {
      title: isEventCentre ? 'Venue rules' : 'House rules',
      icon: <GavelIcon />,
      body: (
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
          {propertyDetail?.rules || 'No house rules provided'}
        </Typography>
      ),
    },
    {
      title: 'Safety & property',
      icon: <ShieldIcon />,
      body: (
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Please follow all safety guidelines and report any property or safety
          concerns.
        </Typography>
      ),
    },
    {
      title: 'Cancellation policy',
      icon: <EventBusyIcon />,
      body: (
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          More than 72 hours before check-in: 80% refund
          <br />
          Less than 72 hours before check-in / no-show: 50% refund
        </Typography>
      ),
    },
  ];

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
      <Box sx={{ color: INK, pt: { xs: 8, md: 10 } }}>
        {/* "Shared by {host}" when the guest came from a host's page (?rs=@handle). */}
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
          <AttributionStrip />
        </Container>

        <ApartmentHero
          // Remount per unit so the swipe gallery returns to its first photo.
          key={activeUnit?.id ?? 'property'}
          images={propertyDetail?.media || []}
          title={propertyDetail?.name}
          unit={activeUnit || null}
        >
          <PropertyHeader
            name={propertyDetail?.name}
            city={propertyDetail?.city}
            state={propertyDetail?.state}
            propertyType={propertyDetail?.property_type}
            isVerified={propertyDetail?.is_verified}
            rating={propertyDetail?.meta?.average_rating}
            reviewCount={propertyDetail?.meta?.total_reviews}
          />
        </ApartmentHero>

        <SectionNav items={navItems} />

      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 2, md: 4 },
          pt: { xs: 3, md: 6 },
          // Clears the floating mobile booking bar (+ iOS home indicator).
          pb: { xs: 'calc(120px + env(safe-area-inset-bottom))', md: 8 },
        }}
      >
        <Grid container spacing={{ xs: 0, md: 6 }}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 6, md: 8 } }}>
              <Box>
                <PropertyHostInfo agent={propertyDetail?.agent} />
                <Box sx={{ mt: 2 }}>
                  <PropertyQuickInfo
                    propertyType={undefined}
                    isPetAllowed={propertyDetail?.is_pet_allowed}
                    isPartyAllowed={propertyDetail?.is_party_allowed}
                  />
                </Box>
                {/* Best deal anywhere on a multi-unit listing; each unit also
                    carries its own offer. */}
                {unitCount > 1 && (
                  <DiscountOffers
                    longStaySummary={propertyDetail?.discount_summary?.long_stay}
                    extensionSummary={propertyDetail?.discount_summary?.extension}
                    sx={{ pt: 2 }}
                  />
                )}
              </Box>

              <Box id="spaces" sx={{ scrollMarginTop: '140px' }}>
                <UnitDetailsList
                  units={propertyDetail?.units}
                  activeTab={value}
                  onTabChange={setValue}
                  showFullDescription={showFullDescription}
                  setShowFullDescription={setShowFullDescription}
                  showAllAmenities={showAllAmenities}
                  setShowAllAmenities={setShowAllAmenities}
                  displayCount={displayCount}
                  propertyType={propertyDetail?.property_type}
                  fallbackImage={fallbackImage}
                  formatPrice={formatPrice}
                />
              </Box>

              {publishableAmenities.length > 0 && (
                <Box id="features" sx={{ scrollMarginTop: '140px' }}>
                  <SectionHeading eyebrow="Shared by every space" title="What this place offers" />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {publishableAmenities
                      .slice(0, showAllPropertyAmenities ? undefined : displayCount + 4)
                      .map((amenity) => {
                        const AmenityIcon = amenityIconFor(amenity.name);
                        return (
                          <Box
                            key={amenity.id ?? amenity.name}
                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, pl: 1.25, pr: 2, py: 1.1, borderRadius: 999, bgcolor: '#fff', fontSize: '0.9375rem', fontWeight: 500, boxShadow: '0 1px 2px rgba(25,25,25,0.06)' }}
                          >
                            <AmenityIcon sx={{ fontSize: 20, color: TEAL }} />
                            {amenity.name}
                          </Box>
                        );
                      })}
                    {publishableAmenities.length > displayCount + 4 && (
                      <Box
                        component="button"
                        type="button"
                        onClick={() => setShowAllPropertyAmenities(!showAllPropertyAmenities)}
                        sx={{ all: 'unset', cursor: 'pointer', px: 2, py: 1.1, borderRadius: 999, bgcolor: BRAND, color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}
                      >
                        {showAllPropertyAmenities ? 'Show less' : `+${publishableAmenities.length - (displayCount + 4)} more`}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* `id="house-rules"` is the target of the booking sidebar's
                  "you agree to the House Rules" link. One wrapper, one layout —
                  the old accordion/grid pair were CSS-hidden siblings, which is
                  why the id had to be hoisted above both. */}
              <Box id="house-rules" sx={{ scrollMarginTop: '140px' }}>
                <SectionHeading eyebrow="Before you book" title="Good to know" />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                  {policyBlocks.map((block, i) => (
                    <Box key={block.title} sx={{ bgcolor: '#fff', borderRadius: '28px', p: 3, boxShadow: '0 1px 2px rgba(25,25,25,0.06)' }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: BRAND, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        {block.icon}
                      </Box>
                      <Typography sx={{ fontFamily: SERIF, fontWeight: 600, fontSize: '1.25rem', mb: 1 }}>{block.title}</Typography>
                      {block.body}
                    </Box>
                  ))}
                </Box>
              </Box>

            {/* Location Section */}
            <Box id="location" sx={{ scrollMarginTop: '140px' }}>
              <SectionHeading eyebrow="The neighbourhood" title="Where you'll be" />

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
                    }}
                  >
                    <LocationOnIcon sx={{ color: 'primary.main' }} />
                    {/* Address only shown when the server returned FULL visibility. */}
                    {propertyDetail?.location_visibility === 'FULL' &&
                      propertyDetail?.address && (
                        <>{propertyDetail.address}, </>
                      )}
                    {propertyDetail?.city}, {propertyDetail?.state}
                  </Typography>
                  {propertyDetail?.location_visibility === 'APPROXIMATE' && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: 'block' }}
                    >
                      Approximate location. The exact address is shared with you
                      after your booking is confirmed.
                    </Typography>
                  )}
                </Box>

                {/* Map Container */}
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 260, md: 400 },
                    borderRadius: '32px',
                    overflow: 'hidden',
                    bgcolor: 'action.hover',
                    '& .leaflet-container': {
                      height: '100%',
                      width: '100%',
                      zIndex: 1,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {isLoaded ? (
                      propertyDetail?.latitude && propertyDetail?.longitude ? (
                        <GoogleMap
                          mapContainerStyle={{ height: '100%', width: '100%' }}
                          // 'cooperative' = one finger scrolls the page, two move
                          // the map. The default traps a phone user's scroll the
                          // moment their thumb lands on the map.
                          options={{
                            gestureHandling: 'cooperative',
                            streetViewControl: false,
                            mapTypeControl: false,
                          }}
                          center={{
                            lat: propertyDetail.latitude,
                            lng: propertyDetail.longitude,
                          }}
                          zoom={
                            propertyDetail?.location_visibility ===
                            'APPROXIMATE'
                              ? 14
                              : 15
                          }
                        >
                          {propertyDetail?.location_visibility ===
                          'APPROXIMATE' ? (
                            // Approximate: show a soft circle (~500m) instead of an exact pin.
                            // The fuzz happens server-side; we just visualise the imprecision.
                            <Circle
                              center={{
                                lat: propertyDetail.latitude,
                                lng: propertyDetail.longitude,
                              }}
                              radius={500}
                              options={{
                                strokeColor: '#028090',
                                strokeOpacity: 0.6,
                                strokeWeight: 2,
                                fillColor: '#028090',
                                fillOpacity: 0.18,
                                clickable: false,
                              }}
                            />
                          ) : (
                            <Marker
                              position={{
                                lat: propertyDetail.latitude,
                                lng: propertyDetail.longitude,
                              }}
                              onClick={() => setShowInfoWindow(true)}
                            />
                          )}
                          {showInfoWindow &&
                            propertyDetail?.location_visibility === 'FULL' && (
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
                            {propertyDetail?.location_visibility === 'FULL' &&
                            propertyDetail?.address ? (
                              <>
                                Map view not available
                                <br />
                                {propertyDetail.address}
                                <br />
                                {propertyDetail?.city}, {propertyDetail?.state}
                              </>
                            ) : propertyDetail?.city ||
                              propertyDetail?.state ? (
                              <>
                                Map view not available
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
              totalChargingFee={Number(finalTotalFee)}
              cautionFeePercentage={finalCautionFee}
              quoteData={quoteData}
              isQuoteLoading={isQuoteLoading}
              handleConfirmBookingClick={handleConfirmBookingClick}
              formatPrice={formatPrice}
              propertyType={propertyDetail?.property_type}
              additionalFees={activeUnit?.additional_fees}
              selectedFeeIds={selectedFeeIds}
              onToggleFee={handleToggleFee}
              rules={propertyDetail?.rules}
              billingUnit={billingUnit}
              setBillingUnit={handleBillingUnitChange}
              billingDuration={billingDuration}
              setBillingDuration={setBillingDuration}
              onGuestsChange={(total) => {
                setAdults(total);
                setChildren(0);
              }}
              maxGuests={activeUnit?.max_guests || 1}
              guests={adults + children}
              bookingMode={propertyDetail?.booking_mode || 'INSTANT'}
              propertyName={propertyDetail?.name}
              propertyId={id}
              propertyCity={propertyDetail?.city}
            />
          </Grid>
        </Grid>

        {/* Reviews Section */}
        {propertyDetail?.id && (
          <Box
            id="reviews"
            sx={{ mt: { xs: 6, md: 10 }, scrollMarginTop: '140px', bgcolor: '#fff', borderRadius: { xs: '32px', md: '40px' }, p: { xs: 2.5, md: 5 }, '& > div': { mt: '0 !important' } }}
          >
            <ReviewsList propertyId={propertyDetail.id.toString()} />
          </Box>
        )}
      </Container>
      </Box>
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
        // The server's quote, not the local nightly arithmetic: the mobile bar
        // was the one surface still showing `basePrice * nights + caution`,
        // which ignores the discount, the additional fees and the venue's own
        // hourly rate — a different total from the one the desktop sidebar and
        // the checkout both show.
        totalPrice={Number(finalTotalFee)}
        onGuestsChange={(total) => {
          setAdults(total);
          setChildren(0);
        }}
        formatPrice={formatPrice}
        onBookClick={handleConfirmBookingClick}
        unitAvailability={unitAvailability}
        quoteData={quoteData}
        isQuoteLoading={isQuoteLoading}
        propertyType={propertyDetail?.property_type}
        additionalFees={activeUnit?.additional_fees}
        selectedFeeIds={selectedFeeIds}
        onToggleFee={handleToggleFee}
        billingUnit={billingUnit}
        setBillingUnit={handleBillingUnitChange}
        billingDuration={billingDuration}
        setBillingDuration={setBillingDuration}
        selectedUnits={selectedUnits}
        onUnitsChange={setSelectedUnits}
        maxUnits={activeUnit?.count || 1}
        bookingMode={propertyDetail?.booking_mode || 'INSTANT'}
        cautionFeePercentage={Number(finalCautionFee)}
        propertyName={propertyDetail?.name}
        propertyId={id}
        propertyCity={propertyDetail?.city}
        unitName={activeUnit?.name}
      />
      <ToastContainer position="bottom-right" />
    </PageLayout>
  );
};

export default PropertyDetails;
