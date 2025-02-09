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



const ConfirmBooking = () => {
  const navigate = useNavigate();
  const { booking } = useBooking();
  const [wallet, setWallet] = useState<Wallet | null>(null);
    // State to manage selected payment gateway and payment success
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
    if (paymentMethod === "MONNIFY") {
      const bookingPayload = {
        unit_id: booking?.unitId ?? 0,
        start_date: booking?.checkInDate || "",
        end_date: booking?.checkOutDate || "",
        guests_count: booking?.adults ?? 1,
        unit_count: 1,
        total_price: booking?.totalChargingFee ?? 0,
      };
  
      try {
        setBookingStatus(true);
  
        // First of, Create Booking (POST)
        const bookingResponse = await createBooking(bookingPayload).unwrap();
        console.log("bookingResponse", bookingResponse);
        toast.success("Booking created successfully!");
  
        const bookingId = bookingResponse?.data?.id;
        if (!bookingId) throw new Error("Booking ID not found");
  
        // Seond, Initiate Payment (POST)
        if (wallet?.id) {
          const paymentPayload = {
            comment: "This is Testing",
            action: "DEBIT",
            amount: booking?.totalChargingFee?.toString() || "0",
            currency: wallet?.currency || "",
            description: "Description testing",
            type: "PAYMENT",
            email: profileData?.data?.email || "",
            provider: "MONNIFY",
            userId: wallet?.userId ?? 0,
            propertyId: 0,
          };
  
          const paymentResponse = await postPayment({ id: wallet?.id, payload: paymentPayload }).unwrap();
          console.log("paymentResponse", paymentResponse);
          setPaymentLink(paymentResponse?.data?.paymentLink || null);
          if (paymentResponse?.data?.status?.toLowerCase() === "pending") {
            setPaymentPending(true);
          }
          toast.success(paymentResponse?.message);
  
          const transaction_Id = paymentResponse?.data?.id || "";
          const transaction_Ref = paymentResponse?.data?.reference || "";
          const transaction_Status = paymentResponse?.data?.status || "PENDING";
  
          if (!transaction_Id || !transaction_Ref) throw new Error("Transaction details missing");
  
          // Third Update Booking Status (PUT)
          const bookingStatusPayload = {
            transactionId: transaction_Id,
            transactionRef: transaction_Ref,
            transactionStatus: transaction_Status
          };
  
          const bookingStatusResponse = await updateBookingStatus({ bookingId, bookingStatusPayload }).unwrap();
          toast.success(bookingStatusResponse?.message || "Booking status updated!");
  
          // Open Payment Link if available
          const paymentLink = paymentResponse?.data?.paymentLink;
          if (paymentLink) {
            window.open(paymentLink, "_blank");
          } else {
            toast.error("Payment link not found");
          }
        } else {
          toast.error("Please confirm your wallet");
        }
      } catch (err: any) {
        console.log("API Error:", err);
        const errorMessage = err?.data?.error || err?.error || "An unknown error occurred";
        
        toast.error(`${errorMessage}`);
      } finally {
        setBookingStatus(false);
      }
    } else if (paymentMethod === "WALLET") {
      const payload = {
        userId: wallet?.userId || 0,
        comment: "Lorem Ipsum",
        action: "DEBIT",
        amount: booking?.totalChargingFee?.toString() || "0",
        currency: "NGN",
        description: "Testing Wallet",
        type: "BOOKING",
        email: profileData?.data?.email || "",
        provider: "",
        propertyId: Number(booking?.id) || 0,
      };

      try {
        if (wallet?.id) {
          setBookingStatus(true);
          const response = await postPayment({ id: wallet?.id, payload }).unwrap();
          setPaymentSuccess(true);
          setBookingStatus(false);
          console.log("API Response", response);
          if (response?.message) {
            toast.success(response.message);

            const bookingPayload = {
                unit_id: booking?.unitId ?? 0,
                start_date: booking?.checkInDate || "",
                end_date: booking?.checkOutDate || "",
                guests_count: booking?.adults ?? 1,
                unit_count: 1,
                total_price: booking?.totalChargingFee ?? 0,
            };

            try {
              const bookingResponse = await createBooking(bookingPayload).unwrap();
              toast.success("Booking created successfully!");
              console.log("Toast showed: Booking created successfully");
              setPaymentSuccess(true);
              setBookingStatus(false);
          
              // setTimeout(() => {
              //   window.location.href = "/";
              // }, 2000);
          
              console.log("Booking successful:", bookingResponse);
            } catch (err: any) {
              setBookingStatus(false);
              console.log("API Error:", err);
              const errorMessage = err?.data?.details || err?.data?.error || err?.error || "An unknown error occurred";
              
              setBookingError(errorMessage);
            }
          } else {
              toast.error("Payment successful, but booking failed");
          }
        } else {
          toast.error("Please confirm your wallet");
        }
      } catch (err: any) {
        setBookingStatus(false);
        console.log("API Error:", err);
        const errorMessage = err?.data?.details || err?.data?.error || err?.error || "An unknown error occurred";
        
        toast.error(`${errorMessage}`);
      }
    }

  };

  // Claculate Total nights
  const calculateNights = (checkIn: string, checkOut: string) => {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diffTime = outDate.getTime() - inDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
                  <p className="text-gray-500 text-[13px]">{booking?.adults} Adults</p>
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
    );
  }
  if (paymentPending) {
    // Payment Pending View
    return (
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
                Click here if not redirected to Payment checkout.
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
                  <p className="text-gray-500 text-[13px]">{booking?.adults} Adults</p>
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
    );
  }

  return (
    <PageLayout
      children={
        <div className="flex flex-col lg:flex-row p-4 lg:p-8 gap-8 xl:px-52 pt-20 mt-20">
          {/* Left Section */}
          <div className="lg:w-2/3">
            <div className="flex items-center mb-4">
              <div className="mr-4 cursor-pointer" onClick={() => window.history.back()}>
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
              <h1 className="text-2xl font-bold ml-0">Confirm Booking</h1>
            </div>
    
            {/* Booking Information */}
            <div className="p-6 mb-6 xl:ml-8 lg:ml-8">
              <h2 className="text-xl font-medium mb-2">Your stay information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Check-in date</p>
                    <p className="text-gray-600">{booking?.checkInDate}</p>
                  </div>
                  <span className="text-black cursor-pointer underline" onClick={handleChangeDate}>change date</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Check-out date</p>
                    <p className="text-gray-600">{booking?.checkOutDate}</p>
                  </div>
                  <span className="text-black cursor-pointer underline" onClick={handleChangeDate}>change date</span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Guests</p>
                    <ul className="text-gray-600 space-y-1">
                      <li>{booking?.adults} Adults</li>
                      <li>{booking?.children} Children</li>
                      <li>{booking?.pets} Pets</li>
                    </ul>
                  </div>
                  <span className="text-black cursor-pointer underline self-end" onClick={handleAdjustGuests}>adjust</span>
                </div>
              </div>
            </div>
    
            {/* Payment Section */}
            <div className="w-full mx-auto p-6 xl:ml-8 lg:ml-8">
              <h2 className="text-2xl font-semibold mb-4">Pay</h2>
    
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Select Payment Method</h3>
                <FormControl fullWidth>
                {/* <SelectGroup
                    label="Payment Method"
                    children={
                      <select name="payment">
                        <option value="">{isPaymentsLoading ? "Please wait..." : "---Select---"}</option>
                        {PaymentMethod?.map((pay_method: { key: string, text: string }) => {
                          return (
                            <option key={pay_method?.key} value={pay_method?.key}>
                              {pay_method?.text}
                            </option>
                          );
                        })}
                      </select>
                    }
                  /> */}
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label="Payment Method"
                  >
                    <MenuItem value="">Please Select</MenuItem>
                    <MenuItem value="MONNIFY">MONNIFY</MenuItem>
                    <MenuItem value="WALLET">WALLET</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
          </div>
    
          {/* Right Section */}
          <div className="lg:w-1/3">
            <div className="bg-white border border-solid border-gray-300 shadow-md rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <img src={booking?.unitImage || Bigimg} alt="Apartment" className="w-24 h-24 rounded-lg" />
                <div>
                  <h3 className="font-semibold text-lg">
                    {booking?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                  {`1 ${booking?.title} for (${booking?.checkInDate && booking?.checkOutDate ? calculateNights(booking.checkInDate, booking.checkOutDate) : booking?.nights} Nights)`}
                  </p>
                  {/* <p className="text-black">
                    ★★★★★ 5.0{' '}
                    <span className="text-[#028090]">625 Reviews</span>
                  </p> */}
                </div>
              </div>
    
              <div className="border-t pt-4 mt-4">
                <p className="mt-6 font-semibold">Payment Information</p>
                <div className="flex justify-between">
                  <p className="text-gray-400">{formatPrice(booking?.basePrice ?? 0)} x {booking?.nights} nights</p>
                  <p className="mb-6 text-gray-400">{formatPrice(booking?.totalChargingFee ?? 0)}</p>
                </div>
    
                <hr className="my-4 border-gray-300" />
    
                <div className="flex justify-between items-center">
                  <p className="font-semibold mt-6 mb-4">Total Price</p>
                  <p className="font-semibold mt-6 mb-4">{formatPrice(booking?.totalChargingFee ?? 0)}</p>
                </div>
              </div>
            </div>
            <button
              className="mt-6 w-full py-3 bg-[#028090] text-white rounded-md text-[14px]"
              onClick={handlePaymentMethodChange}
            >
              {boookingStatus ? "Please Wait..." : "Confirm Booking"}
            </button>
          </div>
          <ToastContainer 
            position="top-right" 
            autoClose={3000} 
            newestOnTop 
            style={{ zIndex: 9999 }} 
          />
        </div>
      }
    />
  );
};

export default ConfirmBooking;