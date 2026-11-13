'use client';

import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from '@/lib/router';
import { toast } from 'react-toastify';
import {
  usePostPaymentMutation,
  useGetGatewayConfigQuery,
  usePayWithWalletMutation,
} from '../api/paymentApi';
import { useGetProfileQuery } from '../api/profileApi';
import { useHandleAuthError } from '../hooks/useHandleAuthError';
import { BookingContext } from '../context/UserBooking';
import {
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
} from '../api/booking';
import { useLazyGetUnitAvailabilityQuery, useGetPropertyByIdQuery } from '../api/propertiesApi';
import PageLayout from '../components/pagelayout/index';
import usePageTitle from '../hooks/usePageTitle';
import QuickProfileComplete from '../components/booking/QuickProfileComplete';
import PaymentSuccessView from '../components/booking/PaymentSuccessView';
import PaymentPendingView from '../components/booking/PaymentPendingView';
import PaymentMethodSelection from '../components/booking/PaymentMethodSelection';
import BookingSummary from '../components/booking/BookingSummary';
import { getStoredReferralCode } from '../utils/referral';
import {
  setPayoutNudgePendingForBooking,
  readShouldShowPayoutNudgeFromCreateBooking,
  isPayoutNudgeModalDismissedForBooking,
  isPayoutNudgePendingForBooking,
} from '../utils/payoutNudge';
import PayoutNudgeModal from '../components/booking/PayoutNudgeModal';
import { trackBookingDetailsSubmitted } from '../lib/mixpanel/track';
import { describeHire } from '../utils/eventCentre';
import { Icon } from '@iconify/react';

declare global {
  interface Window {
    MonnifySDK: any;
    PaystackPop: any;
  }
}

interface BookingPayload {
  unit_id: string;
  start_date: string;
  end_date: string;
  guests_count: number;
  unit_count: number;
  total_price: number;
  referral_code?: string;
  billing_unit?: string;
  billing_duration?: number;
}

interface Wallet {
    balance: string;
    createdAt: string;
    currency: string;
    id: string;
    pendingCash: string;
    updatedAt: string;
    userId: string;
}

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


