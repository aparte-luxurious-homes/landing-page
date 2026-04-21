import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { useLazyGetUnitAvailabilityQuery } from '../api/propertiesApi';
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
}

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { booking: contextBooking } = useContext(BookingContext) || {};
  
  // Extensions pass their context through location state
  const isExtension = location.state?.bookingContext?.isExtension;
  const booking = isExtension ? location.state.bookingContext : contextBooking;
  const extensionTransactionRef = location.state?.bookingContext?.transaction_ref;
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
  const [postPayment] = usePostPaymentMutation();
  const [paymentGateway, setPaymentGateway] = useState<string>('');
  const { data: gatewayConfigResponse } = useGetGatewayConfigQuery(
    paymentGateway,
    {
      skip: !paymentGateway,
    }
  );

  const dismissPayoutNudge = () => {
    // if (bookingId) setPayoutNudgeModalDismissedForBooking(bookingId);
    setPayoutNudgeOpen(false);
  };

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

  interface Wallet {
    balance: string;
    createdAt: string;
    currency: string;
    id: string;
    pendingCash: string;
    updatedAt: string;
    userId: string;
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        };
        if (referralCode.trim() && !profileData?.data?.hasReferrer) {
          bookingPayload.referral_code = referralCode.trim().toUpperCase();
        }
        const bookingResponse = await createBooking(bookingPayload).unwrap();
        bookingId = bookingResponse?.data?.booking_id?.toString() || null;
        setCreatedBookingId(bookingId);

        if (bookingId && readShouldShowPayoutNudgeFromCreateBooking(bookingResponse)) {
          console.log('bookingId', bookingId);
          setPayoutNudgePendingForBooking(bookingId);
        }

        // For REQUEST_TO_BOOK properties, the booking starts as APPROVAL_PENDING.
        // Stop here — the guest must wait for the owner to approve before paying.
        const bookingStatus = bookingResponse?.data?.status;
        if (bookingStatus === 'APPROVAL_PENDING' || bookingStatus === 'PENDING') {
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
        const paymentPayload = {
          userId: wallet.userId,
          comment: 'Aparte Booking Payment',
          action: 'DEBIT',
          amount: booking?.total_charging_fee?.toString() || '0',
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
    if(payoutNudgeOpen){
      console.log('payoutNudgeOpen', payoutNudgeOpen);
    }
  }, [payoutNudgeOpen]);

  useEffect(() => {
    if (
      createdBookingId &&
      isPayoutNudgePendingForBooking(createdBookingId) &&
      !isPayoutNudgeModalDismissedForBooking(createdBookingId)
    ) {
      setPayoutNudgeOpen(true);
    }
  }, [createdBookingId]);

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
                <span className="text-gray-500">Check-in</span>
                <span className="font-medium">{booking?.check_in_date}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Check-out</span>
                <span className="font-medium">{booking?.check_out_date}</span>
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
      <div className="flex flex-col lg:flex-row p-4 lg:p-8 gap-8 xl:px-52 pt-20">
        {/* Left Section */}
        <div className="lg:w-2/3">
          <div className="flex mt-11 items-center mb-6">
            <div
              className="mr-4 cursor-pointer"
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
                      unitCount: booking?.unit_count || 1,
                    },
                  },
                });
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="30" cy="30" r="30" fill="#191919" />
                <path
                  d="M32.1377 24.1294L27.139 29.1281C26.5487 29.7184 26.5487 30.6844 27.139 31.2748L32.1377 36.2734"
                  stroke="white"
                  strokeWidth="2.33538"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">{booking?.booking_mode === 'REQUEST_TO_BOOK' ? 'Request to Book' : 'Confirm Booking'}</h1>
          </div>

          {/* Booking Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-medium mb-4">Your stay information</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">Check-in date</p>
                  <p className="text-gray-600 mt-1">{booking?.check_in_date}</p>
                </div>
                {!isExtension && (
                  <button
                    onClick={handleChangeDate}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm underline"
                  >
                    Change date
                  </button>
                )}
              </div>
              <div className="border-t border-gray-200" />
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">Check-out date</p>
                  <p className="text-gray-600 mt-1">
                    {booking?.check_out_date}
                  </p>
                </div>
                <button
                  onClick={handleChangeDate}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm underline"
                >
                  Change date
                </button>
              </div>
              <div className="border-t border-gray-200" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">Guests</p>
                  <div className="text-gray-600 mt-1 space-y-1">
                    {(booking?.adults ?? 0) > 0 && (
                      <p>{booking?.adults} Adults</p>
                    )}
                    {(booking?.children ?? 0) > 0 && (
                      <p>{booking?.children} Children</p>
                    )}
                    {(booking?.pets ?? 0) > 0 && <p>{booking?.pets} Pets</p>}
                  </div>
                </div>
                <button
                  onClick={handleAdjustGuests}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm underline"
                >
                  Adjust
                </button>
              </div>
            </div>
          </div>

          {/* Referral Code — hidden when the user already has a lifetime referrer */}
          {!profileData?.data?.hasReferrer && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-base font-medium mb-3">
                {referralLocked ? 'Referral code applied' : <>Have a referral code? <span className="text-gray-400 font-normal text-sm">(optional)</span></>}
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  placeholder="JOHN7F3A"
                  disabled={referralLocked}
                  readOnly={referralLocked}
                  className={`flex-1 border rounded-lg px-4 py-2.5 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
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
          )}

          {/* Payment Section — hidden for request-to-book */}
          {booking?.booking_mode === 'REQUEST_TO_BOOK' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
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
            />
          )}
        </div>

        {/* Right Section - Booking Summary */}
        <div className="lg:w-1/3">
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

      <PayoutNudgeModal
        open={payoutNudgeOpen}
        onClose={dismissPayoutNudge}
        onAddBankDetails={goToBankDetails}
      />
    </PageLayout>
  );
};

export default ConfirmBooking;
