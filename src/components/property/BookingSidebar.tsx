'use client';

import React from 'react';
import { Box, Typography, Button, Skeleton, Checkbox, FormControlLabel } from '@mui/material';
import DateInput from '../search/DateInput';
import { toast } from 'react-toastify';
import {
  clampBookingCountFromInput,
  clampGuestsCountFromInput,
} from './MobileBookingSummary';
import SpeakWithHumanButton from './SpeakWithHumanButton';
import VenueHirePicker, { VenueHireState } from './VenueHirePicker';
import { BILLING_UNIT_WORD, headlineUnitWord } from '../../utils/eventCentre';
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
  propertyType?: string;
  additionalFees?: Array<{ id: string; fee_name: string; fee_amount: number | string; is_mandatory: boolean }>;
  selectedFeeIds?: string[];
  onToggleFee?: (feeId: string) => void;
  rules?: string | null;
  /** Event centres: how the hall is hired and when (see VenueHirePicker). */
  venueHire?: VenueHireState;
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
  propertyType,
  additionalFees = [],
  selectedFeeIds = [],
  onToggleFee,
  rules,
  venueHire,
}) => {
  const isRequestToBook = bookingMode === 'REQUEST_TO_BOOK';
  const guestMax =
    maxGuests ?? (activeUnit?.max_guests || 1) * selectedUnits;
  const isEventCentre = propertyType === 'EVENT_CENTRE' && !!venueHire;
  // How a venue's price lines count: "3 hours", "1 session", "2 days".
  const hireCount = isEventCentre
    ? Number(quoteData?.billing_duration ?? venueHire!.billingDuration) || 1
    : nights;
  const hireWord = isEventCentre
    ? BILLING_UNIT_WORD[venueHire!.billingUnit]
    : { one: 'night', many: 'nights' };
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
          formatPrice(isEventCentre ? venueHire!.rate || basePrice : datePrice || basePrice)
        )}
        <Typography
          component="span"
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          /{isEventCentre ? hireWord.one : propertyType === 'EVENT_CENTRE' ? headlineUnitWord(activeUnit) : 'night'}
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
          isEventCentre={isEventCentre}
          displayError={(message) => {
            toast.error(message);
          }}
        />
      </Box>

      {isEventCentre && (
        <VenueHirePicker hire={venueHire!} hasDate={!!checkInDate} formatPrice={formatPrice} />
      )}

      {/* Units Input */}
      <Box sx={{ flex: 1, mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
          {isEventCentre ? 'Halls' : 'Units'}
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
            {hireCount} {hireCount === 1 ? hireWord.one : hireWord.many} ×{' '}
            {!Number.isNaN(selectedUnits) ? selectedUnits : 0} {isEventCentre ? 'hall' : 'unit'}
            {selectedUnits === 1 || !selectedUnits ? '' : 's'}
          </Typography>
          <Typography>
            {formatPrice(quoteData?.base_price ?? (basePrice * hireCount * selectedUnits))}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'text.secondary' }}>
          <Typography variant="caption">Standard rate</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatPrice((quoteData?.base_price ?? (basePrice * hireCount * selectedUnits)) / (hireCount * (selectedUnits || 1)))} / {hireWord.one}
          </Typography>
        </Box>
        
        {quoteData?.discount_amount > 0 && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Discount ({quoteData.discount_policy?.policy?.name || (isEventCentre ? 'Multi-day' : 'Long Stay')})
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                −{formatPrice(quoteData.discount_amount)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pl: 1, borderLeft: '2px solid', borderColor: 'success.main' }}>
              <Typography variant="caption" color="success.main">
                Discounted rate
              </Typography>
              <Typography variant="body2" color="success.main" fontWeight={500}>
                {formatPrice((quoteData.base_price - quoteData.discount_amount) / (hireCount * (selectedUnits || 1)))} / {hireWord.one}
              </Typography>
            </Box>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>Caution Fee</Typography>
          <Typography>{formatPrice(Number(cautionFeePercentage))}</Typography>
        </Box>

        {/* Additional Fees (Selectable Add-ons) */}
        {additionalFees.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 500 }}>Additional Fees</Typography>
            {additionalFees.map((fee) => (
              <Box key={fee.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={fee.is_mandatory || selectedFeeIds.includes(fee.id)}
                      disabled={fee.is_mandatory}
                      onChange={() => onToggleFee?.(fee.id)}
                      sx={{ py: 0.25 }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {fee.fee_name}{fee.is_mandatory ? ' (Required)' : ''}
                    </Typography>
                  }
                  sx={{ mr: 0 }}
                />
                <Typography variant="body2">{formatPrice(Number(fee.fee_amount))}</Typography>
              </Box>
            ))}
          </Box>
        )}
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

      {/* House / Venue Rules footnote.

          Previously a `warning.50` panel with a `warning.200` border and a 📋
          — alert styling for a line that is not an alert. It sat directly
          above the booking button competing with it for attention, and read
          as a problem to resolve rather than the standing term it is. It is
          now a footnote, matching the "requires owner approval" caption above
          it. */}
      {rules && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            mb: 1.5,
            color: 'text.secondary',
          }}
        >
          By booking, you agree to the{' '}
          <Typography
            component="a"
            variant="caption"
            href="#house-rules"
            sx={{ color: 'text.secondary', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              document.getElementById('house-rules')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {propertyType === 'EVENT_CENTRE' ? 'Venue Rules' : 'House Rules'}
          </Typography>
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
