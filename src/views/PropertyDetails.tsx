'use client';

import React, { useState, useRef, useEffect, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useMediaQuery } from '@mui/material';

import { Link } from '@/lib/router';
import { Breadcrumbs } from '@mui/material';
import {
  GoogleMap,
  Marker,
  Circle,
  useJsApiLoader,
  InfoWindow,
} from '@react-google-maps/api';
import { LocationOn as LocationOnIcon } from '@mui/icons-material';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

import { Box, Grid, Container, Typography, Skeleton } from '@mui/material';
import ApartmentHero from './ApartmentHero';
import AttributionStrip from '../components/links/AttributionStrip';
import ReviewsList from '../components/property/ReviewsList';
import { useNavigate, useParams, useLocation } from '@/lib/router';
import PageLayout from '../components/pagelayout';
import {
  useGetEventSlotsQuery,
  useGetPropertyByIdQuery,
  useLazyGetUnitAvailabilityQuery,
} from '../api/propertiesApi';
import {
  BillingUnit,
  headlineUnitWord,
  isEventCentre as isEventCentreType,
  offeredBillingUnits,
  rateFor,
} from '../utils/eventCentre';
import type { VenueHireState } from '../components/property/VenueHirePicker';
import { BookingContext } from '../context/UserBooking';
import { useGetBookingQuoteMutation } from '../api/booking';
import { useAppSelector } from '../hooks';
import { Icon } from '@iconify/react';
import MobileBookingSummary from '../components/property/MobileBookingSummary';
import PropertyHostInfo from '../components/property/PropertyHostInfo';
import PropertyQuickInfo from '../components/property/PropertyQuickInfo';
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
  // Event-centre hall: rate card, hire hours and same-day rule.
  event_price_per_day?: number | null;
  event_price_per_half_day?: number | null;
  event_price_per_hour?: number | null;
  opening_time?: string | null;
  closing_time?: string | null;
  half_day_windows?: Array<{ name: string; start: string; end: string }>;
  allows_multiple_bookings_per_day?: boolean;
  offered_billing_units?: string[];
  headline_billing_unit?: string | null;
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
  const [billingUnit, setBillingUnit] = useState<BillingUnit>('PER_DAY');
  // An hourly hire's start time, or a half-day hire's session name.
  const [eventStartTime, setEventStartTime] = useState<string | null>(null);
  const [halfDayWindow, setHalfDayWindow] = useState<string | null>(null);
  const [
    getBookingQuote,
    { data: quoteResponse, isLoading: isQuoteLoading, error: quoteError, reset: resetQuote },
  ] = useGetBookingQuoteMutation();
  const quoteData = quoteError ? undefined : quoteResponse?.data;
  const [showConfirmBooking] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<number>(1);
  const { setBooking } = useContext(BookingContext) || {};
  const [showAllAmenities, setShowAllAmenities] = useState(false);
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
        // A hall starts on the way it is usually hired (its headline rate).
        const offered = offeredBillingUnits(currentUnit);
        setBillingUnit(
          (currentUnit.headline_billing_unit as BillingUnit | null) ??
            offered[0] ??
            'PER_DAY'
        );
        setBillingDuration(1);
        setEventStartTime(null);
        setHalfDayWindow(null);
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
  const isEventCentre = isEventCentreType(propertyDetail?.property_type);
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

  // A different way of hiring the hall starts the choice over: an hourly
  // start time means nothing to a half-day session, and vice versa.
  const handleBillingUnitChange = (u: BillingUnit) => {
    setBillingUnit(u);
    setBillingDuration(1);
    setEventStartTime(null);
    setHalfDayWindow(null);
  };

  // Free times on the chosen event date, from the same engine that accepts
  // the booking.
  const { data: slotsResponse, isFetching: slotsLoading } = useGetEventSlotsQuery(
    {
      propertyId: String(propertyDetail?.id ?? ''),
      unitId: String(value ?? ''),
      date: checkInDate ? formatDateLocal(checkInDate) : '',
    },
    { skip: !isEventCentre || !checkInDate || !value || !propertyDetail?.id }
  );
  const eventSlots = slotsResponse?.data;

  // A slot taken since it was picked clears itself rather than leaving a
  // choice the booking would refuse.
  useEffect(() => {
    if (!eventSlots) return;
    if (eventStartTime && !eventSlots.hourly_starts.some((s) => s.start === eventStartTime)) {
      setEventStartTime(null);
    }
    if (
      halfDayWindow &&
      !eventSlots.half_day_windows.some((w) => w.name === halfDayWindow && w.available)
    ) {
      setHalfDayWindow(null);
    }
    const startSlot = eventSlots.hourly_starts.find((s) => s.start === eventStartTime);
    if (billingUnit === 'PER_HOUR' && startSlot && billingDuration > startSlot.max_hours) {
      setBillingDuration(startSlot.max_hours);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSlots]);

  // Everything the API needs to place the hire.
  const hireComplete =
    !isEventCentre ||
    (billingUnit === 'PER_DAY'
      ? billingDuration >= 1
      : billingUnit === 'PER_HOUR'
        ? !!eventStartTime && billingDuration >= 1
        : !!halfDayWindow);

  const quoteProblem = (() => {
    if (!quoteError) return null;
    const detail = (quoteError as { data?: { detail?: unknown } })?.data?.detail;
    return typeof detail === 'string' ? detail : 'This time can\'t be booked.';
  })();

  const venueHire: VenueHireState | undefined = isEventCentre
    ? {
        offered: offeredBillingUnits(activeUnit),
        billingUnit,
        setBillingUnit: handleBillingUnitChange,
        billingDuration,
        setBillingDuration: (n: number) => setBillingDuration(Math.max(1, n)),
        eventStartTime,
        setEventStartTime: (t: string | null) => {
          setEventStartTime(t);
          setBillingDuration(1);
        },
        halfDayWindow,
        setHalfDayWindow,
        slots: eventSlots,
        slotsLoading,
        rate: rateFor(activeUnit, billingUnit),
        problem: quoteProblem,
      }
    : undefined;

  // RTK Query's mutation `reset` changes identity every time the mutation
  // fires (it closes over the request id). As an effect dependency it re-ran
  // the quote effect after every quote, which fired another quote: an endless
  // stream of POST /bookings/quote as soon as dates were picked. Read it
  // through a ref instead.
  const resetQuoteRef = useRef(resetQuote);
  resetQuoteRef.current = resetQuote;
  // Keyed on date strings, not Date objects: a venue's check-out is derived
  // with addDays, a new Date on every render, which looped the same way.
  const quoteStartDate = formatDateLocal(checkInDate);
  const quoteEndDate = formatDateLocal(effectiveCheckOut);

  useEffect(() => {
    if (!hireComplete) {
      // An unfinished hire has no price; don't leave the last one showing.
      resetQuoteRef.current();
      return;
    }
    if (
      quoteStartDate &&
      quoteEndDate &&
      value &&
      adults > 0 &&
      selectedUnits > 0
    ) {
      getBookingQuote({
        unit_id: value,
        start_date: quoteStartDate,
        end_date: quoteEndDate,
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
          event_start_time: billingUnit === 'PER_HOUR' ? eventStartTime : null,
          half_day_window_name: billingUnit === 'PER_HALF_DAY' ? halfDayWindow : null,
        }),
      });
    }
  }, [
    hireComplete,
    eventStartTime,
    halfDayWindow,
    quoteStartDate,
    quoteEndDate,
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
      // A venue hire comes back as it was, not reset to a full day.
      if (preservedState.billingUnit) setBillingUnit(preservedState.billingUnit);
      if (typeof preservedState.billingDuration === 'number')
        setBillingDuration(preservedState.billingDuration);
      if (preservedState.eventStartTime) setEventStartTime(preservedState.eventStartTime);
      if (preservedState.halfDayWindow) setHalfDayWindow(preservedState.halfDayWindow);

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

    if (!checkInDate || (!checkOutDate && !isEventCentre)) {
      toast.error(
        isEventCentre
          ? 'Please choose your event date.'
          : 'Please select check-in and check-out dates.'
      );
      return;
    }

    if (isEventCentre && !hireComplete) {
      toast.error(
        billingUnit === 'PER_HOUR'
          ? 'Choose a start time for your event.'
          : 'Choose a half-day session for your event.'
      );
      return;
    }

    if (isEventCentre && (quoteProblem || !quoteData)) {
      toast.error(quoteProblem ?? 'Still checking the price for this time. Try again in a moment.');
      return;
    }

    // Check if selected nights are blocked
    // A guest checking in on Jan 1 and out on Jan 5 occupies nights of 1, 2, 3, 4.
    // Walks every day the booking will actually hold — for a venue that is the
    // derived range, not the single date the calendar shows.
    const lastHeldDate = (effectiveCheckOut ?? checkOutDate) as Date;
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
      // A venue's rate for the hire chosen (per day, session or hour), so the
      // checkout's "rate x count x halls" adds up.
      base_price: isEventCentre ? rateFor(activeUnit, billingUnit) : basePrice,
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
        // The quote is the server's placement of the hire: its billing unit,
        // its duration and the times it holds.
        billing_unit: quoteData?.billing_unit ?? billingUnit,
        billing_duration: quoteData?.billing_duration ?? billingDuration,
        event_start_time: quoteData?.event_start_time ?? null,
        event_end_time: quoteData?.event_end_time ?? null,
        half_day_window_name: quoteData?.half_day_window_name ?? null,
        is_venue: true,
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

        {/* "Shared by {host}" when the guest came from a host's page (?rs=@handle). */}
        <AttributionStrip />

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
              isPartyAllowed={propertyDetail?.is_party_allowed}
            />

            {/* Listing-level headline, shown only on multi-unit listings.
                Every unit tab below already carries the offer that applies to
                it, so on a single-unit listing this would be the same sentence
                twice. On a multi-unit one it is genuinely different
                information: the best deal on the property, with "on selected
                units" attached when the units disagree. */}
            {(propertyDetail?.units?.length ?? 0) > 1 && (
              <DiscountOffers
                longStaySummary={propertyDetail?.discount_summary?.long_stay}
                extensionSummary={propertyDetail?.discount_summary?.extension}
                sx={{ mb: 3 }}
              />
            )}

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
              propertyType={propertyDetail?.property_type}
            />

            {/*
              Property amenities. This block was commented out during the
              App Router port and never restored, so listings carrying six or
              more amenities showed none of them. Reads the flat {id, name}
              shape the API actually returns — the commented version used
              `amenity.amenity.name`, which would have rendered blanks even
              once uncommented.
            */}
            {publishableAmenities.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom fontWeight={500}>
                  What this place offers
                </Typography>
                <Grid container spacing={1.5}>
                  {publishableAmenities
                    .slice(0, showAllAmenities ? undefined : displayCount)
                    .map((amenity) => {
                      const Icon = amenityIconFor(amenity.name);
                      return (
                        <Grid
                          item
                          xs={6}
                          sm={4}
                          md={3}
                          key={amenity.id ?? amenity.name}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              p: 1.5,
                              borderRadius: 1,
                              bgcolor: 'background.default',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <Icon sx={{ fontSize: 20, color: '#028090' }} />
                            <Typography
                              variant="body2"
                              noWrap
                              title={amenity.name}
                            >
                              {amenity.name}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                </Grid>

                {publishableAmenities.length > displayCount && (
                  <Button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    sx={{
                      mt: 1.5,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {showAllAmenities
                      ? 'Show less'
                      : `Show all ${publishableAmenities.length} amenities`}
                  </Button>
                )}
              </Box>
            )}

            {/*
              Things you should know

              `id="house-rules"` is the target the booking sidebar's "you agree
              to the House Rules" link scrolls to. It did not exist anywhere in
              the codebase, so `getElementById('house-rules')` returned null and
              the optional chaining on `?.scrollIntoView()` swallowed it — the
              link did nothing at all, silently, with no console error.

              It belongs on this shared wrapper rather than on either rules
              block. The two are CSS-hidden siblings — a mobile accordion at
              `display: {xs:'block', md:'none'}` and a desktop grid at
              `{xs:'none', md:'flex'}` — so an id on one of them would resolve
              to a `display: none` element at the other breakpoint and scroll
              nowhere. Duplicating the id across both would be invalid HTML and
              `getElementById` would return whichever came first in the DOM,
              which is the mobile one, hidden on desktop.
            */}
            <Box id="house-rules" sx={{ mb: 4, scrollMarginTop: '80px' }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={500}
              >
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
                        Please follow all safety guidelines and report any
                        property or safety concerns
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
                      More than 72 hours before check-in: 80% refund Less than
                      72 hours before check-in/No-Show: 50% refund
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
                  <Typography
                    variant="h6"
                    component="h6"
                    gutterBottom
                    fontWeight={500}
                  >
                    House Rules
                  </Typography>
                  {propertyDetail?.rules ? (
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: 'pre-line' }}
                      >
                        {propertyDetail?.rules}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: 'pre-line' }}
                      >
                        No house rules provided
                      </Typography>
                    </Box>
                  )}
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
                        Please follow all safety guidelines and report any
                        property or safety concerns
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
                      More than 72 hours before check-in: 80% refund <br /> Less than
                      72 hours before check-in/No-Show: 50% refund
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Location Section */}
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                fontWeight={500}
              >
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
                                    / {isEventCentre
                                      ? headlineUnitWord(propertyDetail.units?.[0])
                                      : 'night'}
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
              venueHire={venueHire}
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
        venueHire={venueHire}
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
