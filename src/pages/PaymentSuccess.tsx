import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/pagelayout/index';
import { useUpdateBookingTransactionMutation } from '../api/booking';
import { toast } from 'react-toastify';
import Success from "../assets/images/success.png";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentReference = searchParams.get('paymentReference');

  const [patchBookingStatus, { isLoading, isError, isSuccess }] =
    useUpdateBookingTransactionMutation();

  useEffect(() => {
    if (paymentReference) {
      patchBookingStatus({ transaction_ref: paymentReference })
        .unwrap()
        .then((response) => {
          toast.success(response.message);
        })
        .catch((error) => {
          toast.error(error?.data?.error || 'Failed to update booking');
        });
    }
  }, [paymentReference, patchBookingStatus]);

  return (
    <PageLayout
      children={
        <>
          <div className="flex flex-col items-center justify-center h-full">
            {isLoading && <p className="text-gray-500">Updating booking...</p>}
            {isSuccess && (
              <p className="text-green-500">Payment confirmed successfully!</p>
            )}
            {isError && (
              <p className="text-red-500">Error updating payment status</p>
            )}
          </div>
          <div className="w-full flex flex-col items-center justify-center p-7 mt-20">
            <div className="lg:w-2/3">
            <div className="flex items-center mb-4 visibility:hidden">
                <div className="mr-4 cursor-pointer" onClick={() => {window.location.href = "/";}}>
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
                <h1 className="text-2xl font-medium ml-0">Payment Validation</h1>
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
                <h2 className="text-[20px] font-medium">0.00</h2>
                </div>

                {/* Booking Details */}
                <div className="mt-6 w-full max-w-xl sm:w-full border rounded-lg bg-white shadow-md">
                <h3 className="text-md font-semibold text-black px-4 py-3">
                    Booking Details
                </h3>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4 space-x-14">
                    <p className="text-black font-medium text-[13px]">0 nights</p>
                    <p className="text-gray-500 text-[13px]">Total(NGN) 0</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                    <p className="text-[14px]">Check-in date</p>
                    <p className="text-gray-500 text-[13px]">No Date</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                    <p className="text-[14px]">Check-out date</p>
                    <p className="text-gray-500 text-[13px]">No Date</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex flex-col mb-4 px-4">
                    <div className="flex justify-between items-center">
                    <p className="text-[14px]">Guests</p>
                    <p className="text-gray-500 text-[13px]">0 Adults</p>
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
                    <p className="text-black font-medium text-[13px]">N 0.00</p>
                </div>

                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                    <p className="text-[14px]">Payment Method</p>
                    <p className="text-black font-medium text-[13px]">None</p>
                </div>
                <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                <div className="flex justify-between items-center mb-4 px-4">
                    <p className="text-[14px]">Payment Status</p>
                    <p className="text-black font-medium text-[13px]">None</p>
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
        </>
      }
    />
  );
};

export default PaymentSuccess;
