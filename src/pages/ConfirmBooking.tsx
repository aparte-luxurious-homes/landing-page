import { MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useState } from 'react';
import Bigimg from '../assets/images/Apartment/Bigimg.png';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const ConfirmBooking = () => {
 
  const paystackPublicKey = 'pk_test_911724ae4c8f6cb5435f01f80b9a4845fb0adea9'; 
  
  // State to manage selected payment gateway
  const [paymentMethod, setPaymentMethod] = useState('');

  const handlePayment = () => {
    if (paymentMethod !== 'Paystack') {
      alert('Please select Paystack as the payment method');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: paystackPublicKey,
      email: 'aparte@example.com', 
      amount: 1625000000, 
      currency: 'NGN', 
      ref: '' + new Date().getTime(), 
      callback: (response: { reference: string }) => {
        alert('Payment complete! Reference: ' + response.reference);
      },
      onClose: () => {
        alert('Transaction was not completed.');
        
      },
    });
    handler.openIframe(); 
  };

  return (
    <div className="flex flex-col lg:flex-row p-4 lg:p-8 gap-8 xl:px-52 pt-20">
      {/* Left Section */}
      <div className="lg:w-2/3">
        <div className="flex items-center mb-4 ">
        <div className="mr-4">
        <svg width="40" height="40" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="30" fill="#191919"/>
        <path d="M32.1377 24.1294L27.139 29.1281C26.5487 29.7184 26.5487 30.6844 27.139 31.2748L32.1377 36.2734" stroke="white" stroke-width="2.33538" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>

          </div>
          <h1 className="text-2xl font-bold ml-0">Confirm Booking</h1>
        </div>

        <div className="p-6 mb-6 ml-2">
          <h2 className="text-xl font-medium mb-2">Your stay information</h2>
          <div className="space-y-4">
            {/* Check-in Date */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Check-in date</p>
                <p className="text-gray-600">November 22, 2024</p>
              </div>
              <span className="text-black cursor-pointer">change date</span>
            </div>

            {/* Check-out Date */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Check-out date</p>
                <p className="text-gray-600">November 27, 2024</p>
              </div>
              <span className="text-black cursor-pointer">change date</span>
            </div>

            {/* Guests */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">Guests</p>
                <ul className="text-gray-600 space-y-1">
                  <li>6 Adults</li>
                  <li>2 Children</li>
                  <li>2 Pets</li>
                </ul>
              </div>
              <span className="text-black cursor-pointer self-end">adjust</span>
            </div>
          </div>
        </div>

        <hr className="my-4 border-gray-300" />

        <div className="p-6 mb-4 ml-2">
          <h2 className="text-xl font-semibold mb-4">Cancellation policy</h2>
          <p>Kindly make sure to cancel 3 days before the booking date.</p>
        </div>

        <hr className="my-6 border-gray-300" />

        <div className="p-6 ml-2">
          <h2 className="text-xl font-semibold mb-4">House rules</h2>
          <p className="mb-2">We implore every guest to remember a few simple things about what makes a great guest.</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Check-in before 12:00 pm</li>
            <li>Check-out immediately after 11:45 am</li>
            <li>Maximum of 15 guests</li>
          </ul>
        </div>

        <hr className="my-6 border-gray-300" />

        <div className="w-full mx-auto p-6">
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

          <div className="w-full mt-6">
            <div className="p-4 rounded-lg mb-6">
              {paymentMethod === 'Paystack' && (
                <button onClick={handlePayment} className="w-full bg-[#028090] text-white p-2 rounded">
                  Pay with Paystack
                </button>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-6">
            By selecting the button below, I agree to Aparté Nigeria’s 
            <a href="#" className="text-blue-500"> House Rules</a>, 
            <a href="#" className="text-blue-500"> Guest Conduct Guidelines</a>, 
            and <a href="#" className="text-blue-500"> Refund Policy</a>.
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="lg:w-1/3">
        <div className="bg-white border border-solid border-gray-300 shadow-md rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={Bigimg}
              alt="Apartment"
              className="w-24 h-24 rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-lg">The Skyline Haven Apartment, Lagos</h3>
              <p className="text-sm text-gray-600">6 Spacious Bedrooms: All en-suite</p>
              <p className="text-black">★★★★★ 5.0 <span className="text-gray-600">625 Reviews</span></p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="mt-6 font-semibold">Payment Information</p>
            <div className="flex justify-between">
              <p className="text-gray-400">₦325,000 x 5 nights</p>
              <p className="mb-6 text-gray-400">₦1,625,000</p>
            </div>

            <hr className="my-4 border-gray-300" />

            <div className="flex justify-between items-center">
              <p className="font-semibold mt-6 mb-4">Total Price</p>
              <p className="font-semibold mt-6 mb-4">₦1,625,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBooking;
