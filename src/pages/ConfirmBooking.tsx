import { MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Bigimg from '../assets/images/Apartment/Bigimg.png';
import Success from '../assets/images/success.png';
import { toast, ToastContainer } from "react-toastify";
import { usePostPaymentMutation } from "../api/paymentApi";
import { useGetProfileQuery } from "../api/profileApi";
import { useHandleAuthError } from '../hooks/useHandleAuthError';
import { useBooking } from "../context/UserBooking";
import { useCreateBookingMutation, useUpdateBookingStatusMutation } from "../api/booking";
import PageLayout from "../components/pagelayout/index";
import { Icon } from "@iconify/react";
import usePageTitle from '../hooks/usePageTitle';

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const { booking } = useBooking();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);
  const [boookingStatus, setBookingStatus] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useGetProfileQuery();
  const [postPayment] = usePostPaymentMutation();
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
    if (!booking?.basePrice || !booking?.totalChargingFee || !booking?.nights) {
      toast.error("Please update all booking information before proceeding.");
      return;
    }

    // Basic profile check
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

    // KYC check temporarily removed for testing
    // if (profileData.data.status !== 'VERIFIED') {
    //   toast.error(
    //     "Your profile needs to be verified before making bookings. Please complete your KYC verification.", 
    //     {
    //       autoClose: 7000,
    //       position: "top-center"
    //     }
    //   );
    //   return;
    // }

    try {
      setBookingStatus(true);

      // First, create the booking with pending status
      const bookingPayload = {
        unit_id: booking?.unitId ?? 0,
        start_date: booking?.checkInDate || "",
        end_date: booking?.checkOutDate || "",
        guests_count: booking?.adults ?? 1,
        unit_count: 1,
        total_price: booking?.totalChargingFee ?? 0,
      };

      const bookingResponse = await createBooking(bookingPayload).unwrap();
      const bookingId = bookingResponse?.data?.id;
      
      if (!bookingId) {
        throw new Error("Booking ID not found");
      }

      toast.success("Booking created successfully!");

      // Then handle payment based on selected method
      if (paymentMethod === "MONNIFY") {
        if (!wallet?.id) {
          throw new Error("Wallet not found");
        }

        const paymentPayload = {
          comment: "Aparte Booking Payment",
          action: "DEBIT",
          amount: booking?.totalChargingFee?.toString() || "0",
          currency: wallet?.currency || "",
          description: `Payment for booking ${bookingId}`,
          type: "PAYMENT",
          email: profileData?.data?.email || "",
          provider: "MONNIFY",
          userId: wallet?.userId ?? 0,
          propertyId: Number(booking?.id) || 0,
        };

        const paymentResponse = await postPayment({ id: wallet.id, payload: paymentPayload }).unwrap();
        setPaymentLink(paymentResponse?.data?.paymentLink || null);
        
        if (paymentResponse?.data?.status?.toLowerCase() === "pending") {
          setPaymentPending(true);
        }

        const transaction_Id = paymentResponse?.data?.id || "";
        const transaction_Ref = paymentResponse?.data?.reference || "";
        const transaction_Status = paymentResponse?.data?.status || "PENDING";

        if (!transaction_Id || !transaction_Ref) {
          throw new Error("Transaction details missing");
        }

        // Update booking status with transaction details
        const bookingStatusPayload = {
          transactionId: transaction_Id,
          transactionRef: transaction_Ref,
          transactionStatus: transaction_Status
        };

        await updateBookingStatus({ bookingId, bookingStatusPayload }).unwrap();

        if (paymentResponse?.data?.paymentLink) {
          window.open(paymentResponse.data.paymentLink, "_blank");
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
          amount: booking?.totalChargingFee?.toString() || "0",
          currency: "NGN",
          description: `Wallet payment for booking ${bookingId}`,
          type: "BOOKING",
          email: profileData?.data?.email || "",
          provider: "",
          propertyId: Number(booking?.id) || 0,
        };

        const paymentResponse = await postPayment({ id: wallet.id, payload: paymentPayload }).unwrap();
        
        if (paymentResponse?.data?.status === "SUCCESS") {
          setPaymentSuccess(true);
          
          // Update booking status for successful wallet payment
          const bookingStatusPayload = {
            transactionId: paymentResponse.data.id,
            transactionRef: paymentResponse.data.reference,
            transactionStatus: "SUCCESS"
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
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('NGN', '₦');
  };

  const handleChangeDate = () => {
    navigate(`/property-details/${booking?.id}`);
  };

  const handleAdjustGuests = () => {
    navigate(`/property-details/${booking?.id}`);
  };

  if (paymentSuccess) {
    // Payment Success View
    return (
      <PageLayout>
        {titleComponent}
        <div className="w-full flex flex-col items-center justify-center p-7 mt-20">
          <div className="lg:w-2/3">
            <div className="flex items-center mb-4 visibility:hidden">
              <div className="mr-4 cursor-pointer" onClick={() => {
                  window.location.href = "/";}}>
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
              <h1 className="text-2xl font-medium ml-0">Payment Successful</h1>
            </div>

            <div className="flex flex-col items-center justify-center p-6 printable-section">
            {bookingError && (
              <p className="text-md font-semibold text-red-600 bg-red-100 px-4 py-3 mb-4 rounded-md border border-red-500 flex items-center gap-2">
                <Icon icon="mdi:alert-circle" className="text-red-600 text-xl" />
                {bookingError}
              </p>
            )}
              <div className="text-center">
                {/* Success Icon and Title */}
                <img src={Success} alt="Success" className="w-24 h-24 mx-auto mb-1" />
                <h1 className="text-[22px] font-medium text-gray-800">
                  Payment Successful!
                </h1>
              </div>

              {/* Amount Section */}
              <div className="mt-4 text-center">
                <p className="text-[12px] text-gray-600">Amount</p>
                <h2 className="text-[20px] font-medium">{formatPrice(booking?.totalChargingFee ?? 0)}</h2>
              </div>

              {/* Booking Details */}
              <div className="mt-6 w-full max-w-xl sm:w-full border rounded-lg bg-white shadow-md">
                <h3 className="text-md font-semibold text-black px-4 py-3">
                  Booking Details
                </h3>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4 space-x-14">
                  <p className="text-black font-medium text-[13px]">{formatPrice(booking?.basePrice ?? 0)} x {booking?.nights} nights</p>
                  <p className="text-gray-500 text-[13px]">Total(NGN) {formatPrice(booking?.totalChargingFee ?? 0)}</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="text-[14px]">Check-in date</p>
                  <p className="text-gray-500 text-[13px]">{booking?.checkInDate}</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="text-[14px]">Check-out date</p>
                  <p className="text-gray-500 text-[13px]">{booking?.checkOutDate}</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex flex-col mb-4 px-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[14px]">Guests</p>
                    <p className="text-gray-500 text-[13px]">{(booking?.adults ?? 0) > 0 && <p>{booking?.adults} Adults</p>}</p>
                  </div>

                  {/* <div className="mt-2 text-right">
                    <p className="text-gray-500 text-[13px]">{booking?.children} Children</p>
                    <p className="text-gray-500 text-[13px]">{booking?.pets} Pets</p>
                  </div> */}
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="font-medium text-[14px]">Transaction Details</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="text-[14px]">Amount paid</p>
                  <p className="text-black font-medium text-[13px]">{formatPrice(booking?.totalChargingFee ?? 0)}</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="text-[14px]">Payment Method</p>
                  <p className="text-black font-medium text-[13px]">{paymentMethod}</p>
                </div>
              </div>

              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="mt-6 px-2 py-1 border border-solid border-gray-500 text-black text-[12px] rounded-md shadow-md hover:bg-[#028090] visibility:hidden"
              >
                Print Receipt 🖨
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }
  if (paymentPending) {
    // Payment Pending View
    return (
      <PageLayout>
        {titleComponent}
        <div className="w-full flex flex-col items-center justify-center p-7 mt-20">
          <div className="lg:w-2/3">
            <div className="flex items-center mb-4 visibility:hidden">
              <div className="mr-4 cursor-pointer" onClick={() => navigate("/")}>
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
              <h1 className="text-2xl font-medium ml-0">Payment Pending</h1>
            </div>

            <div className="flex flex-col items-center justify-center p-6 printable-section">
              <div className="text-center">
                {/* Success Icon and Title */}
                <Icon icon="token-branded:wait" className="w-24 h-24 mx-auto mb-1" />
                <h1 className="text-[22px] font-medium text-gray-800">
                  Payment Pending!
                </h1>
              </div>
              {/* Amount Section */}
              <div className="mt-4 text-center">
                <p className="text-[12px] text-gray-600">Amount</p>
                <h2 className="text-[20px] font-medium">{formatPrice(booking?.totalChargingFee ?? 0)}</h2>
              </div>

              {paymentLink && (
                <button
                  className="mt-6 w-full max-w-[36rem] py-3 bg-[#028090] text-white rounded-md text-[14px]"
                  onClick={() => {
                    if (paymentLink) {
                      window.open(paymentLink, "_blank", "noopener,noreferrer");
                    }
                  }}
                >
                  {`Click here if not redirected to ${paymentMethod} checkout.`}
                </button>
              )}

              {/* Booking Details */}
              <div className="mt-6 w-full max-w-xl sm:w-full border rounded-lg bg-white shadow-md">
                <h3 className="text-md font-semibold text-black px-4 py-3">
                  Booking Details
                </h3>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4 space-x-14">
                  <p className="text-black font-medium text-[13px]">{formatPrice(booking?.basePrice ?? 0)} x {booking?.nights} nights</p>
                  <p className="text-gray-500 text-[13px]">Total(NGN) {formatPrice(booking?.totalChargingFee ?? 0)}</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="text-[14px]">Check-in date</p>
                  <p className="text-gray-500 text-[13px]">{booking?.checkInDate}</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="text-[14px]">Check-out date</p>
                  <p className="text-gray-500 text-[13px]">{booking?.checkOutDate}</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex flex-col mb-4 px-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[14px]">Guests</p>
                    <p className="text-gray-500 text-[13px]">{(booking?.adults ?? 0) > 0 && <p>{booking?.adults} Adults</p>}</p>
                  </div>

                  {/* <div className="mt-2 text-right">
                    <p className="text-gray-500 text-[13px]">{booking?.children} Children</p>
                    <p className="text-gray-500 text-[13px]">{booking?.pets} Pets</p>
                  </div> */}
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="font-medium text-[14px]">Transaction Details</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="text-[14px]">Amount paid</p>
                  <p className="text-black font-medium text-[13px]">{formatPrice(booking?.totalChargingFee ?? 0)}</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="text-[14px]">Payment Method</p>
                  <p className="text-black font-medium text-[13px]">{paymentMethod}</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>
                <div className="flex justify-between items-center mb-4 px-4">
                  <p className="text-[14px]">Payment Status</p>
                  <p className="text-black font-medium text-[13px]">PENDING</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </PageLayout>
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
                    checkInDate: booking?.checkInDate,
                    checkOutDate: booking?.checkOutDate,
                    adults: booking?.adults || 0,
                    children: booking?.children || 0,
                    pets: booking?.pets || 0,
                    nights: booking?.nights || 1,
                    basePrice: booking?.basePrice || 0,
                    totalChargingFee: booking?.totalChargingFee || 0,
                    unitId: booking?.unitId || 0
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
                  <p className="text-gray-600 mt-1">{booking?.checkInDate}</p>
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
                  <p className="text-gray-600 mt-1">{booking?.checkOutDate}</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-medium mb-4">Payment Method</h2>
            <FormControl fullWidth>
              <InputLabel>Select Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Select Payment Method"
              >
                <MenuItem value="">Please Select</MenuItem>
                <MenuItem value="MONNIFY">Pay Online</MenuItem>
                <MenuItem value="WALLET">Pay with Wallet</MenuItem>
              </Select>
            </FormControl>
            
            {paymentMethod === "WALLET" && wallet && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-lg font-semibold text-gray-900">{formatPrice(Number(wallet.balance))}</p>
              </div>
            )}
          </div>
        </div>
  
        {/* Right Section - Booking Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src={booking?.unitImage || Bigimg} 
                alt="Property" 
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {booking?.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {`1 ${booking?.title} for ${booking?.nights} Night${booking?.nights !== 1 ? 's' : ''}`}
                </p>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Icon icon="mdi:account" className="text-gray-500" />
                  Hosted by {booking?.owner?.profile?.firstName} {booking?.owner?.profile?.lastName}
                </p>
              </div>
            </div>
  
            <div className="border-t border-gray-200 pt-4">
              <p className="font-medium text-gray-900 mb-4">Price Details</p>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <p>{formatPrice(booking?.basePrice ?? 0)} × {booking?.nights} nights</p>
                  <p>{formatPrice(booking?.totalChargingFee ?? 0)}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <p>Total</p>
                    <p>{formatPrice(booking?.totalChargingFee ?? 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              className={`w-full py-4 px-4 mt-6 rounded-lg font-medium text-white text-base transition-all
                ${boookingStatus 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : !paymentMethod
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#028090] hover:bg-[#026d7a] active:bg-[#025b66]'}`}
              onClick={handlePaymentMethodChange}
              disabled={boookingStatus || !paymentMethod}
              style={{ 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative',
                zIndex: 10,
                minHeight: '56px'
              }}
            >
              {boookingStatus ? (
                <div className="flex items-center justify-center gap-2">
                  <Icon icon="eos-icons:loading" className="animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : !paymentMethod ? (
                <span>Select Payment Method</span>
              ) : (
                <span>Confirm Booking</span>
              )}
            </button>

            {!paymentMethod && (
              <p className="text-center mt-2 text-sm text-gray-500">
                Please select a payment method to continue
              </p>
            )}
          </div>
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
      </div>
    </PageLayout>
  );
};

export default ConfirmBooking;