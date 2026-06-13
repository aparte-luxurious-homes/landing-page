import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useUpdateBookingTransactionMutation } from '../api/booking';
import { toast } from 'react-toastify';
import SuccessIcon from '../assets/images/success.png';
import { Skeleton } from '@mui/material';
import PayoutNudgeModal from '../components/booking/PayoutNudgeModal';
import {
  isPayoutNudgePendingForBooking,
  isPayoutNudgeModalDismissedForBooking,
  setPayoutNudgeModalDismissedForBooking,
} from '../utils/payoutNudge';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookinginfo, setBookingInfo] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [payoutNudgeOpen, setPayoutNudgeOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  // Monnify appends `paymentReference`. Paystack appends `reference` AND
  // `trxref` (same value). Read all three so the page works regardless of
  // which gateway the booking was charged through.
  const paymentReference =
    searchParams.get("paymentReference") ||
    searchParams.get("reference") ||
    searchParams.get("trxref");
  const bookingId = searchParams.get("bookingId");
  const sanitizedReference = paymentReference?.replace(/^["']|["']$/g, "").trim() || "";
  const provider = searchParams.get("provider") || (() => {
    if (sanitizedReference.startsWith("PAYSTACK") || sanitizedReference.startsWith("APRT-PYK-")) return "PAYSTACK";
    if (sanitizedReference.startsWith("FLUTTERWAVE") || sanitizedReference.startsWith("APRT-FLW-")) return "FLUTTERWAVE";
    if (sanitizedReference.startsWith("MONNIFY") || sanitizedReference.startsWith("APRT-MNF-")) return "MONNIFY";
  })();

  const [patchBookingStatus, { isLoading }] =
    useUpdateBookingTransactionMutation();

  useEffect(() => {
    if (
      bookinginfo?.status === 'PENDING' &&
      bookingId &&
      isPayoutNudgePendingForBooking(bookingId) &&
      !isPayoutNudgeModalDismissedForBooking(bookingId)
    ) {
      setPayoutNudgeOpen(true);
    }
  }, [bookinginfo?.status, bookingId]);

  const dismissPayoutNudge = () => {
    if (bookingId) setPayoutNudgeModalDismissedForBooking(bookingId);
    setPayoutNudgeOpen(false);
  };

  const goToBankDetails = () => {
    dismissPayoutNudge();
    navigate('/account?tab=wallet&bankDetails=1');
  };

  // Initial fetch
  useEffect(() => {
    if (paymentReference) {
      patchBookingStatus({
        booking_id: bookingId || null,
        reference: sanitizedReference,
        gateway: provider,
      })
        .unwrap()
        .then((response) => {
          setBookingInfo(response?.data);
          toast.success(response.message);
        })
        .catch((error) => {
          const errorMsg =
            error?.data?.detail?.message ||
            error?.data?.detail ||
            error?.data?.message ||
            'An error occurred while validating booking';

          if (typeof errorMsg === 'string') {
            setBookingError(errorMsg);
            toast.error(errorMsg);
          } else if (Array.isArray(errorMsg)) {
            errorMsg.forEach((msg: any) => {
              if (typeof msg === 'string') {
                toast.error(msg);
              } else {
                toast.error(JSON.stringify(msg));
              }
            });
          } else {
            toast.error('An unknown error occurred while validating booking');
          }
        });
    }
  }, [paymentReference, patchBookingStatus]);

  // Auto-retry for PENDING status
  useEffect(() => {
    if (bookinginfo?.status === 'PENDING') {
      const retryInterval = setInterval(() => {
        setRetryCount((prev) => prev + 1);

        patchBookingStatus({
          booking_id: bookingId || null,
          reference: sanitizedReference,
          gateway: provider,
        })
          .unwrap()
          .then((response) => {
            setBookingInfo(response?.data);
            if (response?.data?.status !== 'PENDING') {
              clearInterval(retryInterval);
              setRetryCount(0);
              if (response?.data?.status === 'CONFIRMED') {
                toast.success('Payment confirmed!');
              } else if (response?.data?.status === 'CANCELLED') {
                toast.error('Payment failed');
              }
            }
          })
          .catch((error) => {
            console.error('Retry failed:', error);
          });
      }, 5000);

      const timeout = setTimeout(() => {
        clearInterval(retryInterval);
        if (bookinginfo?.status === 'PENDING') {
          toast.warning(
            'Payment verification taking longer than expected. Please check back later.'
          );
        }
      }, 120000);

      return () => {
        clearInterval(retryInterval);
        clearTimeout(timeout);
      };
    }
  }, [
    bookinginfo?.status,
    patchBookingStatus,
    bookingId,
    sanitizedReference,
    retryCount,
  ]);

  const handleManualRetry = () => {
    toast.info('Verifying payment status...');
    patchBookingStatus({
      booking_id: bookingId || null,
      reference: sanitizedReference,
      gateway: provider,
    })
      .unwrap()
      .then((response) => {
        setBookingInfo(response?.data);
        setBookingError(null);
        if (response?.data?.status === 'CONFIRMED') {
          toast.success('Payment confirmed!');
        }
      })
      .catch((error) => {
        const errorMsg =
          error?.data?.detail?.message ||
          error?.data?.message ||
          'Retry failed';
        setBookingError(errorMsg);
        toast.error(errorMsg);
      });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '--/--';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    if (!price) return '0.00';
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div
      id="payment-success-print-root"
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 print:block print:min-h-0 print:py-4 print:px-2"
    >
      <div className="max-w-3xl w-full print:max-w-none">
        {/* Main Card */}
        <div
          id="receipt-content"
          className="bg-white rounded-2xl shadow-xl overflow-hidden print:overflow-visible border border-gray-100 transition-all duration-300 hover:shadow-2xl"
        >
          {isLoading ? (
            <div className="p-8 sm:p-12 text-center">
              <Skeleton
                variant="circular"
                width={80}
                height={80}
                className="mx-auto mb-6"
              />
              <Skeleton
                variant="text"
                width="60%"
                height={40}
                className="mx-auto mb-4"
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={200}
                className="rounded-xl"
              />
            </div>
          ) : (
            <>
              {/* Header Status Section */}
              <div className="p-8 sm:p-12 text-center border-b border-gray-50 bg-gradient-to-b from-white to-gray-50/50">
                {bookinginfo?.status === 'CONFIRMED' ? (
                  <div className="animate-in fade-in zoom-in duration-500">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
                      <img
                        src={SuccessIcon}
                        alt="Success"
                        className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto grayscale-0"
                      />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                      Booking Confirmed!
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">
                      Your stay at{' '}
                      <span className="text-[#028090] font-semibold">
                        {bookinginfo?.property?.name || 'Aparte'}
                      </span>{' '}
                      is secured.
                    </p>
                  </div>
                ) : bookinginfo?.status === 'PENDING' ? (
                  <div className="animate-in fade-in duration-500">
                    <div className="mb-6">
                      <Icon
                        icon="line-md:loading-loop"
                        className="w-24 h-24 mx-auto text-[#028090]"
                      />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      Verifying Payment
                    </h1>
                    <p className="text-gray-600 mb-6">
                      Please stay on this page while we confirm your
                      transaction.
                    </p>
                    {retryCount > 0 && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                        </span>
                        Attempt {retryCount} of 24
                      </div>
                    )}
                    <div className="mt-8">
                      <button
                        onClick={handleManualRetry}
                        className="px-8 py-3 bg-[#028090] text-white font-semibold rounded-xl hover:bg-[#026c7a] transition-all transform hover:scale-105 active:scale-95 shadow-md"
                      >
                        Check Status Now
                      </button>
                    </div>
                  </div>
                ) : bookinginfo?.status === "CANCELLED" && bookinginfo?.payment_status === "SUCCESSFUL" ? (
                  // Orphan-payment race: payment was received but the booking
                  // was already cancelled (typically by the agent/owner who
                  // created it on the guest's behalf). The backend issues an
                  // automatic refund to the guest's wallet — we surface that
                  // outcome instead of a generic "validation failed".
                  <div className="animate-in fade-in duration-500">
                    <Icon icon="mdi:cash-refund" className="w-24 h-24 mx-auto mb-6 text-amber-500" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Booking Was Cancelled</h1>
                    <p className="text-gray-600 mb-2 max-w-md mx-auto">
                      Your payment came through, but this booking had already been cancelled.
                    </p>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      We've credited the amount back to your Aparté wallet — you can use it for another booking or contact support to request a transfer.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => navigate("/")}
                        className="px-8 py-3 bg-[#028090] text-white font-semibold rounded-xl hover:bg-[#026c7a] transition"
                      >
                        Browse Properties
                      </button>
                      <a
                        href="/contact"
                        className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition text-center"
                      >
                        Contact Support
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500">
                    <Icon
                      icon="tabler:circle-x-filled"
                      className="w-24 h-24 mx-auto mb-6 text-red-500"
                    />
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                      Validation Failed
                    </h1>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {bookingError ||
                        "We couldn't verify your payment. Please check your transaction reference and try again."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={handleManualRetry}
                        className="px-8 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition"
                      >
                        Retry Validation
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-gray-200 text-gray-800 font-semibold rounded-xl hover:bg-gray-300 transition"
                      >
                        Back to Home
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Details Section */}
              {bookinginfo && bookinginfo.status === 'CONFIRMED' && (
                <div className="p-8 sm:p-12 space-y-10">
                  {/* Property Card */}
                  <div className="bg-[#f0f9fa] rounded-2xl p-6 border border-[#e0f1f3] flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="p-4 bg-white rounded-xl shadow-sm border border-[#d0eef1]">
                      <Icon
                        icon="mdi:home-city"
                        className="w-10 h-10 text-[#028090]"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {bookinginfo?.property?.name}
                      </h3>
                      <p className="text-[#028090] font-medium mb-1">
                        {bookinginfo?.unit?.name}
                      </p>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <Icon icon="mdi:map-marker" className="text-gray-400" />
                        {bookinginfo?.property?.address}
                      </p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                      Reservation Summary
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                      <DetailItem
                        icon="mdi:currency-ngn"
                        label="Total Amount Paid"
                        value={`₦${formatPrice(bookinginfo?.total_price)}`}
                        valueClass="text-2xl font-bold text-gray-900"
                      />
                      <DetailItem
                        icon="mdi:check-decagram"
                        label="Booking Status"
                        value={bookinginfo?.status}
                        valueClass="text-lg font-bold text-green-600"
                      />
                      <DetailItem
                        icon="mdi:calendar-import"
                        label="Check-in Date"
                        value={formatDate(bookinginfo?.start_date)}
                      />
                      <DetailItem
                        icon="mdi:calendar-export"
                        label="Check-out Date"
                        value={formatDate(bookinginfo?.end_date)}
                      />
                      <DetailItem
                        icon="mdi:account-group"
                        label="Guests"
                        value={`${bookinginfo?.guests_count || 0} People`}
                      />
                      <DetailItem
                        icon="mdi:identifier"
                        label="Booking ID"
                        value={bookinginfo?.booking_id}
                        valueClass="font-mono text-sm bg-gray-100 px-2 py-1 rounded"
                      />
                    </div>
                  </div>

                  {/* Transaction Reference (Full Width) */}
                  <div className="pt-8 border-t border-gray-100">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                      Transaction Reference
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 group relative overflow-hidden">
                      <p className="font-mono text-sm text-gray-600 break-all leading-relaxed pr-8">
                        {sanitizedReference}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sanitizedReference);
                          toast.success('Reference copied!');
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg transition-colors text-gray-400 hover:text-[#028090]"
                        title="Copy Reference"
                      >
                        <Icon icon="mdi:content-copy" className="text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-10 flex flex-col sm:flex-row gap-4 print:hidden">
                    <button
                      onClick={() => navigate('/')}
                      className="flex-1 px-8 py-4 bg-[#028090] text-white font-bold rounded-xl hover:bg-[#026c7a] transition-all shadow-lg hover:shadow-[#028090]/20 flex items-center justify-center gap-2"
                    >
                      <Icon icon="mdi:home" className="text-xl" />
                      Back to Home
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex-1 px-8 py-4 bg-white text-[#028090] font-bold rounded-xl border-2 border-[#028090] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Icon icon="mdi:printer" className="text-xl" />
                      Download Receipt
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Info */}
        {!isLoading && bookinginfo?.status === 'CONFIRMED' && (
          <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 print:hidden">
            <p className="text-gray-500 text-sm">
              A confirmation email has been sent to your registered address.
              <br />
              Need help?{' '}
              <a
                href="/contact"
                className="text-[#028090] font-semibold underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        )}
      </div>

      <PayoutNudgeModal
        open={payoutNudgeOpen}
        onClose={dismissPayoutNudge}
        onAddBankDetails={goToBankDetails}
      />

      <style>{`
        @media print {
          html, body {
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #payment-success-print-root {
            display: block !important;
            min-height: 0 !important;
            height: auto !important;
            padding: 8px !important;
            background: white !important;
          }
          #receipt-content {
            position: static !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            page-break-inside: auto;
            break-inside: auto;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
        @page {
          margin: 12mm;
        }
      `}</style>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  valueClass = 'text-lg font-semibold text-gray-800',
}: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 p-2 bg-gray-50 rounded-lg border border-gray-100 text-gray-400">
        <Icon icon={icon} className="text-xl" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight mb-1">
          {label}
        </p>
        <p className={valueClass}>{value || '--/--'}</p>
      </div>
    </div>
  );
}
