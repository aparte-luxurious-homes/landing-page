import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import { usePostPaymentMutation, useGetDefaultGatewayConfigQuery } from "../api/paymentApi";
import { useGetProfileQuery } from "../api/profileApi";
import { useHandleAuthError } from '../hooks/useHandleAuthError';
import { useBooking } from "../context/UserBooking";
import { useCreateBookingMutation, useUpdateBookingStatusMutation } from "../api/booking";
import PageLayout from "../components/pagelayout/index";
import usePageTitle from '../hooks/usePageTitle';
import QuickProfileComplete from "../components/booking/QuickProfileComplete";
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
  const { booking } = useBooking();
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
  const { data: gatewayConfigResponse } = useGetDefaultGatewayConfigQuery();
  const [createBooking] = useCreateBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  useHandleAuthError(profileError)

  // Add title component
  const titleComponent = usePageTitle({
    title: paymentSuccess ? 'Payment Successful' : paymentPending ? 'Payment Pending' : 'Confirm Booking'
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
      const walletWithNgn = profileData?.data?.wallets.find((wallet: Wallet) => wallet.currency === "NGN");
      setWallet(walletWithNgn || null);
    }
  }, [isProfileLoading, profileData])

  console.log("Bookins", booking);
  console.log("profileData", profileData);

  const handlePaymentMethodChange = async () => {
    if (!booking?.base_price || !booking?.total_charging_fee || !booking?.nights) {
      toast.error("Please update all booking information before proceeding.");
      return;
    }

    // Basic profile check
    const isAuthError = (profileError as any)?.status === 401 ||
      ((profileError as any)?.status === 400 && (profileError as any)?.data?.message === "Expired token");

    if (isAuthError) return; // Hook will handle redirection

    if (!profileData?.data) {
      toast.error("Please complete your profile before proceeding with booking.", {
        autoClose: 5000,
        position: "top-center"
      });
      return;
    }

    if (!profileData.data.email) {
      toast.error(
        "Please update your profile with a valid email address before proceeding.",
        {
          autoClose: 7000,
          position: "top-center"
        }
      );
      return;
    }

    // Profile completeness check
    const profile = profileData?.data;
    const isProfileIncomplete = !profile?.profile?.firstName ||
      !profile?.profile?.lastName ||
      !profile.phone ||
      !profile?.profile?.dob;

    if (isProfileIncomplete) {
      toast.info("Please complete your profile to continue.", { autoClose: 3000 });
      setShowProfileComplete(true);
      return;
    }

    // KYC check (ID Verification)
    // if (profile?.profile?.kycStatus !== 'VERIFIED') {
    //   toast.error(
    //     "Identity verification required. Please upload a valid form of ID before proceeding.",
    //     {
    //       autoClose: 7000,
    //       position: "top-center"
    //     }
    //   );
    //   setTimeout(() => {
    //     navigate('/kycdetails');
    //   }, 2000);
    //   return;
    // }

    try {
      setBookingStatus(true);

      // First, create the booking with pending status
      const bookingPayload = {
        unit_id: booking?.unit_id ?? 0,
        start_date: booking?.check_in_date || "",
        end_date: booking?.check_out_date || "",
        guests_count: booking?.adults ?? 1,
        unit_count: booking?.unit_count ?? 1,
        total_price: booking?.total_charging_fee ?? 0,
      };

      let bookingId = createdBookingId;

      if (!bookingId) {
        const bookingResponse = await createBooking(bookingPayload).unwrap();
        bookingId = bookingResponse?.data?.booking_id?.toString() || null;
        setCreatedBookingId(bookingId);
      }

      if (!bookingId) {
        throw new Error("Booking ID not found");
      }

      toast.success("Booking created successfully!");

      // Then handle payment based on selected method
      if (paymentMethod === "ONLINE") {
        const providerName = gatewayConfigResponse?.data?.provider || "MONNIFY";
        const gatewayConfig = gatewayConfigResponse?.data?.config;

        if (!wallet?.id) {
          throw new Error("Wallet not found");
        }

        const paymentPayload = {
          comment: "Aparte Booking Payment",
          action: "DEBIT",
          amount: booking?.total_charging_fee?.toString() || "0",
          currency: wallet?.currency || "",
          description: `Payment for booking ${bookingId}`,
          type: "PAYMENT",
          email: profileData?.data?.email || "",
          provider: providerName,
          userId: wallet?.userId ?? 0,
          propertyId: Number(booking?.id) || 0,
          booking_id: bookingId,
          redirect_url: `${window.location.origin}/booking-validation`,
          skip_gateway: true, // Prevent duplicate initialization
        };

        const paymentResponse = await postPayment({ id: wallet.id, payload: paymentPayload }).unwrap();

        console.log("Payment response received:", paymentResponse);

        const transaction_Id = paymentResponse?.data?.id || "";
        const transaction_Ref = paymentResponse?.data?.reference || "";
        const transaction_Status = paymentResponse?.data?.status || "PENDING";

        if (!transaction_Id || !transaction_Ref) {
          throw new Error("Transaction details missing");
        }

        // Update booking status with transaction details
        const bookingStatusPayload = {
          transaction_id: transaction_Id,
          transaction_ref: transaction_Ref,
          transaction_status: transaction_Status
        };

        await updateBookingStatus({ bookingId, bookingStatusPayload }).unwrap();

        console.log("Checking reference:", paymentResponse?.data?.reference);
        console.log("Monnify config:", gatewayConfig);

        if (paymentResponse?.data?.reference) {
          if (providerName === "MONNIFY" && window.MonnifySDK) {
            // Ensure config is available
            if (!gatewayConfig) {
              toast.error("Payment configuration is missing. Please try again.");
              setBookingStatus(false);
              return;
            }

            console.log("About to initialize Monnify SDK...");

            window.MonnifySDK.initialize({
              amount: booking?.total_charging_fee ?? 0,
              currency: "NGN",
              reference: transaction_Ref,
              customerFullName: `${profileData?.data?.profile?.firstName || ''} ${profileData?.data?.profile?.lastName || ''}`.trim() || "Customer",
              customerEmail: profileData?.data?.email,
              apiKey: gatewayConfig?.apiKey,
              contractCode: gatewayConfig?.contractCode,
              paymentDescription: `Payment for booking ${bookingId}`,
              isTestMode: gatewayConfig?.isTestMode,
              onLoadStart: () => {
                console.log("loading has started");
              },
              onLoadComplete: () => {
                console.log("SDK is UP");
              },
              onComplete: (response: any) => {
                console.log("Monnify SDK Complete:", response);
                window.location.href = `${window.location.origin}/booking-validation?paymentReference=${transaction_Ref}&bookingId=${bookingId}&provider=${providerName}`;
              },
              onClose: (data: any) => {
                console.log("Monnify SDK Closed:", data);
                setPaymentPending(false);
                setBookingStatus(false);
              }
            });
          } else if (providerName === "PAYSTACK" && window.PaystackPop) {
            if (!gatewayConfig) {
              toast.error("Payment configuration is missing. Please try again.");
              setBookingStatus(false);
              return;
            }

            console.log("About to initialize Paystack SDK...");
            const handler = window.PaystackPop.setup({
              key: gatewayConfig.publicKey,
              email: profileData?.data?.email,
              amount: (booking?.total_charging_fee ?? 0) * 100, // conversion to kobo
              ref: transaction_Ref,
              callback: (response: any) => {
                console.log("Paystack SDK Complete:", response);
                window.location.href = `${window.location.origin}/booking-validation?paymentReference=${transaction_Ref}&bookingId=${bookingId}&provider=${providerName}`;
              },
              onClose: () => {
                console.log("Paystack SDK Closed");
                setPaymentPending(false);
                setBookingStatus(false);
                // Optional: You might want to reload the page or reset specific states if needed
                // window.location.reload(); 
              }
            });
            handler.openIframe();
          } else {
            // SDK not loaded or unsupported provider
            toast.error("Payment system unavailable. Please refresh the page and try again.");
            setBookingStatus(false);
            console.error(`${providerName} SDK not loaded`);
          }
        } else {
          throw new Error("Payment link not found");
        }

      } else if (paymentMethod === "WALLET") {
        if (!wallet?.id) {
          throw new Error("Wallet not found");
        }

        const paymentPayload = {
          userId: wallet.userId,
          comment: "Aparte Booking Payment",
          action: "DEBIT",
          amount: booking?.total_charging_fee?.toString() || "0",
          currency: "NGN",
          description: `Wallet payment for booking ${bookingId}`,
          type: "BOOKING",
          email: profileData?.data?.email || "",
          provider: "",
          propertyId: Number(booking?.id) || 0,
          booking_id: bookingId,
        };

        const paymentResponse = await postPayment({ id: wallet.id, payload: paymentPayload }).unwrap();

        if (paymentResponse?.data?.status === "SUCCESSFUL") {
          setPaymentSuccess(true);

          // Update booking status for successful wallet payment
          const bookingStatusPayload = {
            transaction_id: paymentResponse.data.id,
            transaction_ref: paymentResponse.data.reference,
            transaction_status: paymentResponse?.data?.status
          };

          await updateBookingStatus({ bookingId, bookingStatusPayload }).unwrap();
          toast.success("Payment successful!");
        } else {
          throw new Error("Wallet payment failed");
        }
      }
    } catch (err: any) {
      console.error("API Error:", err);
      const errorMessage = err?.data?.details || err?.data?.error || err?.error || err.message || "An unknown error occurred";
      setBookingError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setBookingStatus(false);
    }
  };

  const formatPrice = (price: number) => {
    const safePrice = isNaN(price) ? 0 : price;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(safePrice).replace('NGN', '₦');
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
          unit_count: booking?.unit_count || 1
        }
      }
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
          unit_count: booking?.unit_count || 1
        }
      }
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
          <div className="flex items-center mb-6">
            <div className="mr-4 cursor-pointer" onClick={() => {
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
                    unitCount: booking?.unit_count || 1
                  }
                }
              });
            }}>
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
                  <p className="text-gray-600 mt-1">{booking?.check_out_date}</p>
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
                    {(booking?.adults ?? 0) > 0 && <p>{booking?.adults} Adults</p>}
                    {(booking?.children ?? 0) > 0 && <p>{booking?.children} Children</p>}
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
              dob: profileData.data.profile?.dob
            }}
            onComplete={() => {
              setShowProfileComplete(false);
              // Optionally trigger payment method change again or just notify user
              toast.success("Profile updated! You can now proceed with booking.");
            }}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default ConfirmBooking;