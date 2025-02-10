import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import PageLayout from '../components/pagelayout/index';
import { useUpdateBookingTransactionMutation } from '../api/booking';
import { toast } from 'react-toastify';
import Success from '../assets/images/success.png';
import { Icon } from '@iconify/react';

interface Transaction {
  id: string;
  walletId: string;
  userId: number;
  action: string;
  comment: string;
  reference: string;
  paymentReference: string;
  amount: string;
  currency: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingInfo {
  id: number;
  userId: number;
  unitId: number;
  startDate: string;
  endDate: string;
  guestsCount: number;
  totalPrice: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  bookingId: string;
  unitCount: number;
  verificationDate: string | null;
  cancellationReason: string | null;
  transactionRef: string;
  transactionId: string;
  transaction: Transaction;
  unit: Unit;
}

interface Unit {
  id: number;
  name: string;
  description: string;
  pricePerNight: string;
  maxGuests: number;
  bedroomCount: number;
  bathroomCount: number;
  kitchenCount: number;
  livingRoomCount: number;
  cautionFee: string;
  isVerified: boolean;
  isWholeProperty: boolean;
  count: number;
  unitCount: number;
  unitId: number;
  propertyId: number;
  property: {
    id: number;
    ownerId: number;
    name: string;
    description: string;
    address: string;
  };
  meta: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [bookinginfo, setBookingInfo] = useState<BookingInfo | null>(null);
  //   const navigate = useNavigate();
  const paymentReference = searchParams.get('paymentReference');
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [patchBookingStatus, { isLoading }] =
    useUpdateBookingTransactionMutation();

