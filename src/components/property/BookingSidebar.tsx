'use client';

import React from 'react';
import { Box, Typography, Button, Skeleton } from '@mui/material';
import DateInput from '../search/DateInput';
import { toast } from 'react-toastify';
import {
  clampBookingCountFromInput,
  clampGuestsCountFromInput,
} from './MobileBookingSummary';
import SpeakWithHumanButton from './SpeakWithHumanButton';
interface BookingSidebarProps {
  isLoading: boolean;
  basePrice: number;
  datePrice: number | null;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  setCheckInDate: (date: Date | null) => void;
  setCheckOutDate: (date: Date | null) => void;
  unitAvailability: any[];
  selectedUnits: number;
  setSelectedUnits: (units: number) => void;
  activeUnit: any;
  adults: number;
  children: number;
  setAdults: (val: number) => void;
  setChildren: (val: number) => void;
  pets: number;
  setPets: (val: number) => void;
  isPetAllowed: boolean;
  nights: number;
  totalChargingFee: number;
  cautionFeePercentage: number;
  onGuestsChange: (guests: number) => void;
  handleConfirmBookingClick: () => void;
  formatPrice: (price: number) => string;
  bookingMode?: string;
  maxGuests?: number;
  guests? :number;
  /** Needed by the WhatsApp CTA — the sidebar has no route access of its own. */
  propertyName?: string;
  propertyId?: string;
  propertyCity?: string;
  quoteData?: any;
  isQuoteLoading?: boolean;
}

const BookingSidebar: React.FC<BookingSidebarProps> = ({
  isLoading,
  basePrice,
  datePrice,
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate,
  unitAvailability,
  selectedUnits,
  setSelectedUnits,
  activeUnit,
  adults: _adults,
  children: _children,
  onGuestsChange,
  pets,
  setPets,
  isPetAllowed,
  nights,
  totalChargingFee,
  cautionFeePercentage,
  handleConfirmBookingClick,
  formatPrice,
  bookingMode = 'INSTANT',
  maxGuests,
  guests,
  propertyName,
  propertyId,
  propertyCity,
  quoteData,
  isQuoteLoading,
}) => {
  const isRequestToBook = bookingMode === 'REQUEST_TO_BOOK';
  const guestMax =
    maxGuests ?? (activeUnit?.max_guests || 1) * selectedUnits;
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 24,
        p: 2.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Price Display */}
      <Typography
        variant="h4"
        sx={{
          color: 'primary.main',
          mb: 2,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'baseline',
          gap: 1,
        }}
      >
        {isLoading ? (
          <Skeleton width={150} />
        ) : (
          formatPrice(datePrice || basePrice)
        )}
        <Typography
          component="span"
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          /night
        </Typography>
      </Typography>

      <Box sx={{ mb: 2.5 }}>
        <DateInput
          onClose={() => {}}
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          onCheckInDateSelect={setCheckInDate}
          onCheckOutDateSelect={setCheckOutDate}
          availableDates={unitAvailability}
          showTwoMonths={false}
          displayError={(message) => {
            toast.error(message);
          }}
        />
      </Box>

      {/* Units Input */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
          Units
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
        >
          <input
            type="number"
            value={selectedUnits}
            onChange={(e) => {
              clampBookingCountFromInput(
                e,
                activeUnit?.count || 1,
                setSelectedUnits
              );
            }}
            min="1"
            max={activeUnit?.count || 1}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              textAlign: 'center',
            }}
          />
        </Box>{' '}
        <Typography variant="caption" color="text.secondary">
          Max {activeUnit?.count || 1} units available
        </Typography>
      </Box>

      {/* Nights and Guests Inputs */}
      <Box sx={{ my: 2, display: 'flex', gap: 2 }}>
        {/* Guests Input */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
            Guests
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input
              type="number"
              value={guests}
              onChange={(e) =>
                clampGuestsCountFromInput(e, guestMax, onGuestsChange)
              }
              min={1}
              max={guestMax}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '1rem',
                textAlign: 'center',
              }}
            />
          </Box>{' '}
          <Typography variant="caption" color="text.secondary">
            Max {activeUnit?.max_guests || 1} guest
            {activeUnit?.max_guests !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Box>

      {/* Pets Input */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
          Pets (Optional)
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            '&:hover': {
              borderColor: 'primary.main',
            },
          }}
        >
          <input
            type="number"
            value={pets}
            onChange={(e) =>
              setPets(Math.max(0, parseInt(e.target.value) || 0))
            }
            min="0"
            disabled={!isPetAllowed}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              textAlign: 'center',
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
              backgroundColor: !isPetAllowed ? '#f0f0f0' : 'transparent',
              cursor: !isPetAllowed ? 'not-allowed' : 'text',
            }}
          />
        </Box>
      </Box>

      {/* Total Price Breakdown */}
      <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2, position: 'relative' }}>
        {isQuoteLoading && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Skeleton variant="rectangular" width="100%" height="100%" sx={{ opacity: 0.5 }} />
          </Box>
        )}
        <Typography variant="subtitle2" gutterBottom>
          Price Details
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>
            {nights} night{nights !== 1 ? 's' : ''} ×{' '}
            {!Number.isNaN(selectedUnits) ? selectedUnits : 0} unit
            {selectedUnits === 1 || !selectedUnits ? '' : 's'}
          </Typography>
          <Typography>
            {formatPrice(quoteData?.base_price ?? (basePrice * nights * selectedUnits))}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'text.secondary' }}>
          <Typography variant="caption">Standard nightly rate</Typography>
          <Typography variant="caption">
            {formatPrice((quoteData?.base_price ?? (basePrice * nights * selectedUnits)) / (nights * (selectedUnits || 1)))} / night
          </Typography>
        </Box>
        
        {quoteData?.discount_amount > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Discount ({quoteData.discount_policy?.policy?.name || 'Long Stay'})
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                −{formatPrice(quoteData.discount_amount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pl: 1, borderLeft: '2px solid', borderColor: 'success.main' }}>
              <Typography variant="caption" color="text.secondary">
                Discounted nightly rate
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatPrice((quoteData.base_price - quoteData.discount_amount) / (nights * (selectedUnits || 1)))} / night
              </Typography>
            </Box>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Caution Fee</Typography>
          <Typography>{formatPrice(Number(cautionFeePercentage))}</Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography fontWeight={600}>Total</Typography>
          <Typography fontWeight={600}>
            {formatPrice(totalChargingFee)}
          </Typography>
        </Box>
        {quoteData?.upsell_message && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1, border: '1px dashed', borderColor: 'primary.200' }}>
            <Typography variant="caption" sx={{ color: 'primary.800', fontWeight: 500, display: 'block', textAlign: 'center' }}>
              💡 {quoteData.upsell_message}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Book / Request Button */}
      {isRequestToBook && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mb: 1,
            color: 'text.secondary',
          }}
        >
          This property requires owner approval before booking is confirmed.
        </Typography>
      )}
      <Button
        fullWidth
        variant="contained"
        onClick={handleConfirmBookingClick}
        sx={{
          py: 1.5,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
        }}
      >
        {isRequestToBook ? 'Request to Book' : 'Book Now'}
      </Button>

      {/* Escape hatch for a guest who can't decide or has a question — the
          alternative to this is silent abandonment. */}
      <SpeakWithHumanButton
        surface="booking_sidebar"
        context={{
          propertyName,
          propertyId,
          city: propertyCity,
          unitName: activeUnit?.name,
          checkInDate,
          checkOutDate,
          nights,
          guests,
          units: selectedUnits,
          total: totalChargingFee,
        }}
      />
    </Box>
  );
};

export default BookingSidebar;