const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking: contextBooking } = useContext(BookingContext) || {};
  
  // Extensions and resume-payment flows (BookingHistory "Pay" button on an
  // approved Request-to-Book booking) both pass their context through location
  // state. The in-memory BookingContext expires after 12h, so when an owner
  // takes longer than that to approve, contextBooking is gone — fall back to
  // the navigation state if it carries a bookingContext.
  const stateBookingContext = location.state?.bookingContext;
  const isExtension = stateBookingContext?.isExtension;
  const booking = stateBookingContext ?? contextBooking;
  const extensionTransactionRef = stateBookingContext?.transaction_ref;
  const resumeBookingId: string | undefined = location.state?.existingBookingId;
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [showProfileComplete, setShowProfileComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [boookingStatus, setBookingStatus] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralLocked, setReferralLocked] = useState(false);
  const [payoutNudgeOpen, setPayoutNudgeOpen] = useState(false);
  const [disablePaymentOption,setDisablePaymentOption] = useState(false);

  // Auto-populate referral code from URL ?ref= or localStorage (captured by
  // ScrollToTop on a previous navigation). When sourced this way, the input
  // is locked so the user can't tamper with it.
  useEffect(() => {
    const urlRef = new URLSearchParams(location.search).get('ref');
    const storedRef = urlRef ? urlRef.trim().toUpperCase() : getStoredReferralCode();
    if (storedRef && !referralCode) {
      setReferralCode(storedRef);
      setReferralLocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useGetProfileQuery();
  
  const { data: propertyData } = useGetPropertyByIdQuery(String(booking?.id), { skip: !booking?.id });
  const propertyDetail = propertyData?.data;

  const [postPayment] = usePostPaymentMutation();
  const [paymentGateway, setPaymentGateway] = useState<string>('');
  const { data: gatewayConfigResponse } = useGetGatewayConfigQuery(
    paymentGateway,
    {
      skip: !paymentGateway,
    }
  );

  const dismissPayoutNudge = () => {
    setPayoutNudgeOpen(false);
  };

  useEffect(() => {
    if(Number(wallet?.balance ?? null) <= 0){
     setDisablePaymentOption(true);
     setPaymentMethod('ONLINE');
    }
  },[]);

  const goToBankDetails = () => {
    dismissPayoutNudge();
    navigate('/account?tab=wallet&bankDetails=1');
  };

  const [createBooking] = useCreateBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const [payWithWallet] = usePayWithWalletMutation();
  const [getUnitAvailability] = useLazyGetUnitAvailabilityQuery();
  useHandleAuthError(profileError);

  // Add title component
  const titleComponent = usePageTitle({
    title: requestSubmitted
      ? 'Request Submitted'
      : paymentSuccess
        ? 'Payment Successful'
        : paymentPending
          ? 'Payment Pending'
          : booking?.booking_mode === 'REQUEST_TO_BOOK'
            ? 'Request to Book'
            : 'Confirm Booking',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // When resuming payment for an already-created booking (e.g. the guest comes
  // back after an owner approval), seed createdBookingId so the create-booking
  // step is skipped and we go straight to the payment flow.
  useEffect(() => {
    if (resumeBookingId && !createdBookingId) {
      setCreatedBookingId(resumeBookingId);
    }
  }, [resumeBookingId, createdBookingId]);

  useEffect(() => {
    if (!isProfileLoading && profileData) {
      const walletWithNgn = profileData?.data?.wallets.find(
        (wallet: Wallet) => wallet.currency === 'NGN'
      );
      setWallet(walletWithNgn || null);
    }
  }, [isProfileLoading, profileData]);

  const handlePaymentMethodChange = async () => {
    // --- Basic validations ---
    if (
      !booking?.base_price ||
      !booking?.total_charging_fee ||
      !booking?.nights
    ) {
      toast.error('Please update all booking information before proceeding.');
      return;
    }

    // --Profile completeness & authentication
    const isAuthError =
      (profileError as any)?.status === 401 ||
      ((profileError as any)?.status === 400 &&
        (profileError as any)?.data?.message === 'Expired token');
    if (isAuthError) return;

    if (!profileData?.data) {
      toast.error('Please complete your profile before proceeding.', {
        autoClose: 5000,
        position: 'top-center',
      });
      return;
    }

    if (!profileData.data.email) {
      toast.error('A valid email address is required for payment.', {
        autoClose: 7000,
        position: 'top-center',
      });
      return;
    }

    const profile = profileData.data;
    const isProfileIncomplete =
      !profile.profile?.firstName ||
      !profile.profile?.lastName ||
      !profile.phone ||
      !profile.profile?.dob;

    if (isProfileIncomplete) {
      setShowProfileComplete(true);
      return;
    }

    // ---Start processin
    setBookingStatus(true);
    setBookingError(null);

    // --- Extension Availability Check ---
    if (isExtension) {
      try {
        const propertyId = booking?.id?.toString();
        const unitId = booking?.unit_id?.toString();
        if (propertyId && unitId) {
          const availability = await getUnitAvailability({
            propertyId,
            unitId,
          }).unwrap();
          
          if (availability?.data) {
            const checkOutDateStr = booking?.check_out_date;
            if (checkOutDateStr) {
               // Verify if the requested checkOutDate (or any date leading up to it) is blocked
               // Specifically, we care if the stay *duration* overlaps any blocked nights.
               const blockedDates = availability.data
                 .filter((item: any) => {
                   if (item.hasOwnProperty('count') && item.count > 0 && !item.is_blackout) return false;
                   if (item.status && item.status !== 'UNAVAILABLE' && item.status !== 'BOOKED') return false;
                   return true;
                 })
                 .map((item: any) => (typeof item === 'string' ? item : item.date));
               
               const requestedCheckOut = new Date(checkOutDateStr);
               const isUnavailable = blockedDates.some((d: string) => {
                 const blockedDate = new Date(d);
                 // If a blocked date is before the requested check-out date, it's an overlap
                 // because the guest stays the night BEFORE their check-out date.
                 return blockedDate < requestedCheckOut && blockedDate >= new Date(booking.check_in_date);
               });

               if (isUnavailable) {
                 toast.error('These dates are no longer available for extension. Please contact support.');
                 setBookingStatus(false);
                 return;
               }
            }
          }
        }
      } catch (err) {
        console.error('Availability check failed:', err);
        // We might choose to proceed anyway or fail safe. 
        // Failing safe for now to avoid double bookings.
      }
    }

    try {
      // 1. Ensure booking exists
      let bookingId = createdBookingId;
      if (!bookingId && !isExtension) {
        const bookingPayload: BookingPayload = {
          unit_id: booking?.unit_id,
          start_date: booking?.check_in_date || '',
          end_date: booking?.check_out_date || '',
          guests_count: booking?.adults ?? 1,
          unit_count: booking?.unit_count ?? 1,
          total_price: booking?.total_charging_fee ?? 0,
          ...(booking?.billing_unit && { billing_unit: booking.billing_unit }),
          ...(booking?.billing_duration && { billing_duration: booking.billing_duration }),
          // An event-centre hire's start time or session; the server derives
          // the end from the hall's terms.
          ...(booking?.event_start_time && booking?.billing_unit === 'PER_HOUR' && {
            event_start_time: booking.event_start_time,
          }),
          ...(booking?.half_day_window_name && { half_day_window_name: booking.half_day_window_name }),
          ...(booking?.selected_additional_fees && { selected_additional_fees: booking.selected_additional_fees }),
        };
        if (referralCode.trim() && !profileData?.data?.hasReferrer) {
          bookingPayload.referral_code = referralCode.trim().toUpperCase();
        }
        const bookingResponse = await createBooking(bookingPayload).unwrap();
        bookingId = bookingResponse?.data?.booking_id?.toString() || null;
        setCreatedBookingId(bookingId);

        const profile = profileData?.data;
        const userName = [profile?.profile?.firstName, profile?.profile?.lastName]
          .filter(Boolean)
          .join(' ');
        trackBookingDetailsSubmitted({
          booking_id: bookingId ?? undefined,
          property_id: booking?.id,
          check_in: booking?.check_in_date,
          check_out: booking?.check_out_date,
          guests: booking?.adults,
          number_of_nights: booking?.nights,
          user_id: profile?.userId,
          user_name: userName || undefined,
          unit_id: booking?.unit_id,
          guest_id: profile?.userId,
          booked_by_id: profile?.userId,
          start_date: booking?.check_in_date,
          end_date: booking?.check_out_date,
          guests_count: booking?.adults,
          unit_count: booking?.unit_count,
          total_price: booking?.total_charging_fee,
          caution_fee: booking?.caution_fee,
          payment_method: paymentMethod || undefined,
          status: bookingResponse?.data?.status,
          is_extension: Boolean(isExtension),
          has_referral: Boolean(profile?.hasReferrer),
          has_referral_code: Boolean(referralCode.trim()),
          created_at: new Date().toISOString(),
        });

        if (bookingId && readShouldShowPayoutNudgeFromCreateBooking(bookingResponse)) {
          setPayoutNudgePendingForBooking(bookingId);
        }

        // For REQUEST_TO_BOOK properties the booking starts as
        // APPROVAL_PENDING. Stop here — the guest must wait for the owner to
        // approve before paying, and the API refuses payment on that status.
        //
        // APPROVAL_PENDING *only*. This used to read
        // `=== 'APPROVAL_PENDING' || === 'PENDING'`, but PENDING is the normal
        // status of an INSTANT booking that is ready to be paid — it means
        // "awaiting payment", not "awaiting approval". Matching it returned
        // before the payment step ever ran, so on an instant property the
        // guest pressed Pay, saw "request submitted", and had to go to their
        // bookings page and pay a second time to actually complete. It
        // affected card payments the same way; wallet is just where it was
        // noticed.
        const bookingStatus = bookingResponse?.data?.status;
        if (bookingStatus === 'APPROVAL_PENDING') {
          setRequestSubmitted(true);
          setBookingStatus(false);
          setPayoutNudgeOpen(true);
          return;
        }
      }

      if (!bookingId) throw new Error('Booking could not be created.');

      // 2. Wallet check (needed for both payment methods)
      if (!wallet?.id) throw new Error('Wallet information is missing.');

      // 3. Handle based on payment method
      if (paymentMethod === 'ONLINE') {
        // --- Online payment flow ---
        if (!paymentGateway) {
          toast.error('Please select a payment gateway (Paystack or Monnify).');
          setBookingStatus(false);
          return;
        }

        // Wait for gateway config if not already loaded
        const gatewayConfig = gatewayConfigResponse?.data;
        if (!gatewayConfig) {
          toast.error(
            'Payment configuration is loading. Please try again in a moment.'
          );
          setBookingStatus(false);
          return;
        }

        const providerName = paymentGateway; // HEre 'MONNIFY' or 'PAYSTACK'

        let transactionRef = extensionTransactionRef;
        let transactionId = null;

        if (!transactionRef) {
          // Create transaction record in the backend for normal bookings
          const paymentPayload = {
            comment: isExtension ? 'Aparte Extension Payment' : 'Aparte Booking Payment',
            action: 'DEBIT',
            amount: booking?.total_charging_fee?.toString() || '0',
            currency: wallet?.currency || 'NGN',
            description: isExtension ? `Payment for extension of booking ${bookingId}` : `Payment for booking ${bookingId}`,
            type: 'PAYMENT',
            email: profileData?.data?.email || '',
            provider: providerName,
            userId: wallet?.userId ?? '',
            propertyId: Number(booking?.id) || 0,
            booking_id: bookingId,
            redirect_url: isExtension 
              ? `${window.location.origin}/booking-validation?bookingId=${bookingId}&isExtension=true` 
              : `${window.location.origin}/booking-validation`,
            skip_gateway: true,
          };

          const paymentResponse = await postPayment({
            id: wallet.id,
            payload: paymentPayload,
          }).unwrap();
          transactionRef = paymentResponse?.data?.reference;
          transactionId = paymentResponse?.data?.id;

          if (!transactionRef || !transactionId) {
            throw new Error(
              'Transaction reference missing from server response.'
            );
          }

          // Update booking with transaction details
          await updateBookingStatus({
            bookingId,
            bookingStatusPayload: {
              transaction_id: transactionId,
              transaction_ref: transactionRef,
              transaction_status: paymentResponse.data.status || 'PENDING',
            },
          }).unwrap();
        }

        // Initialize the appropriate SDK
        const validationUrl = isExtension 
          ? `${window.location.origin}/booking-validation?paymentReference=${transactionRef}&bookingId=${bookingId}&provider=${providerName}&isExtension=true`
          : `${window.location.origin}/booking-validation?paymentReference=${transactionRef}&bookingId=${bookingId}&provider=${providerName}`;
        if (providerName === 'MONNIFY' && window.MonnifySDK) {
          setPaymentPending(true); // show pending UI while SDK is open

          window.MonnifySDK.initialize({
            amount: booking.total_charging_fee,
            currency: 'NGN',
            reference: transactionRef,
            customerFullName:
              `${profileData.data.profile?.firstName || ''} ${profileData.data.profile?.lastName || ''}`.trim() ||
              'Customer',
            customerEmail: profileData.data.email,
            apiKey: gatewayConfig.apiKey,
            contractCode: gatewayConfig.contractCode,
            paymentDescription: isExtension ? `Extension for ${bookingId}` : `Payment for booking ${bookingId}`,
            isTestMode: gatewayConfig.isTestMode,
            onComplete: () => {
              // Redirect to validation page - payment reference is already known
              window.location.href = validationUrl;
            },
            onClose: () => {
              // console.log('Monnify widget closed');
              setPaymentPending(false);
              setBookingStatus(false);
              // Optionally inform user
              toast.info('Payment was cancelled. You can try again.');
            },
          });
        } else if (providerName === 'PAYSTACK' && window.PaystackPop) {
          setPaymentPending(true);

          const handler = window.PaystackPop.setup({
            key: gatewayConfig.publicKey,
            email: profileData.data.email,
            amount: booking.total_charging_fee * 100,
            ref: transactionRef,
            callback: () => {
              window.location.href = validationUrl;
            },
            onClose: () => {
              setPaymentPending(false);
              setBookingStatus(false);
              toast.info('Payment was cancelled.');
            },
          });
          handler.openIframe();
        } else {
          // SDK not loaded
          toast.error('Payment system unavailable. Please refresh the page.');
          setBookingStatus(false);
        }
      } else if (paymentMethod === 'WALLET') {
        // --- Wallet payment flow ---
        // A wallet payment has NO payment gateway, so it must never include the
        // gateway processing fee. Charge the fee-free booking cost (total_price);
        // fall back to total_charging_fee only for older quote data that lacks it.
        // The backend is authoritative and re-derives this, but sending the right
        // figure keeps the request, the receipt and the on-screen total in step.
        const walletChargeAmount =
          booking?.total_price ?? booking?.total_charging_fee ?? 0;
        const paymentPayload = {
          userId: wallet.userId,
          comment: 'Aparte Booking Payment',
          action: 'DEBIT',
          amount: walletChargeAmount.toString() || '0',
          currency: 'NGN',
          description: `Wallet payment for booking ${bookingId}`,
          type: 'BOOKING', // internal booking payment, no gateway
          email: profileData?.data?.email || '',
          provider: '',
          propertyId: Number(booking?.id) || 0,
          booking_id: bookingId,
        };

        let paymentResponse;
        
        if (isExtension && extensionTransactionRef) {
          // Special payWithWallet endpoint for extensions
          paymentResponse = await payWithWallet({
            walletId: wallet.id,
            transaction_ref: extensionTransactionRef
          }).unwrap();
        } else {
          paymentResponse = await postPayment({
            id: wallet.id,
            payload: paymentPayload,
          }).unwrap();
        }

        if (paymentResponse?.data?.status === 'SUCCESSFUL') {
          // Update booking status
          await updateBookingStatus({
            bookingId,
            bookingStatusPayload: {
              transaction_id: paymentResponse.data.id,
              transaction_ref: paymentResponse.data.reference,
              transaction_status: paymentResponse.data.status,
            },
          }).unwrap();

          setPaymentSuccess(true);
          toast.success('Payment successful!');
        } else {
          throw new Error(
            paymentResponse?.data?.message || 'Wallet payment failed.'
          );
        }
      } else {
        toast.error('Please select a payment method.');
        setBookingStatus(false);
      }
    } catch (err: any) {
      const errorDataDetail = err?.data?.detail;
      const isProfileIncompleteError =
        errorDataDetail?.code === 'PROFILE_INCOMPLETE' ||
        (Array.isArray(errorDataDetail) && errorDataDetail[0]?.code === 'PROFILE_INCOMPLETE');

      if (isProfileIncompleteError) {
        setShowProfileComplete(true);
        setBookingStatus(false);
        setPaymentPending(false);
        return;
      }

      const errorMessage =
        err?.data?.details ||
        err?.data?.error ||
        err?.error ||
        err.message ||
        'An unexpected error occurred.';
      setBookingError(errorMessage);
      toast.error(errorMessage);
      setBookingStatus(false);
      setPaymentPending(false); // ensure pending is cleared on error
    }
  };

  useEffect(() => {
    if (
      createdBookingId &&
      isPayoutNudgePendingForBooking(createdBookingId) &&
      !isPayoutNudgeModalDismissedForBooking(createdBookingId)
    ) {
      setPayoutNudgeOpen(true);
    }
  }, [createdBookingId]);

  // An event-centre hire reads as an event: one date and its time, never a
  // check-in and a check-out.
  const isVenueBooking =
    !!booking?.is_venue ||
    propertyDetail?.property_type === 'EVENT_CENTRE' ||
    (booking?.billing_unit != null && booking.billing_unit !== 'PER_NIGHT');
  const hireText = isVenueBooking ? describeHire(booking ?? {}) : '';

  const changeBtn =
    'shrink-0 rounded-full border border-gray-300 px-4 py-1.5 text-sm font-semibold text-gray-800 hover:border-[#028090] hover:text-[#026672] transition-colors';
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const guestsText =
    [
      (booking?.adults ?? 0) > 0 && plural(booking.adults, 'adult', 'adults'),
      (booking?.children ?? 0) > 0 && plural(booking.children, 'child', 'children'),
      (booking?.pets ?? 0) > 0 && plural(booking.pets, 'pet', 'pets'),
    ]
      .filter(Boolean)
      .join(' · ') || '—';

  const handleChangeDate = () => {
    navigate(`/property-details/${booking?.id}`, {
      state: {
        preservedState: {
          checkInDate: booking?.check_in_date,
          checkOutDate: booking?.check_out_date,
          adults: booking?.adults || 0,
          children: booking?.children || 0,
          pets: booking?.pets || 0,
          nights: booking?.nights || 1,
          basePrice: booking?.base_price || 0,
          totalChargingFee: booking?.total_charging_fee || 0,
          unitId: booking?.unit_id || 0,
          billingUnit: booking?.billing_unit,
          billingDuration: booking?.billing_duration,
          eventStartTime: booking?.event_start_time,
          halfDayWindow: booking?.half_day_window_name,
          unit_count: booking?.unit_count || 1,
        },
      },
    });
  };

  const handleAdjustGuests = () => {
    navigate(`/property-details/${booking?.id}`, {
      state: {
        preservedState: {
          checkInDate: booking?.check_in_date,
          checkOutDate: booking?.check_out_date,
          adults: booking?.adults || 0,
          children: booking?.children || 0,
          pets: booking?.pets || 0,
          nights: booking?.nights || 1,
          basePrice: booking?.base_price || 0,
          totalChargingFee: booking?.total_charging_fee || 0,
          unitId: booking?.unit_id || 0,
          billingUnit: booking?.billing_unit,
          billingDuration: booking?.billing_duration,
          eventStartTime: booking?.event_start_time,
          halfDayWindow: booking?.half_day_window_name,
          unit_count: booking?.unit_count || 1,
        },
      },
    });
  };

  if (requestSubmitted) {
    // Request-to-Book submitted view
    return (
      <PageLayout>
        {titleComponent}
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 pt-24">
          <div className="bg-white rounded-2xl shadow-md p-8 max-w-lg w-full text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Submitted</h2>
            <p className="text-gray-600 mb-4">
              Your booking request for <strong>{booking?.title}</strong> has been sent to the property owner for approval.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You&apos;ll receive a notification once the owner approves your request. After approval, you can proceed to payment.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Booking ID</span>
                <span className="font-medium">{createdBookingId}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">{isVenueBooking ? 'Event date' : 'Check-in'}</span>
                <span className="font-medium">{booking?.check_in_date}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">{isVenueBooking ? 'Hire' : 'Check-out'}</span>
                <span className="font-medium">
                  {isVenueBooking ? hireText : booking?.check_out_date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-medium">{formatPrice(booking?.total_charging_fee || 0)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/account?tab=bookings')}
              className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              View My Bookings
            </button>
          </div>
        </div>
        <PayoutNudgeModal
        open={payoutNudgeOpen}
        onClose={dismissPayoutNudge}
        onAddBankDetails={goToBankDetails}
      />
      </PageLayout>
    );
  }

  if (paymentSuccess) {
    // Payment Success View
    return (
      <PaymentSuccessView
        booking={booking}
        paymentMethod={paymentMethod}
        formatPrice={formatPrice}
        bookingError={bookingError}
        bookingId={createdBookingId}
      />
    );
  }
  if (paymentPending) {
    // Payment Pending View
    return (
      <PaymentPendingView
        booking={booking}
        paymentMethod={paymentMethod}
        formatPrice={formatPrice}
      />
    );
  }

  return (
    <PageLayout>
      {titleComponent}
      <div className="min-h-screen">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row gap-6 lg:gap-10 px-4 lg:px-8 pt-28 pb-16">
        {/* Left Section */}
        <div className="lg:flex-1 min-w-0">
          <div className="flex items-center gap-4 mb-6">
            <button
              type="button"
              aria-label="Back to property"
              className="w-11 h-11 shrink-0 rounded-full bg-[#191919] text-white flex items-center justify-center hover:bg-black transition-colors"
              onClick={() => {
                // Preserve the complete booking state when going back
                navigate(`/property-details/${booking?.id}`, {
                  state: {
                    preservedState: {
                      checkInDate: booking?.check_in_date,
                      checkOutDate: booking?.check_out_date,
                      adults: booking?.adults || 0,
                      children: booking?.children || 0,
                      pets: booking?.pets || 0,
                      nights: booking?.nights || 1,
                      basePrice: booking?.base_price || 0,
                      totalChargingFee: booking?.total_charging_fee || 0,
                      unitId: booking?.unit_id || 0,
                      billingUnit: booking?.billing_unit,
                      billingDuration: booking?.billing_duration,
                      eventStartTime: booking?.event_start_time,
                      halfDayWindow: booking?.half_day_window_name,
                      unitCount: booking?.unit_count || 1,
                    },
                  },
                });
              }}
            >
              <Icon icon="mdi:chevron-left" width={26} />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#028090]">
                {booking?.booking_mode === 'REQUEST_TO_BOOK' ? 'Review your request' : 'Review · Pay · Done'}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-[#191919] leading-tight">
                {booking?.booking_mode === 'REQUEST_TO_BOOK' ? 'Request to book' : 'Confirm and pay'}
              </h1>
            </div>
          </div>

          {/* Trip details */}
          <div className="bg-white shadow-[0_24px_48px_-16px_rgba(25,25,25,0.2)] border border-black/5  rounded-[28px] px-5 md:px-6 py-2 mb-4 divide-y divide-gray-100">
            <div className="flex items-center gap-4 py-4">
              <div className="w-11 h-11 shrink-0 rounded-full bg-[#E3F2F4] text-[#026672] flex items-center justify-center">
                <Icon icon="mdi:calendar-arrow-right" width={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {isVenueBooking ? 'Event date' : 'Check-in'}
                </p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{booking?.check_in_date}</p>
              </div>
              {!isExtension && (
                <button type="button" onClick={handleChangeDate} className={changeBtn}>
                  Change
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 py-4">
              <div className="w-11 h-11 shrink-0 rounded-full bg-[#E3F2F4] text-[#026672] flex items-center justify-center">
                <Icon icon={isVenueBooking ? 'mdi:clock-outline' : 'mdi:calendar-arrow-left'} width={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {isVenueBooking ? 'Time' : 'Check-out'}
                </p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">
                  {isVenueBooking ? hireText : booking?.check_out_date}
                </p>
              </div>
              <button type="button" onClick={handleChangeDate} className={changeBtn}>
                Change
              </button>
            </div>
            <div className="flex items-center gap-4 py-4">
              <div className="w-11 h-11 shrink-0 rounded-full bg-[#E3F2F4] text-[#026672] flex items-center justify-center">
                <Icon icon="mdi:account-group-outline" width={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Guests</p>
                <p className="text-base font-semibold text-gray-900 mt-0.5">{guestsText}</p>
              </div>
              <button type="button" onClick={handleAdjustGuests} className={changeBtn}>
                Adjust
              </button>
            </div>
          </div>

          {/* Rules — collapsed so the pay step stays within one glance */}
          {propertyDetail?.rules && (
            <details className="group bg-white rounded-[28px] shadow-[0_1px_2px_rgba(25,25,25,0.06)] px-5 md:px-6 mb-4">
              <summary className="flex items-center justify-between gap-3 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3 font-semibold text-gray-900">
                  <Icon icon="mdi:shield-check-outline" width={22} className="text-[#028090]" />
                  {isVenueBooking ? 'Venue rules & information' : 'House rules'}
                </span>
                <Icon icon="mdi:chevron-down" width={22} className="text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-5 text-sm text-gray-600 whitespace-pre-wrap">{propertyDetail.rules}</p>
            </details>
          )}

          {/* Referral Code — hidden when the user already has a lifetime referrer */}
          {!profileData?.data?.hasReferrer && (
            <details
              className="group bg-white rounded-[28px] shadow-[0_24px_48px_-16px_rgba(25,25,25,0.2)] border border-black/5 px-5 md:px-6 mb-4"
              open={referralLocked || undefined}
            >
              <summary className="flex items-center justify-between gap-3 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3 font-semibold text-gray-900">
                  <Icon icon="mdi:ticket-percent-outline" width={22} className="text-[#028090]" />
                  {referralLocked ? 'Referral code applied' : 'Have a referral code?'}
                </span>
                <Icon icon="mdi:chevron-down" width={22} className="text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <div className="pb-5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    placeholder="JOHN7F3A"
                    disabled={referralLocked}
                    readOnly={referralLocked}
                    className={`flex-1 border rounded-full px-5 py-2.5 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#028090] focus:border-transparent ${
                      referralLocked
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800 cursor-not-allowed'
                        : 'border-gray-300'
                    }`}
                  />
                  {referralCode && !referralLocked && (
                    <button
                      type="button"
                      onClick={() => setReferralCode('')}
                      className="px-3 py-2 text-gray-400 hover:text-gray-600 text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
                {referralCode && (
                  <p className="text-xs text-gray-500 mt-2">
                    {referralLocked
                      ? 'This code was applied from your referral link and will be credited automatically.'
                      : 'Code will be applied when you confirm your booking.'}
                  </p>
                )}
              </div>
            </details>
          )}

          {/* Payment Section — hidden for request-to-book */}
          {booking?.booking_mode === 'REQUEST_TO_BOOK' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-[28px] p-5">
              <p className="text-sm text-amber-800 font-medium">This property requires owner approval.</p>
              <p className="text-sm text-amber-700 mt-1">Once the owner approves your request, you&apos;ll be notified to complete payment.</p>
            </div>
          ) : (
            <PaymentMethodSelection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paymentGateway={paymentGateway}
              setPaymentGateway={setPaymentGateway}
              wallet={wallet}
              formatPrice={formatPrice}
              disablePaymentOption
            />
          )}
        </div>

        {/* Right Section - Booking Summary */}
        <div className="lg:w-[400px] shrink-0">
          <BookingSummary
            booking={booking}
            paymentMethod={paymentMethod}
            isProcessing={boookingStatus}
            onConfirm={handlePaymentMethodChange}
            formatPrice={formatPrice}
            bookingMode={booking?.booking_mode}
          />
        </div>

        {showProfileComplete && profileData?.data && (
          <QuickProfileComplete
            initialData={{
              firstName: profileData.data.profile?.firstName,
              lastName: profileData.data.profile?.lastName,
              phone: profileData.data.phone,
              dob: profileData.data.profile?.dob,
            }}
            onClose={() => setShowProfileComplete(false)}
            onComplete={() => {
              setShowProfileComplete(false);
              toast.success('Profile updated! You can now proceed with booking.');
            }}
          />
        )}
      </div>
      </div>

      <PayoutNudgeModal
        open={payoutNudgeOpen}
        onClose={dismissPayoutNudge}
        onAddBankDetails={goToBankDetails}
      />
    </PageLayout>
  );
};

export default ConfirmBooking;
