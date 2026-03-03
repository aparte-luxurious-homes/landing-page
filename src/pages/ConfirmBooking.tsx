import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import {
  usePostPaymentMutation,
  useGetGatewayConfigQuery,
} from '../api/paymentApi';
import { useGetProfileQuery } from '../api/profileApi';
import { useHandleAuthError } from '../hooks/useHandleAuthError';
import { BookingContext } from '../context/UserBooking';
import {
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
} from '../api/booking';
import PageLayout from '../components/pagelayout/index';
import usePageTitle from '../hooks/usePageTitle';
import QuickProfileComplete from '../components/booking/QuickProfileComplete';
import PaymentSuccessView from '../components/booking/PaymentSuccessView';
import PaymentPendingView from '../components/booking/PaymentPendingView';
import PaymentMethodSelection from '../components/booking/PaymentMethodSelection';
import BookingSummary from '../components/booking/BookingSummary';

declare global {
  interface Window {
    MonnifySDK: any;
    PaystackPop: any;
  }
}

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const { booking } = useContext(BookingContext) || {};
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [showProfileComplete, setShowProfileComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [boookingStatus, setBookingStatus] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
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

  const [createBooking] = useCreateBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  useHandleAuthError(profileError);

  // Add title component
  const titleComponent = usePageTitle({
    title: paymentSuccess
      ? 'Payment Successful'
      : paymentPending
        ? 'Payment Pending'
        : 'Confirm Booking',
  });

  interface Wallet {
    balance: string;
    createdAt: string;
    currency: string;
    id: string;
    pendingCash: string;
    updatedAt: string;
    userId: number;
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
      toast.info('Please complete your profile to continue.', {
        autoClose: 3000,
      });
      setShowProfileComplete(true);
      return;
    }

    // ---Start processin
    setBookingStatus(true);
    setBookingError(null);

    try {
      // 1. Ensure booking exists
      let bookingId = createdBookingId;
      if (!bookingId) {
        const bookingPayload = {
          unit_id: booking?.unit_id ?? 0,
          start_date: booking?.check_in_date || '',
          end_date: booking?.check_out_date || '',
          guests_count: booking?.adults ?? 1,
          unit_count: booking?.unit_count ?? 1,
          total_price: booking?.total_charging_fee ?? 0,
        };
        const bookingResponse = await createBooking(bookingPayload).unwrap();
        bookingId = bookingResponse?.data?.booking_id?.toString() || null;
        setCreatedBookingId(bookingId);
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

        // Create transaction record in the backend
        const paymentPayload = {
          comment: 'Aparte Booking Payment',
          action: 'DEBIT',
          amount: booking?.total_charging_fee?.toString() || '0',
          currency: wallet?.currency || 'NGN',
          description: `Payment for booking ${bookingId}`,
          type: 'PAYMENT',
          email: profileData?.data?.email || '',
          provider: providerName,
          userId: wallet?.userId ?? 0,
          propertyId: Number(booking?.id) || 0,
          booking_id: bookingId,
          redirect_url: `${window.location.origin}/booking-validation`,
          skip_gateway: true,
        };

        const paymentResponse = await postPayment({
          id: wallet.id,
          payload: paymentPayload,
        }).unwrap();
        const transactionRef = paymentResponse?.data?.reference;
        const transactionId = paymentResponse?.data?.id;

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

        // Initialize the appropriate SDK
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
            paymentDescription: `Payment for booking ${bookingId}`,
            isTestMode: gatewayConfig.isTestMode,
            onComplete: () => {
              // Redirect to validation page - payment reference is already known
              window.location.href = `${window.location.origin}/booking-validation?paymentReference=${transactionRef}&bookingId=${bookingId}&provider=${providerName}`;
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
              window.location.href = `${window.location.origin}/booking-validation?paymentReference=${transactionRef}&bookingId=${bookingId}&provider=${providerName}`;
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

        const paymentResponse = await postPayment({
          id: wallet.id,
          payload: paymentPayload,
        }).unwrap();

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
        toast.info(errorDataDetail?.message || 'Please complete your profile details (Name, DOB, Email, and Phone) to proceed.');
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

  if (paymentSuccess) {
    // Payment Success View
    return (
      <PaymentSuccessView
        booking={booking}
        paymentMethod={paymentMethod}
        formatPrice={formatPrice}
        bookingError={bookingError}
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
            <h1 className="text-2xl font-bold">Confirm Booking</h1>
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
                <button
                  onClick={handleChangeDate}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm underline"
                >
                  Change date
                </button>
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

          {/* Payment Section */}
          <PaymentMethodSelection
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentGateway={paymentGateway}
            setPaymentGateway={setPaymentGateway}
            wallet={wallet}
            formatPrice={formatPrice}
          />
        </div>

        {/* Right Section - Booking Summary */}
        <div className="lg:w-1/3">
          <BookingSummary
            booking={booking}
            paymentMethod={paymentMethod}
            isProcessing={boookingStatus}
            onConfirm={handlePaymentMethodChange}
            formatPrice={formatPrice}
          />
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        {showProfileComplete && profileData?.data && (
          <QuickProfileComplete
            initialData={{
              firstName: profileData.data.profile?.firstName,
              lastName: profileData.data.profile?.lastName,
              phone: profileData.data.phone,
              dob: profileData.data.profile?.dob,
            }}
            onComplete={() => {
              setShowProfileComplete(false);
              // Optionally trigger payment method change again or just notify user
              toast.success(
                'Profile updated! You can now proceed with booking.'
              );
            }}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default ConfirmBooking;
