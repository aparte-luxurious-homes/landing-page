import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isBefore,
  startOfToday,
} from 'date-fns';
import { Paper, Typography, IconButton, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';

interface DateInputProps {
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  // onDateSelect: (checkInDate: Date, checkOutDate: Date) => void;
  width?: string;
  showTwoMonths?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  onClose,
  onDateSelect,
  width = '100%',
  showTwoMonths = true,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates] = useState<{
    checkInDate: Date | null;
    checkOutDate: Date | null;
  }>({
    checkInDate: null,
    checkOutDate: null,
  });
  console.log('selectedDates', selectedDates);
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    console.log('selectedDates.checkInDate', selectedDates, 'date', date);
    onDateSelect(date);
    onClose();
  };

  const renderCalendar = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    // Get the index of the first day of the month (0 = Sunday, 6 = Saturday)
    const firstDayIndex = start.getDay(); // Sunday = 0, Monday = 1, etc.

    return (
      <Grid container spacing={1}>
        {/* Days of the week headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Grid key={day} size={{ xs: 1.7 }}>
            <Typography
              variant="subtitle2"
              align="center"
              color="textSecondary"
            >
              {day}
            </Typography>
          </Grid>
        ))}

        {/* Add empty placeholders for the first week */}
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <Grid key={`empty-${index}`} size={{ xs: 1.7 }} />
        ))}

        {/* Render actual days */}
        {days.map((day) => (
          <Grid key={day.getTime()} size={{ xs: 1.7 }}>
            <Paper
              elevation={1}
              sx={{
                padding: 1,
                textAlign: 'center',
                backgroundColor: isSameMonth(day, currentMonth)
                  ? 'white'
                  : 'grey.100',
                color: isSameMonth(day, currentMonth)
                  ? 'text.primary'
                  : 'text.disabled',
                cursor: 'pointer',
                border:
                  selectedDates.checkInDate &&
                  selectedDates.checkOutDate &&
                  day >= selectedDates.checkInDate &&
                  day <= selectedDates.checkOutDate
                    ? '2px solid #028090'
                    : 'none',
              }}
              onClick={() => handleDateClick(day)}
            >
              <Typography>{format(day, 'd')}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        width: width,
        p: 2,
        zIndex: 40,
      }}
    >
      <Grid container justifyContent="flex-end" mb={2}>
        <IconButton
          onClick={onClose}
          sx={{
            backgroundColor: 'lightgray',
            borderRadius: '50%',
            p: 1,
          }}
        >
          <CloseIcon sx={{ color: 'black' }} />
        </IconButton>
      </Grid>
      <Grid container justifyContent="flex-end" spacing={1}>
        <Grid></Grid>
        <Grid></Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: showTwoMonths ? 6 : 12 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <IconButton
              onClick={handlePrevMonth}
              disabled={isBefore(currentMonth, startOfToday())}
            >
              <NavigateBeforeIcon
                sx={{
                  color: isBefore(currentMonth, startOfToday())
                    ? 'grey.500'
                    : 'inherit',
                }}
              />
            </IconButton>
            <Box flexGrow={1} textAlign="center">
              <Typography variant="h6" gutterBottom>
                {format(currentMonth, 'MMMM yyyy')}
              </Typography>
            </Box>
            <IconButton onClick={handleNextMonth}>
              <NavigateNextIcon sx={{ color: 'inherit' }} />
            </IconButton>
          </Grid>
          {renderCalendar(currentMonth)}
        </Grid>
        {showTwoMonths && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Box flexGrow={1} textAlign="center">
                <Typography variant="h6" gutterBottom>
                  {format(addMonths(currentMonth, 1), 'MMMM yyyy')}
                </Typography>
              </Box>
              <IconButton onClick={handleNextMonth}>
                <NavigateNextIcon sx={{ color: 'inherit' }} />
              </IconButton>
            </Grid>
            {renderCalendar(addMonths(currentMonth, 1))}
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default DateInput;