  useEffect(() => {
    if (paymentReference) {
      patchBookingStatus({ transaction_ref: paymentReference })
        .unwrap()
        .then((response) => {
          setBookingInfo(response?.data);
          toast.success(response.message);
        })
        .catch((error) => {
          console.error('API Error:', error);
          toast.error(error?.error || 'Failed to update booking');
          setBookingError(error?.error);
        });
    }
  }, [paymentReference, patchBookingStatus]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  console.log('bookinginfo', bookinginfo);

  return (
    <PageLayout
      children={
        <>
          {/* <div className="flex flex-col items-center justify-center h-full">
            {isLoading && <p className="text-gray-500">Updating booking...</p>}
            {isSuccess && (
              <p className="text-green-500">Payment confirmed successfully!</p>
            )}
            {isError && (
              <p className="text-red-500">Error updating payment status</p>
            )}
          </div> */}
          <div className="w-full flex flex-col items-center justify-center p-7 mt-20">
            <div className="lg:w-2/3">
              <div className="flex items-center mb-4 visibility:hidden">
                <div
                  className="mr-4 cursor-pointer"
                  onClick={() => {
                    window.location.href = '/';
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
                <h1 className="text-2xl font-medium ml-0">
                  Payment Validation
                </h1>
              </div>

              <div className="flex flex-col items-center justify-center p-6 printable-section">
                {isLoading ? (
                  <Skeleton
                    width={415}
                    height={100}
                    sx={{ borderRadius: '10px', mt: 2 }}
                  />
                ) : (
                  <div className="text-center">
                    {/* Success Icon and Title */}
                    {bookinginfo?.status.toLocaleLowerCase() === 'confirmed' ? (
                      <>
                        <img
                          src={Success}
                          alt="Success"
                          className="w-24 h-24 mx-auto mb-1"
                        />
                        <h1 className="text-[22px] font-medium text-gray-800">
                          Payment Successful!
                        </h1>
                      </>
                    ) : (
                      bookingError && (
                        <p className="text-md font-semibold text-red-600 bg-red-100 px-4 py-3 mb-4 rounded-md border border-red-500 flex items-center gap-2">
                          <Icon
                            icon="mdi:alert-circle"
                            className="text-red-600 text-xl"
                          />
                          {bookingError}
                        </p>
                      )
                    )}
                  </div>
                )}
                {isLoading ? (
                  <Skeleton
                    width={415}
                    height={300}
                    sx={{ borderRadius: '10px', mt: 2 }}
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-[12px] text-gray-600">Amount</p>
                    <h2 className="text-[20px] font-medium">
                      NGN{' '}
                      {(bookinginfo?.totalPrice &&
                        Number(bookinginfo.totalPrice).toLocaleString()) ||
                        '--/--'}
                    </h2>
                  </div>
                )}
                {isLoading ? (
                  <Skeleton
                    width={415}
                    height={300}
                    sx={{ borderRadius: '10px', mt: 2 }}
                  />
                ) : (
                  <div className="w-full max-w-xl sm:w-full border rounded-lg bg-white shadow-md">
                    <h3 className="text-md font-semibold text-black px-4 py-3">
                      Booking Details
                    </h3>

                    <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                    <div className="flex justify-between items-center mb-4 px-4 space-x-14">
                      <p className="text-black font-medium text-[13px]">
                        {bookinginfo?.startDate && bookinginfo?.endDate
                          ? `${
                              new Date(bookinginfo.endDate).getDate() -
                              new Date(bookinginfo.startDate).getDate()
                            } nights`
                          : '0 nights'}
                      </p>
                      <p className="text-gray-500 text-[13px]">
                        Total(NGN){' '}
                        {(bookinginfo?.totalPrice &&
                          Number(bookinginfo.totalPrice).toLocaleString()) ||
                          '--/--'}
                      </p>
                    </div>

                    <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                    <div className="flex justify-between items-center mb-4 px-4">
                      <p className="text-[14px]">Check-in date</p>
                      <p className="text-gray-500 text-[13px]">
                        {bookinginfo?.startDate || '--/--'}
                      </p>
                    </div>

                    <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                    <div className="flex justify-between items-center mb-4 px-4">
                      <p className="text-[14px]">Check-out date</p>
                      <p className="text-gray-500 text-[13px]">
                        {bookinginfo?.endDate || '--/--'}
                      </p>
                    </div>

                    <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                    <div className="flex flex-col mb-4 px-4">
                      <div className="flex justify-between items-center">
                        <p className="text-[14px]">Apartment Type</p>
                        <p className="text-gray-500 text-[13px]">
                          {bookinginfo?.unit?.name || '--/--'}
                        </p>
                      </div>

                      {/* <div className="mt-2 text-right">
                  <p className="text-gray-500 text-[13px]">{booking?.children} Children</p>
                  <p className="text-gray-500 text-[13px]">{booking?.pets} Pets</p>
                  </div> */}
                    </div>

                    <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                    <div className="flex justify-between items-center mb-4 px-4">
                      <p className="font-medium text-[14px]">
                        Transaction Details
                      </p>
                    </div>

                    <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                    <div className="flex justify-between items-center mb-4 px-4">
                      <p className="text-[14px]">Transaction Reference: </p>
                      <p className="text-black font-medium text-[13px]">
                        {bookinginfo?.transaction?.reference || '--/--'}
                      </p>
                    </div>

                    <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                    <div className="flex justify-between items-center mb-4 px-4">
                      <p className="text-[14px]">Payment Status</p>
                      <p className="text-black font-medium text-[13px]">
                        {bookinginfo?.status || '--/--'}
                      </p>
                    </div>
                    <div className="border-t border-solid border-gray-200 w-full mb-4"></div>

                    <div className="flex justify-between items-center mb-4 px-4">
                      <p className="text-[14px]">Updated At</p>
                      <p className="text-black font-medium text-[13px]">{`${
                        bookinginfo?.updatedAt.substring(0, 10) || '--/--'
                      } || ${
                        bookinginfo?.updatedAt.substring(11, 16) || '--/--'
                      }`}</p>
                    </div>
                  </div>
                )}
                {/* Prnt Button */}
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
