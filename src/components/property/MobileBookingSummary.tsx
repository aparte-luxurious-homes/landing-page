import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Drawer,
  Skeleton,
  useMediaQuery,
} from '@mui/material';
import DateInput from '../search/DateInput';

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
}) => {
  const isRequestToBook = bookingMode === 'REQUEST_TO_BOOK';
  const isMobile = useMediaQuery('(max-width:600px)');
  const [showDetails, setShowDetails] = useState(false);

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
            {isLoading ? <Skeleton width={100} /> : formatPrice(totalPrice)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {nights} night{nights !== 1 ? 's' : ''} · {guests} guest
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
                displayError={(message) => {
                  console.error(message);
                }}
              />
            </Box>

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
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2">
                  {formatPrice(datePrice || basePrice)} × {nights} night
                  {nights !== 1 ? 's' : ''} ×
                  {!Number.isNaN(selectedUnits) ? selectedUnits : 0} unit
                  {selectedUnits === 1 || !selectedUnits ? '' : 's'}
                </Typography>
                <Typography variant="body2">
                  {formatPrice(
                    (datePrice || basePrice) * nights * selectedUnits
                  )}
                </Typography>
              </Box>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2">Caution Fee</Typography>
                <Typography variant="body2">
                  {formatPrice(Number(cautionFeePercentage))}
                </Typography>
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
                <Typography fontWeight={500}>Total</Typography>
                <Typography fontWeight={500}>
                  {formatPrice(totalPrice)}
                </Typography>
              </Box>
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
            </Box>
          </Box>
        </Drawer>
      )}
    </>
  );
};

export default MobileBookingSummary;
