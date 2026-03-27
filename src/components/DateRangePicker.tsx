import { Box, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';

interface AvailabilityResponse {
  date: string;
  pricing: string;
  isBlackout: boolean;
  count: number;
}

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
      } catch {
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

  const areConsecutiveDatesAvailable = (start: Date, nights: number): boolean => {
    for (let i = 0; i < nights; i++) {
      const checkDate = new Date(start);
      checkDate.setDate(checkDate.getDate() + i);
      if (!isDateAvailable(checkDate)) return false;
    }
    return true;
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      onStartDateChange(null);
      onEndDateChange(null);
      return;
    }

    const selectedDate = new Date(e.target.value + 'T00:00:00');
    if (isNaN(selectedDate.getTime())) return;
    if (selectedDate < today) return;
    if (!isDateAvailable(selectedDate)) return;

    onStartDateChange(selectedDate);

    const currentNights = calculateNights(startDate, endDate);
    const newCheckOut = new Date(selectedDate);
    newCheckOut.setDate(newCheckOut.getDate() + currentNights);
    onEndDateChange(newCheckOut);
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      onEndDateChange(null);
      return;
    }

    const selectedDate = new Date(e.target.value + 'T00:00:00');
    if (isNaN(selectedDate.getTime())) return;
    if (startDate && selectedDate <= startDate) return;

    onEndDateChange(selectedDate);
  };

  const handleNightsChange = (nights: number) => {
    if (!startDate) return;
    if (!areConsecutiveDatesAvailable(startDate, nights)) return;

    const newCheckOut = new Date(startDate);
    newCheckOut.setDate(newCheckOut.getDate() + nights);
    onEndDateChange(newCheckOut);
  };

  const nights = calculateNights(startDate, endDate);

  const dateFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      fontSize: '0.875rem',
    },
    '& input[type="date"]::-webkit-calendar-picker-indicator': {
      filter: 'invert(0.4)',
      cursor: 'pointer',
    },
  };

  return (
    <Box>
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#191919' }}>
          {label}
        </Typography>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Check-in / Check-out row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <TextField
            label="Check-in"
            type="date"
            fullWidth
            size="small"
            disabled={disabled}
            value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
            onChange={handleCheckInChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: format(today, 'yyyy-MM-dd') }}
            sx={dateFieldSx}
          />
          <TextField
            label="Check-out"
            type="date"
            fullWidth
            size="small"
            disabled={disabled || !startDate}
            value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
            onChange={handleCheckOutChange}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: startDate ? format(new Date(startDate.getTime() + 86400000), 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd'),
            }}
            sx={dateFieldSx}
          />
        </Box>

        {/* Nights selector */}
        {startDate && (
          <Box>
            <Typography variant="caption" sx={{ color: '#888', fontWeight: 500, mb: 0.75, display: 'block' }}>
              Nights
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => {
                const isActive = nights === n;
                const isDisabled = disabled || !areConsecutiveDatesAvailable(startDate, n);
                return (
                  <Box
                    key={n}
                    onClick={() => !isDisabled && handleNightsChange(n)}
                    sx={{
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: isDisabled ? 'default' : 'pointer',
                      transition: 'all 0.15s ease',
                      border: '1.5px solid',
                      borderColor: isActive ? '#028090' : isDisabled ? '#e5e7eb' : '#d1d5db',
                      backgroundColor: isActive ? '#028090' : 'transparent',
                      color: isActive ? '#fff' : isDisabled ? '#ccc' : '#555',
                      '&:hover': !isDisabled && !isActive ? {
                        borderColor: '#028090',
                        color: '#028090',
                        backgroundColor: 'rgba(2, 128, 144, 0.04)',
                      } : {},
                    }}
                  >
                    {n}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Summary line */}
        {startDate && endDate && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 1,
            px: 1.5,
            borderRadius: '10px',
            backgroundColor: 'rgba(2, 128, 144, 0.05)',
            border: '1px solid rgba(2, 128, 144, 0.12)',
          }}>
            <Typography variant="body2" sx={{ color: '#028090', fontWeight: 600, fontSize: '0.8rem' }}>
              {format(startDate, 'dd MMM')} — {format(endDate, 'dd MMM')}
            </Typography>
            <Typography variant="caption" sx={{ color: '#888', ml: 'auto' }}>
              {nights} night{nights !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DateRangePicker;
