import { Box, TextField, Typography, Button, Stack, Chip } from '@mui/material';
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

  const minCheckOutDate = startDate
    ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
    : new Date(today.setDate(today.getDate() + 1));

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
    if (!start || !end) return 0;
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const findNextAvailableDate = (fromDate: Date): Date | null => {
    const maxDaysToCheck = 90; // Check up to 3 months ahead
    let currentDate = new Date(fromDate);

    for (let i = 0; i < maxDaysToCheck; i++) {
      if (isDateAvailable(currentDate)) {
        return new Date(currentDate);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return null;
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

  const handleQuickSelect = (nights: number) => {
    const startingDate = new Date(today);

    // Find the first available date
    const availableStart = findNextAvailableDate(startingDate);
    if (!availableStart) {
      console.log('No available dates found');
      return;
    }

    // Check if consecutive nights are available
    if (!areConsecutiveDatesAvailable(availableStart, nights)) {
      console.log(`${nights} consecutive nights not available from ${format(availableStart, 'yyyy-MM-dd')}`);
      return;
    }

    const checkOut = new Date(availableStart);
    checkOut.setDate(checkOut.getDate() + nights);

    onStartDateChange(availableStart);
    onEndDateChange(checkOut);
  };

  const handleWeekendSelect = () => {
    // Find next Friday
    const nextFriday = new Date(today);
    const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7 || 7;
    nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);

    // Check if Friday and Saturday are available (2 nights)
    if (!areConsecutiveDatesAvailable(nextFriday, 2)) {
      console.log('Weekend not available');
      return;
    }

    const sunday = new Date(nextFriday);
    sunday.setDate(sunday.getDate() + 2);

    onStartDateChange(nextFriday);
    onEndDateChange(sunday);
  };

  const nights = calculateNights(startDate, endDate);

  return (
    <Box>
      {label && (
        <Typography variant="body1" gutterBottom>
          {label}
        </Typography>
      )}

      {/* Quick Select Buttons */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleQuickSelect(1)}
          disabled={disabled}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontSize: '0.875rem',
            '&:hover': {
              bgcolor: 'primary.50'
            }
          }}
        >
          <Icon icon="mdi:moon-waning-crescent" width={16} style={{ marginRight: 4 }} />
          1 Night
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleQuickSelect(2)}
          disabled={disabled}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontSize: '0.875rem',
            '&:hover': {
              bgcolor: 'primary.50'
            }
          }}
        >
          <Icon icon="mdi:moon-waning-gibbous" width={16} style={{ marginRight: 4 }} />
          2 Nights
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleWeekendSelect}
          disabled={disabled}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontSize: '0.875rem',
            '&:hover': {
              bgcolor: 'primary.50'
            }
          }}
        >
          <Icon icon="mdi:calendar-weekend" width={16} style={{ marginRight: 4 }} />
          Weekend
        </Button>
      </Stack>

      <div className="grid grid-cols-2 gap-1 pb-0">
        <div className="flex flex-col min-h-[80px] px-0.5">
          <TextField
            label="Check in"
            type="date"
            fullWidth
            size="small"
            disabled={disabled}
            value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              selectedDate.setHours(0, 0, 0, 0);

              if (selectedDate < today) return;
              if (!isDateAvailable(selectedDate)) {
                console.log('Date not available:', selectedDate);
                return;
              }

              onStartDateChange(selectedDate);

              if (endDate && selectedDate >= endDate) {
                const newEndDate = new Date(selectedDate);
                newEndDate.setDate(newEndDate.getDate() + 1);
                onEndDateChange(newEndDate);
              }
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: format(today, 'yyyy-MM-dd'),
              onKeyDown: (e) => {
                if (e.key !== 'Tab') {  // Allow Tab key for accessibility
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
              minHeight: '10px',
              opacity: startDate ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
              fontSize: '0.8rem'
            }}
          >
            {startDate ? formatDisplayDate(startDate) : 'Select date'}
          </Typography>
        </div>
        <div className="flex flex-col min-h-[80px] px-0.5">
          <TextField
            label="Check out"
            type="date"
            fullWidth
            size="small"
            disabled={disabled || !startDate}
            value={endDate ? format(new Date(endDate), 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              if (startDate && selectedDate <= startDate) return;
              if (!isDateAvailable(selectedDate)) return;
              onEndDateChange(selectedDate);
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: startDate ? format(minCheckOutDate, 'yyyy-MM-dd') : '',
              onKeyDown: (e) => {
                if (e.key !== 'Tab') {  // Allow Tab key for accessibility
                  e.preventDefault();
                }
              }
            }}
          />
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{
              minHeight: '10px',
              opacity: endDate ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out',
              fontSize: '0.8rem'
            }}
          >
            {endDate ? formatDisplayDate(endDate) : 'Select date'}
          </Typography>
        </div>
      </div>

      {/* Visual Feedback and Helper Text */}
      <Box sx={{ mt: 1.5 }}>
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
          Checkout dates are available for other guests to check in
        </Typography>
      </Box>
    </Box>
  );
};

export default DateRangePicker; 