'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Drawer,
  IconButton,
  Skeleton,
  useMediaQuery,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DateInput from '../search/DateInput';
import SpeakWithHumanButton from './SpeakWithHumanButton';
import { hasWhatsappSupport } from '@/lib/help/support';
import {
  bookingEnquiryUrl,
  type BookingEnquiryContext,
} from '@/lib/help/bookingEnquiry';
import { trackHelpEvent } from '@/lib/help/analytics';

interface MobileBookingSummaryProps {
  isLoading: boolean;
  basePrice: number;
  datePrice: number | null;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  nights: number;
  guests: number;
  maxGuests: number;
  totalPrice: number;
  onGuestsChange: (guests: number) => void;
  formatPrice: (price: number) => string;
  onBookClick: () => void;
  unitAvailability: any[];
  selectedUnits: number;
  onUnitsChange: (units: number) => void;
  maxUnits: number;
  bookingMode?: string;
  cautionFeePercentage?: number;
  /** Context for the WhatsApp CTA. */
  propertyName?: string;
  propertyId?: string;
  propertyCity?: string;
  unitName?: string;
  quoteData?: any;
  isQuoteLoading?: boolean;
  propertyType?: string;
  additionalFees?: Array<{ id: string; fee_name: string; fee_amount: number | string; is_mandatory: boolean }>;
  selectedFeeIds?: string[];
  onToggleFee?: (feeId: string) => void;
  rules?: string | null;
  billingUnit?: 'PER_DAY' | 'PER_HOUR' | 'PER_HALF_DAY';
  billingDuration?: number;
  setBillingUnit?: (unit: 'PER_DAY' | 'PER_HOUR' | 'PER_HALF_DAY') => void;
  setBillingDuration?: (duration: number) => void;
}

export const clampBookingCountFromInput = (e: React.ChangeEvent<HTMLInputElement>, maxUnits: number, onChange: (units: number) => void) => {
  const raw = parseInt(e.target.value);
  const parsed = Number.isNaN(raw) ? 1 : raw;

  if (parsed <= maxUnits && parsed >= 1) {
    onChange(raw);
  } else if (
    parsed <= 1
  ) {
    onChange(1);
  } else {
    onChange(maxUnits);
  }
  return raw;
}

export const clampGuestsCountFromInput = (e: React.ChangeEvent<HTMLInputElement>, maxGuests: number, onChange: (guests: number) => void) => {
  const raw = parseInt(e.target.value);
  const parsed = Number.isNaN(raw) ? 1 : raw;

  if (parsed <= maxGuests && parsed >= 1) {
    onChange(raw);
  } else if (parsed <= 1) {
    onChange(1);
  } else {
    onChange(maxGuests);
  }

  // Ensure if inputed value exceeds maxGuests, set value to maxGuests
  if (raw > maxGuests || parsed >= maxGuests) {
    onChange(maxGuests);
  }
  return raw;
}

