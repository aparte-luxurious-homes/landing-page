import { Box, TextField, Typography } from '@mui/material';
import { format } from 'date-fns';

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
  availableDates: Date[];
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
    return availableDates.some(availableDate => 
      format(new Date(availableDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <Box>
      {label && (
        <Typography variant="body1" gutterBottom>
          {label}
        </Typography>
      )}
      
      <div className="grid grid-cols-2 gap-1 pb-0">
        <div className="flex flex-col min-h-[80px] px-0.5">
          <TextField
            label="Check in"
            type="date"
            fullWidth
            size="small"
            disabled={disabled}
            value={startDate ? format(new Date(startDate), 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              if (selectedDate < today || !isDateAvailable(selectedDate)) return;
              
              onStartDateChange(selectedDate);
              
              if (endDate && selectedDate >= endDate) {
                const newEndDate = new Date(selectedDate);
                newEndDate.setDate(newEndDate.getDate() + 1);
                onEndDateChange(newEndDate);
              }
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: format(today, 'yyyy-MM-dd')
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
              onEndDateChange(selectedDate);
            }}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: startDate ? format(minCheckOutDate, 'yyyy-MM-dd') : ''
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
    </Box>
  );
};

export default DateRangePicker; 