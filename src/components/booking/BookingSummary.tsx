'use client';

import React from 'react';
import { Icon } from '@iconify/react';
import Bigimg from '../../assets/images/Apartment/Bigimg.png';

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
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:sticky lg:top-24">
      <div className="flex items-center gap-4 mb-6">
        <img
          src={booking?.unit_image || Bigimg}
          alt="Property"
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {booking?.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {`${booking?.unit_count} ${booking?.title} for ${booking?.nights} Night${booking?.nights !== 1 ? 's' : ''}`}
          </p>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            <Icon icon="mdi:account" className="text-gray-500" />
            Hosted by {booking?.owner?.profile?.firstName || 'Aparte'}{' '}
            {booking?.owner?.profile?.lastName || ''}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <p className="font-medium text-gray-900 mb-4">
          {booking?.isExtension ? 'Extension Details' : 'Price Details'}
        </p>
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <p>
              {formatPrice(booking?.base_price ?? 0)} × {booking?.nights}{' '}
              {booking?.isExtension ? 'extra ' : ''}night
              {booking?.nights !== 1 ? 's' : ''} × {booking?.unit_count} unit
              {booking?.unit_count !== 1 ? 's' : ''}
            </p>
            <p>
              {formatPrice(
                (booking?.base_price ?? 0) *
                  (booking?.nights ?? 0) *
                  (booking?.unit_count ?? 1)
              )}
            </p>
          </div>

          {!booking?.isExtension && (
            <div className="flex justify-between text-gray-600">
              <p>Caution Fee</p>
              <p>{formatPrice(booking?.caution_fee ?? 0)}</p>
            </div>
          )}

          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between text-lg font-semibold text-gray-900">
              <p>Total</p>
              <p>{formatPrice(booking?.total_charging_fee ?? 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        className={`w-full py-4 px-4 mt-6 rounded-lg font-medium text-white text-base transition-all
          ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : isRequestToBook
                ? 'bg-[#028090] hover:bg-[#026d7a] active:bg-[#025b66]'
                : !paymentMethod
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#028090] hover:bg-[#026d7a] active:bg-[#025b66]'
          }`}
        onClick={onConfirm}
        disabled={isProcessing || (!isRequestToBook && !paymentMethod)}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {isRequestToBook ? 'Submitting Request...' : 'Processing...'}
          </div>
        ) : isRequestToBook ? (
          'Submit Booking Request'
        ) : (
          `Pay ${formatPrice(booking?.total_charging_fee ?? 0)}`
        )}
      </button>
    </div>
  );
};

export default BookingSummary;
