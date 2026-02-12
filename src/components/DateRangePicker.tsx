import { Box, TextField, Typography, Button, Chip, ButtonGroup } from '@mui/material';
import { format } from 'date-fns';
import { Icon } from '@iconify/react';

interface AvailabilityResponse {
  date: string;
  pricing: string;
  isBlackout: boolean;
  count: number;
}

// interface AvailabilityDay {
//   date: string;
//   pricing: string;
//   isBlackout: boolean;
//   count: number;
// }

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  label?: string;
  disabled?: boolean;
  availableDates: Date[] | AvailabilityResponse[];
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label,
  disabled = false,
  availableDates = []
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDisplayDate = (date: Date) => {
    return format(new Date(date), 'EEE, dd MMM');
  };

  const isDateAvailable = (date: Date) => {
    if (!availableDates.length) return true;
    const formattedDate = format(date, 'yyyy-MM-dd');

    if (availableDates[0] instanceof Date) {
      return (availableDates as Date[]).some(d => format(d, 'yyyy-MM-dd') === formattedDate);
    }

    const availability = (availableDates as AvailabilityResponse[]).find(a => {
      if (!a?.date) return false;
      try {
        const availableDate = new Date(a.date);
        if (isNaN(availableDate.getTime())) return false;
        return format(availableDate, 'yyyy-MM-dd') === formattedDate;
      } catch (e) {
        console.warn('Invalid date:', a.date);
        console.error(e);
        return false;
      }
    });
    return availability && !availability.isBlackout && availability.count > 0;
  };

  const calculateNights = (start: Date | null, end: Date | null): number => {
    if (!start || !end) return 1;
    const diffTime = end.getTime() - start.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  const areConsecutiveDatesAvailable = (startDate: Date, nights: number): boolean => {
    for (let i = 0; i < nights; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + i);
      if (!isDateAvailable(checkDate)) {
        return false;
      }
    }
    return true;
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) return;
    if (!isDateAvailable(selectedDate)) {
      console.log('Date not available:', selectedDate);
      return;
    }

    onStartDateChange(selectedDate);

    // Auto-calculate checkout based on current nights selection
    const currentNights = calculateNights(startDate, endDate);
    const newCheckOut = new Date(selectedDate);
    newCheckOut.setDate(newCheckOut.getDate() + currentNights);
    onEndDateChange(newCheckOut);
  };

  const handleNightsChange = (nights: number) => {
    if (!startDate) {
      // If no check-in selected, do nothing
      return;
    }

    // Check if consecutive nights are available
    if (!areConsecutiveDatesAvailable(startDate, nights)) {
      console.log(`${nights} consecutive nights not available from ${format(startDate, 'yyyy-MM-dd')}`);
      return;
    }

    const newCheckOut = new Date(startDate);
    newCheckOut.setDate(newCheckOut.getDate() + nights);
    onEndDateChange(newCheckOut);
  };

  const nights = calculateNights(startDate, endDate);

  return (
    <Box>
      {label && (
        <Typography variant="body1" gutterBottom>
          {label}
        </Typography>
      )}

      <div className="grid grid-cols-1 gap-2 pb-0">
        {/* Check-in Date */}
        <div className="flex flex-col min-h-[80px]">
          <TextField
            label="Check-in date"
            type="date"
            fullWidth
            size="small"
            disabled={disabled}
            value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
            onChange={handleCheckInChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: format(today, 'yyyy-MM-dd'),
              onKeyDown: (e) => {
                if (e.key !== 'Tab') {
                  e.preventDefault();
                }
              }
            }}
            sx={{
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                filter: 'invert(0.5)',
                cursor: 'pointer'
              },
              '& input:disabled': {
                color: 'text.disabled',
                WebkitTextFillColor: 'text.disabled'
              }
            }}
          />
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{
              mt: 0.5,
              opacity: startDate ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
              fontSize: '0.8rem'
            }}
          >
            {startDate ? formatDisplayDate(startDate) : 'Select date'}
          </Typography>
        </div>

        {/* Nights Selector */}
        {startDate && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.875rem' }}>
              Number of nights
            </Typography>
            <ButtonGroup
              variant="outlined"
              size="small"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                '& .MuiButtonGroup-grouped': {
                  borderRadius: 2,
                  minWidth: '60px'
                }
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <Button
                  key={n}
                  onClick={() => handleNightsChange(n)}
                  variant={nights === n ? 'contained' : 'outlined'}
                  disabled={disabled || !areConsecutiveDatesAvailable(startDate, n)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: nights === n ? 600 : 400
                  }}
                >
                  {n}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        )}

        {/* Checkout Date Display (Read-only) */}
        {startDate && endDate && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Check-out date
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatDisplayDate(endDate)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {format(endDate, 'yyyy-MM-dd')}
            </Typography>
          </Box>
        )}
      </div>

      {/* Visual Feedback and Helper Text */}
      <Box sx={{ mt: 2 }}>
        {startDate && endDate && nights > 0 && (
          <Chip
            icon={<Icon icon="mdi:calendar-check" width={18} />}
            label={`${nights} night${nights !== 1 ? 's' : ''} selected`}
            color="primary"
            size="small"
            sx={{
              mb: 1,
              fontWeight: 500,
              fontSize: '0.875rem'
            }}
          />
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: '0.75rem',
            lineHeight: 1.4
          }}
        >
          <Icon icon="mdi:information-outline" width={14} />
          {/* Checkout dates are available for other guests to check in */}
        </Typography>
      </Box>
    </Box>
  );
};

export default DateRangePicker; 