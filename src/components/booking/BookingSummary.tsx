'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import Bigimg from '../../assets/images/Apartment/Bigimg.png';
import { describeHire, hireCount } from '../../utils/eventCentre';

interface BookingSummaryProps {
  booking: any;
  paymentMethod: string;
  isProcessing: boolean;
  onConfirm: () => void;
  formatPrice: (price: number) => string;
  bookingMode?: string;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  booking,
  paymentMethod,
  isProcessing,
  onConfirm,
  formatPrice,
  bookingMode,
}) => {
  const isRequestToBook = bookingMode === 'REQUEST_TO_BOOK';

  // A wallet payment carries no gateway processing fee. When the guest picks
  // "Pay with Wallet" the amount they are charged (and shown) is the fee-free
  // total_price; the online option keeps the gateway total. `processingFee` is
  // the difference, surfaced as its own line only for online payments.
  const feeFreeTotal = booking?.total_price ?? booking?.total_charging_fee ?? 0;
  const gatewayTotal = booking?.total_charging_fee ?? 0;
  const processingFee = Math.max(0, gatewayTotal - feeFreeTotal);
  const displayTotal = paymentMethod === 'WALLET' ? feeFreeTotal : gatewayTotal;

  const hire = hireCount(booking ?? {});

  const SERIF = 'Fraunces, ui-serif, Georgia, serif';
  const enabled = !isProcessing && (isRequestToBook || !!paymentMethod);

  return (
    <div className="bg-white rounded-[28px] shadow-[0_24px_48px_-16px_rgba(25,25,25,0.2)] border border-black/5 overflow-hidden lg:sticky lg:top-28">
      <div className="relative h-44">
        <img
          src={booking?.unit_image || Bigimg}
          alt="Property"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h3 className="text-xl font-semibold leading-tight" style={{ fontFamily: SERIF }}>
            {booking?.title}
          </h3>
          <p className="text-sm text-white/85 mt-1">
            {hire.isVenue
              ? describeHire(booking ?? {})
              : `${booking?.unit_count} unit${booking?.unit_count !== 1 ? 's' : ''} · ${booking?.nights} night${booking?.nights !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="p-5 md:p-6">
        <p className="flex items-center gap-2 text-sm text-gray-600 mb-5">
          <Icon icon="mdi:account-circle-outline" width={20} className="text-gray-400" />
          Hosted by {booking?.owner?.profile?.firstName || 'Aparte'}{' '}
          {booking?.owner?.profile?.lastName || ''}
        </p>

        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          {booking?.isExtension ? 'Extension details' : 'Price details'}
        </p>
        <div className="space-y-2.5 text-[15px]">
          <div className="flex justify-between gap-4 text-gray-700">
            <p>
              {formatPrice(booking?.base_price ?? 0)} × {hire.count}{' '}
              {booking?.isExtension ? 'extra ' : ''}{hire.word} × {booking?.unit_count} {hire.unitWord}
              {booking?.unit_count !== 1 ? 's' : ''}
            </p>
            <p className="shrink-0 font-medium">
              {formatPrice(
                (booking?.base_price ?? 0) *
                  hire.count *
                  (booking?.unit_count ?? 1)
              )}
            </p>
          </div>

          {booking?.discount_amount > 0 && (
            <div className="flex justify-between gap-4 text-emerald-700">
              <p className="flex items-center gap-1.5">
                <Icon icon="solar:tag-price-bold-duotone" />
                Discount
              </p>
              <p className="font-semibold">−{formatPrice(booking.discount_amount)}</p>
            </div>
          )}

          {!booking?.isExtension && (
            <div className="flex justify-between gap-4 text-gray-700">
              <p>Caution fee <span className="text-gray-400">(refundable)</span></p>
              <p className="font-medium">{formatPrice(booking?.caution_fee ?? 0)}</p>
            </div>
          )}

          {paymentMethod !== 'WALLET' && processingFee > 0 && (
            <div className="flex justify-between gap-4 text-gray-700">
              <p>Processing fee</p>
              <p className="font-medium">{formatPrice(processingFee)}</p>
            </div>
          )}

          {paymentMethod === 'WALLET' && processingFee > 0 && (
            <div className="flex justify-between gap-4 text-emerald-700">
              <p className="flex items-center gap-1.5">
                <Icon icon="solar:wallet-money-bold-duotone" />
                No processing fee on wallet
              </p>
              <p className="font-semibold">−{formatPrice(processingFee)}</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-dashed border-gray-300 flex items-baseline justify-between">
          <p className="font-semibold text-gray-900">Total</p>
          <p className="text-3xl font-semibold text-[#191919]" style={{ fontFamily: SERIF }}>
            {formatPrice(displayTotal)}
          </p>
        </div>

        <button
          className={`w-full py-4 px-4 mt-5 rounded-full font-bold text-base transition-all ${
            enabled
              ? 'bg-[#028090] text-white hover:bg-[#026d7a] active:bg-[#025b66] shadow-[0_10px_24px_-10px_rgba(2,128,144,0.8)]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          onClick={onConfirm}
          disabled={!enabled}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isRequestToBook ? 'Submitting request...' : 'Processing...'}
            </div>
          ) : isRequestToBook ? (
            'Submit booking request'
          ) : !paymentMethod ? (
            'Choose a payment method'
          ) : (
            `Pay ${formatPrice(displayTotal)}`
          )}
        </button>

        {!isRequestToBook && (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <Icon icon="mdi:lock-outline" width={14} />
            Payment is held securely until check-in
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;
