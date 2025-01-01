import { MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Bigimg from '../assets/images/Apartment/Bigimg.png';
import Success from '../assets/images/success.png';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const ConfirmBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    title,
    checkInDate,
    checkOutDate,
    adults,
    children,
    pets,
    nights,
    basePrice,
    totalChargingFee
  } = location.state;

  const paystackPublicKey = 'pk_test_911724ae4c8f6cb5435f01f80b9a4845fb0adea9';

  // State to manage selected payment gateway and payment success
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = () => {
    if (paymentMethod !== 'Paystack') {
      alert('Please select Paystack as the payment method');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: 'aparte@example.com',
      amount: totalChargingFee * 100, // Paystack amount is in kobo
      currency: 'NGN',
      ref: '' + new Date().getTime(),
      callback: (response: { reference: string }) => {
        alert('Payment complete! Reference: ' + response.reference);
        setPaymentSuccess(true);
      },
      onClose: () => {
        alert('Transaction was not completed.');
      },
    });
    handler.openIframe();
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
    navigate('/property-details', {
      state: {
        title,
        checkInDate,
        checkOutDate,
        adults,
        children,
        pets,
        nights,
        basePrice,
        totalChargingFee
      }
    });
  };

  const handleAdjustGuests = () => {
    navigate('/property-details', {
      state: {
        title,
        checkInDate,
        checkOutDate,
        adults,
        children,
        pets,
        nights,
        basePrice,
        totalChargingFee
      }
    });
  };

  if (paymentSuccess) {
    // Payment Success View
    return (
      <div className="w-full flex flex-col items-center justify-center p-4 pt-20 lg:pt-6">
        <div className="lg:w-2/3">
          <div className="flex items-center mb-4 visibility:hidden">
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
            <h1 className="text-2xl font-medium ml-0">Payment Successful</h1>
          </div>

          <div className="flex flex-col items-center justify-center p-6 printable-section">
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
              <h2 className="text-[20px] font-medium">{formatPrice(totalChargingFee)}</h2>
            </div>

            {/* Booking Details */}
            <div className="mt-6 w-full max-w-xl sm:w-full border rounded-lg bg-white shadow-md">
              <h3 className="text-md font-semibold text-black px-4 py-3">
                Booking Details
              </h3>

              <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

              <div className="flex justify-between items-center mb-4 px-4 space-x-14">
                <p className="text-black font-medium text-[13px]">{formatPrice(basePrice)} x {nights} nights</p>
                <p className="text-gray-500 text-[13px]">Total(NGN) {formatPrice(totalChargingFee)}</p>
              </div>

              <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

              <div className="flex justify-between items-center mb-4 px-4">
                <p className="text-[14px]">Check-in date</p>
                <p className="text-gray-500 text-[13px]">{checkInDate}</p>
              </div>

              <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

              <div className="flex justify-between items-center mb-4 px-4">
                <p className="text-[14px]">Check-out date</p>
                <p className="text-gray-500 text-[13px]">{checkOutDate}</p>
              </div>

              <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

              <div className="flex flex-col mb-4 px-4">
                <div className="flex justify-between items-center">
                  <p className="text-[14px]">Guests</p>
                  <p className="text-gray-500 text-[13px]">{adults} Adults</p>
                </div>

                <div className="mt-2 text-right">
                  <p className="text-gray-500 text-[13px]">{children} Children</p>
                  <p className="text-gray-500 text-[13px]">{pets} Pets</p>
                </div>
              </div>

              <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

              <div className="flex justify-between items-center mb-4 px-4">
                <p className="font-medium text-[14px]">Transaction Details</p>
              </div>

              <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

              <div className="flex justify-between items-center mb-4 px-4">
                <p className="text-[14px]">Amount paid</p>
                <p className="text-black font-medium text-[13px]">{formatPrice(totalChargingFee)}</p>
              </div>

              <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

              <div className="flex justify-between items-center mb-4 px-4">
                <p className="text-[14px]">Payment Method</p>
                <p className="text-black font-medium text-[13px]">Paystack</p>
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

  return (
    <div className="flex flex-col lg:flex-row p-4 lg:p-8 gap-8 xl:px-52 pt-20">
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
                <p className="text-gray-600">{checkInDate}</p>
              </div>
              <span className="text-black cursor-pointer underline" onClick={handleChangeDate}>change date</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Check-out date</p>
                <p className="text-gray-600">{checkOutDate}</p>
              </div>
              <span className="text-black cursor-pointer underline" onClick={handleChangeDate}>change date</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">Guests</p>
                <ul className="text-gray-600 space-y-1">
                  <li>{adults} Adults</li>
                  <li>{children} Children</li>
                  <li>{pets} Pets</li>
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
            <h3 className="text-lg font-medium mb-2">Select Payment Gateway</h3>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="Paystack">Paystack</MenuItem>
                <MenuItem value="Flutterwave">Flutterwave</MenuItem>
                <MenuItem value="Visa">Visa</MenuItem>
                <MenuItem value="Verve">Verve</MenuItem>
              </Select>
            </FormControl>
          </div>

          {paymentMethod === 'Paystack' && (
            <button
              onClick={handlePayment}
              className="w-full bg-[#028090] text-white p-2 rounded"
            >
              Pay with Paystack
            </button>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="lg:w-1/3">
        <div className="bg-white border border-solid border-gray-300 shadow-md rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <img src={Bigimg} alt="Apartment" className="w-24 h-24 rounded-lg" />
            <div>
              <h3 className="font-semibold text-lg">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                6 Spacious Bedrooms: All en-suite
              </p>
              <p className="text-black">
                ★★★★★ 5.0{' '}
                <span className="text-[#028090]">625 Reviews</span>
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="mt-6 font-semibold">Payment Information</p>
            <div className="flex justify-between">
              <p className="text-gray-400">{formatPrice(basePrice)} x {nights} nights</p>
              <p className="mb-6 text-gray-400">{formatPrice(totalChargingFee)}</p>
            </div>

            <hr className="my-4 border-gray-300" />

            <div className="flex justify-between items-center">
              <p className="font-semibold mt-6 mb-4">Total Price</p>
              <p className="font-semibold mt-6 mb-4">{formatPrice(totalChargingFee)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;