const MobileBookingSummary: React.FC<MobileBookingSummaryProps> = ({
  isLoading,
  basePrice,
  datePrice,
  checkInDate,
  checkOutDate,
  onStartDateChange,
  onEndDateChange,
  nights,
  guests,
  maxGuests,
  totalPrice,
  onGuestsChange,
  formatPrice,
  onBookClick,
  unitAvailability,
  selectedUnits,
  onUnitsChange,
  maxUnits,
  cautionFeePercentage,
  bookingMode = 'INSTANT',
  propertyName,
  propertyId,
  propertyCity,
  unitName,
  quoteData,
  isQuoteLoading,
  propertyType,
  additionalFees = [],
  selectedFeeIds = [],
  onToggleFee,
  rules,
  billingUnit,
  billingDuration,
  setBillingUnit,
  setBillingDuration,
}) => {
  const isRequestToBook = bookingMode === 'REQUEST_TO_BOOK';
  const isMobile = useMediaQuery('(max-width:600px)');
  const [showDetails, setShowDetails] = useState(false);

  const enquiryContext: BookingEnquiryContext = {
    propertyName,
    propertyId,
    city: propertyCity,
    unitName,
    checkInDate,
    checkOutDate,
    nights,
    guests,
    units: selectedUnits,
    total: totalPrice,
  };

  const handleWhatsappClick = () => {
    trackHelpEvent('help_contact_clicked', {
      surface: 'mobile_booking_bar',
      channel: 'whatsapp',
      property_id: propertyId,
    });
    window.open(bookingEnquiryUrl(enquiryContext), '_blank', 'noopener,noreferrer');
  };

  if (!isMobile) return null;

  return (
    <>
      <Box
        sx={{
          display: { xs: 'flex', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
          zIndex: 1000,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: 'row',
          gap: 0,
        }}
      >
        <Box
          sx={{ cursor: 'pointer' }}
          onClick={() => setShowDetails(!showDetails)}
        >
          <Typography
            variant="h6"
            sx={{ color: 'primary.main', fontWeight: 600 }}
          >
            {isLoading || isQuoteLoading ? <Skeleton width={100} /> : formatPrice(totalPrice)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {nights} {propertyType === 'EVENT_CENTRE' ? `Day/Event${nights !== 1 ? 's' : ''}` : `night${nights !== 1 ? 's' : ''}`} · {guests} guest
              {guests !== 1 ? 's' : ''} · {selectedUnits} unit
              {selectedUnits !== 1 ? 's' : ''}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              · Tap for details ↑
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Icon-only in the fixed bar: the row is already tight, and the
              full-width variant lives in the drawer below. */}
          {hasWhatsappSupport() && (
            <IconButton
              onClick={handleWhatsappClick}
              aria-label="Speak with a human on WhatsApp about this stay"
              sx={{
                color: '#128C7E',
                border: '1px solid #25D366',
                borderRadius: 1.5,
                p: 1,
              }}
            >
              <WhatsAppIcon />
            </IconButton>
          )}
          <Button
            variant="contained"
            onClick={onBookClick}
            sx={{
              py: 1,
              px: 3,
              textTransform: 'none',
            }}
          >
            {isRequestToBook ? 'Request to Book' : 'Reserve your Aparte'}
          </Button>
        </Box>
      </Box>

      {showDetails && (
        <Drawer
          anchor="bottom"
          open={showDetails}
          onClose={() => setShowDetails(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '85vh',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 4,
                bgcolor: 'grey.300',
                borderRadius: 2,
                mx: 'auto',
                mb: 3,
              }}
            />

            <Box sx={{ mb: 2.5 }}>
              <DateInput
                onClose={() => {}}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                onCheckInDateSelect={onStartDateChange}
                onCheckOutDateSelect={onEndDateChange}
                availableDates={unitAvailability}
                showTwoMonths={!isMobile}
                maxMonths={2}
                isEventCentre={propertyType === 'EVENT_CENTRE'}
                displayError={(message) => {
                  console.error(message);
                }}
              />
            </Box>

            {propertyType === 'EVENT_CENTRE' && (
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Duration
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 1,
                      px: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <input
                      type="number"
                      value={billingDuration}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (setBillingDuration && !isNaN(val) && val > 0) {
                          setBillingDuration(val);
                        }
                      }}
                      min={1}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        textAlign: 'center',
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Billing Unit
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 1,
                      px: 1.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      height: '42px',
                    }}
                  >
                    <select
                      value={billingUnit}
                      onChange={(e) => {
                        if (setBillingUnit) {
                          setBillingUnit(e.target.value as 'PER_DAY' | 'PER_HOUR' | 'PER_HALF_DAY');
                        }
                      }}
                      style={{
                        width: '100%',
                        border: 'none',
                        outline: 'none',
                        fontSize: '1rem',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="PER_DAY">Day(s)</option>
                      <option value="PER_HOUR">Hour(s)</option>
                      <option value="PER_HALF_DAY">Half Day(s)</option>
                    </select>
                  </Box>
                </Box>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Guests
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                  px: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <input
                  type="number"
                  value={guests}
                  onChange={(e) =>
                    clampGuestsCountFromInput(e, maxGuests, onGuestsChange)
                  }
                  min={1}
                  max={maxGuests}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    backgroundColor: 'transparent',
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Max {maxGuests} guest{maxGuests !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Units
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                  px: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <input
                  type="number"
                  value={selectedUnits}
                  onChange={(e) => {
                   clampBookingCountFromInput(e, maxUnits, onUnitsChange);
                  }}
                  min={1}
                  max={maxUnits}
                  style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    backgroundColor: 'transparent',
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Max {maxUnits} units available
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, position: 'relative' }}
              >
                {isQuoteLoading && (
                  <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.7)', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Skeleton variant="rectangular" width="100%" height="100%" sx={{ opacity: 0.5 }} />
                  </Box>
                )}
                <Typography variant="body2">
                  {formatPrice(quoteData?.base_price ?? (datePrice || basePrice))} × {nights} {propertyType === 'EVENT_CENTRE' ? `Day/Event${nights !== 1 ? 's' : ''}` : `night${nights !== 1 ? 's' : ''}`} ×
                  {!Number.isNaN(selectedUnits) ? selectedUnits : 0} unit
                  {selectedUnits === 1 || !selectedUnits ? '' : 's'}
                </Typography>
                <Typography variant="body2">
                  {formatPrice(quoteData?.base_price ?? ((datePrice || basePrice) * nights * selectedUnits))}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'text.secondary' }}>
                <Typography variant="caption">Standard {propertyType === 'EVENT_CENTRE' ? 'daily' : 'nightly'} rate</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatPrice((quoteData?.base_price ?? ((datePrice || basePrice) * nights * selectedUnits)) / (nights * (selectedUnits || 1)))} / {propertyType === 'EVENT_CENTRE' ? 'Day/Event' : 'night'}
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
                    <Typography variant="caption" color="success.main">
                      Discounted {propertyType === 'EVENT_CENTRE' ? 'daily' : 'nightly'} rate
                    </Typography>
                    <Typography variant="caption" color="success.main" fontWeight={500}>
                      {formatPrice((quoteData.base_price - quoteData.discount_amount) / (nights * (selectedUnits || 1)))} / {propertyType === 'EVENT_CENTRE' ? 'Day/Event' : 'night'}
                    </Typography>
                  </Box>
                </>
              )}

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2">Caution Fee</Typography>
                <Typography variant="body2">
                  {formatPrice(Number(cautionFeePercentage))}
                </Typography>
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
                <Typography fontWeight={500}>Total</Typography>
                <Typography fontWeight={500}>
                  {formatPrice(totalPrice)}
                </Typography>
              </Box>
              {quoteData?.upsell_message && (
                <Box sx={{ mt: 1.5, p: 1, bgcolor: 'primary.50', borderRadius: 1, border: '1px dashed', borderColor: 'primary.200' }}>
                  <Typography variant="caption" sx={{ color: 'primary.800', fontWeight: 500, display: 'block', textAlign: 'center' }}>
                    💡 {quoteData.upsell_message}
                  </Typography>
                </Box>
              )}

              {/* House / Venue Rules Notice */}
              {rules && (
                <Box sx={{ mt: 1.5, mb: 0.5, p: 1.5, bgcolor: 'warning.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.200' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    📋 By booking, you agree to the{' '}
                    <Typography
                      component="a"
                      variant="caption"
                      href="#house-rules"
                      sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        setShowDetails(false);
                        document.getElementById('house-rules')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      {propertyType === 'EVENT_CENTRE' ? 'Venue Rules' : 'House Rules'}
                    </Typography>
                  </Typography>
                </Box>
              )}
              <Button
                fullWidth
                variant="contained"
                onClick={onBookClick}
                sx={{
                  mt: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                {isRequestToBook ? 'Request to Book' : 'Reserve your Aparte'}
              </Button>
              <SpeakWithHumanButton
                surface="mobile_booking_drawer"
                context={enquiryContext}
              />
            </Box>
          </Box>
        </Drawer>
      )}
    </>
  );
};

export default MobileBookingSummary;
