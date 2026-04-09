import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  startOfToday,
} from 'date-fns';
import {
  Paper,
  Typography,
  IconButton,
  Box,
  TextField,
  Drawer,
  Button,
  Stack,
  Chip,
  ButtonGroup,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Icon } from '@iconify/react';

interface DateInputProps {
  onClose: () => void;
  onCheckInDateSelect: (date: Date | null) => void;
  onCheckOutDateSelect: (date: Date | null) => void;
  checkInDate: Date | null;
  checkOutDate: Date | null;
  displayError?: (message: string) => void;
  width?: string;
  showTwoMonths?: boolean;
  availableDates?: any[];
  isMobileView?: boolean;
  style?: React.CSSProperties;
  maxMonths?: number;
}

const DateInput: React.FC<DateInputProps> = ({
  onClose,
  onCheckInDateSelect,
  onCheckOutDateSelect,
  checkInDate,
  checkOutDate,
  displayError,
  width = '100%',
  showTwoMonths = true,
  availableDates = [],
  isMobileView = false,
  maxMonths = 2,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const today = startOfToday();
  const maxDate = endOfMonth(addMonths(today, maxMonths - 1));

  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // THis isDateDisabled function helps to maintain consistent disabled state
  const isDateDisabled = (date: Date, isSelectingCheckout: boolean = false) => {
    const formattedDate = formatDateLocal(date);
    const avail = availableDates.find((item: any) => {
      const itemDate = new Date(item.date);
      return formatDateLocal(itemDate) === formattedDate;
    });

    const isBlackout = avail?.is_blackout || avail?.isBlackout || false;
    const isBookedOut = avail?.count === 0;

    // Base disabled rules: past dates and beyond max date are always disabled
    if (isBefore(date, today) || isBefore(maxDate, date)) return true;

    // When selecting checkout, only blackout dates are disabled
    // Booked-out dates (count=0) are allowed for checkout
    if (isSelectingCheckout) {
      return isBlackout;
    }

    // For check-in selection (including intermediate dates),
    // both blackout and booked-out are disallowed
    return isBlackout || isBookedOut;
  };

  const areAllDatesBetweenAvailable = (start: Date, end: Date): boolean => {
    const current = new Date(start);
    // first night after check-in
    current.setDate(current.getDate() + 1);

    while (current < end) {
      if (isDateDisabled(current, false)) {
        // treat as check-in validation
        return false;
      }
      current.setDate(current.getDate() + 1);
    }
    return true;
  };

  // this helper function check if a date should appear disabled in the UI
  const shouldDateAppearDisabled = (date: Date): boolean => {
    const isSelectingCheckout = !!checkInDate && !checkOutDate;

    // Base disabled rules
    if (isBefore(date, today) || isBefore(maxDate, date)) return true;

    const formattedDate = formatDateLocal(date);
    const avail = availableDates.find(
      (item: any) => formatDateLocal(new Date(item.date)) === formattedDate
    );

    const isBlackout = avail?.is_blackout || avail?.isBlackout || false;
    const isBookedOut = avail?.count === 0;

    // When selecting checkout, only blackout dates appear disabled
    if (isSelectingCheckout) {
      return isBlackout;
    }

    // When no check-in or selecting check-in, both blackout and booked-out appear disabled
    return isBlackout || isBookedOut;
  };

  const handleDateClick = (date: Date) => {
    // First, check if clicking on an already selected check-in date
    if (checkInDate && formatDateLocal(checkInDate) === formatDateLocal(date)) {
      // Unselect check-in date
      onCheckInDateSelect(null);
      onCheckOutDateSelect(null);
      return;
    }

    // Check if clicking on an already selected check-out date
    if (
      checkOutDate &&
      formatDateLocal(checkOutDate) === formatDateLocal(date)
    ) {
      // Unselect check-out date only
      onCheckOutDateSelect(null);
      return;
    }

    // Always check if the date is disabled based on current selection state
    const isSelectingCheckout = !!checkInDate && !checkOutDate;
    if (isDateDisabled(date, isSelectingCheckout)) {
      const errorMessage = isSelectingCheckout
        ? 'This date is not available for checkout'
        : 'This date is not available for check-in';
      displayError?.(errorMessage);
      return;
    }

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Starting a new selection
      onCheckInDateSelect(date);
      onCheckOutDateSelect(null);
    } else {
      // We have checkInDate, now selecting checkout
      if (date <= checkInDate) {
        // User clicked on or before check-in: set new check-in
        onCheckInDateSelect(date);
        onCheckOutDateSelect(null);
      } else {
        // Validate all intermediate dates
        if (!areAllDatesBetweenAvailable(checkInDate, date)) {
          displayError?.('Some dates in your selected range are not available');
          return;
        }

        // All good, set checkout and close
        onCheckOutDateSelect(date);
        onClose();
      }
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const calculateNights = (start: Date | null, end: Date | null): number => {
    if (!start || !end) return 0;
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const findNextAvailableDate = (fromDate: Date): Date | null => {
    const maxDaysToCheck = 90;
    const currentDate = new Date(fromDate);

    for (let i = 0; i < maxDaysToCheck; i++) {
      if (!isDateDisabled(currentDate, false)) {
        return new Date(currentDate);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return null;
  };

  const areConsecutiveDatesAvailable = (
    startDate: Date,
    nights: number
  ): boolean => {
    for (let i = 0; i < nights; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + i);
      if (isDateDisabled(checkDate, false)) {
        return false;
      }
    }
    return true;
  };

  const handleQuickSelect = (nights: number) => {
    const startingDate = new Date(today);

    const availableStart = findNextAvailableDate(startingDate);
    if (!availableStart) {
      displayError?.('No available dates found');
      return;
    }

    if (!areConsecutiveDatesAvailable(availableStart, nights)) {
      displayError?.(`${nights} consecutive nights not available`);
      return;
    }

    const checkOut = new Date(availableStart);
    checkOut.setDate(checkOut.getDate() + nights);

    onCheckInDateSelect(availableStart);
    onCheckOutDateSelect(checkOut);
  };

  const handleWeekendSelect = () => {
    const nextFriday = new Date(today);
    const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7 || 7;
    nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);

    if (!areConsecutiveDatesAvailable(nextFriday, 2)) {
      displayError?.('Weekend not available');
      return;
    }

    const sunday = new Date(nextFriday);
    sunday.setDate(sunday.getDate() + 2);

    onCheckInDateSelect(nextFriday);
    onCheckOutDateSelect(sunday);
  };

  const nights = calculateNights(checkInDate, checkOutDate);

  const renderCalendar = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    const firstDayIndex = start.getDay();

    return (
      <Grid container spacing={1}>
        {/* Days of the week headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Grid key={day} size={{ xs: 1.7 }}>
            <Typography
              variant="subtitle2"
              align="center"
              color="textSecondary"
              sx={{ fontSize: '0.75rem', fontWeight: 600 }}
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
        {days.map((day) => {
          const formattedDate = formatDateLocal(day);
          const avail = availableDates.find(
            (a: any) => formatDateLocal(new Date(a.date)) === formattedDate
          );

          const isToday = formattedDate === formatDateLocal(today);
          const isBlackout = avail?.is_blackout || avail?.isBlackout;
          const isBookedOut = avail?.count === 0;
          const specialPrice = avail?.pricing;

          const isSelectingCheckout = !!checkInDate && !checkOutDate;
          // const isDisabled = isDateDisabled(day, isSelectingCheckout);
          const isDisabled = shouldDateAppearDisabled(day);

          const isSelected =
            (checkInDate && formatDateLocal(checkInDate) === formattedDate) ||
            (checkOutDate && formatDateLocal(checkOutDate) === formattedDate);
          const isInRange =
            checkInDate &&
            checkOutDate &&
            day > checkInDate &&
            day < checkOutDate;

          return (
            <Grid key={day.getTime()} size={{ xs: 1.7 }}>
              <Paper
                elevation={0}
                sx={{
                  height: '45px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  backgroundColor: isSelected
                    ? '#026672'
                    : isInRange
                      ? '#e0f2f1'
                      : isToday
                        ? '#f0fdfa'
                        : isBlackout
                          ? '#fff1f1'
                          : isBookedOut && !isSelectingCheckout
                            ? '#f5f5f5'
                            : '#fff',
                  color: isSelected
                    ? 'white'
                    : isInRange
                      ? '#026672'
                      : isDisabled
                        ? 'text.disabled'
                        : isBlackout
                          ? '#dc2626'
                          : specialPrice
                            ? '#028090'
                            : '#374151',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity:
                    isBlackout || (isBookedOut && !isSelectingCheckout)
                      ? 0.6
                      : 1,
                  borderRadius: '4px',
                  position: 'relative',
                  border: isSelected
                    ? '1px solid #026672'
                    : isToday
                      ? '1px solid #99f6e4'
                      : isBlackout
                        ? '1px dashed #fecaca'
                        : '1px solid #f3f4f6',
                  '&:hover': {
                    backgroundColor: !isDisabled
                      ? isSelected
                        ? '#025a66'
                        : '#f0fdfa'
                      : undefined,
                  },
                  transition: 'all 0.2s',
                }}
                onClick={() => handleDateClick(day)}
              >
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: isSelected || isToday ? 600 : 400,
                    textDecoration: isBlackout ? 'line-through' : 'none',
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                {specialPrice && !isDisabled && (
                  <Typography
                    sx={{
                      fontSize: '0.625rem',
                      color: isSelected ? 'rgba(255,255,255,0.8)' : '#028090',
                      lineHeight: 1,
                    }}
                  >
                    ₦{Math.round(specialPrice / 1000)}k
                  </Typography>
                )}
                {isBlackout && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: 4,
                      height: 4,
                      bgcolor: '#dc2626',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderCalendarContent = () => (
    <Box
      sx={{
        width: width,
        p: 2,
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h6">Select dates</Typography>
          <Typography variant="body2" color="text.secondary">
            {checkInDate && checkOutDate
              ? `${format(checkInDate, 'MMM d')} - ${format(checkOutDate, 'MMM d')}`
              : checkInDate
                ? `${format(checkInDate, 'MMM d')} - Select checkout`
                : 'Select check-in date'}
          </Typography>
        </Box>
        {/* {onClose && onClose !== Function.prototype && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )} */}
      </Box>

      {/* Quick Select Buttons */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleQuickSelect(1)}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontSize: '0.875rem',
          }}
        >
          <Icon
            icon="mdi:moon-waning-crescent"
            width={16}
            style={{ marginRight: 4 }}
          />
          1 Night
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleQuickSelect(2)}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontSize: '0.875rem',
          }}
        >
          <Icon
            icon="mdi:moon-waning-gibbous"
            width={16}
            style={{ marginRight: 4 }}
          />
          2 Nights
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleWeekendSelect}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            fontSize: '0.875rem',
          }}
        >
          <Icon
            icon="mdi:calendar-weekend"
            width={16}
            style={{ marginRight: 4 }}
          />
          Weekend
        </Button>
      </Stack>

      {/* Nights Selector - Shows after check-in is selected */}
      {checkInDate && (
        <Box
          sx={{ mb: 2, bgcolor: 'background.default', borderRadius: 1 }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.875rem' }}>
            Or select number of nights
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
                minWidth: "50px",
                borderColor: 'currentColor',
              },
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => {
              const isSelected = nights === n;
              const isAvailable = areConsecutiveDatesAvailable(checkInDate, n);

              return (
                <Button
                  key={n}
                  onClick={() => {
                    if (isAvailable) {
                      const newCheckOut = new Date(checkInDate);
                      newCheckOut.setDate(newCheckOut.getDate() + n);
                      onCheckOutDateSelect(newCheckOut);
                      onClose();
                    }
                  }}
                  variant={isSelected ? 'contained' : 'outlined'}
                  disabled={!isAvailable}
                  sx={{
                    textTransform: 'none',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {n}
                </Button>
              );
            })}
          </ButtonGroup>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
          >
            💡 Checkout dates are available for other guests
          </Typography>
        </Box>
      )}

      {/* Visual Feedback */}
      {checkInDate && checkOutDate && nights > 0 && (
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={<Icon icon="mdi:calendar-check" width={18} />}
            label={`${nights} night${nights !== 1 ? 's' : ''} selected`}
            color="primary"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      )}

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
    </Box>
  );

  if (isMobileView) {
    return (
      <>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="Check in"
            value={checkInDate ? format(checkInDate, 'MMM d, yyyy') : ''}
            onClick={() => setShowCalendar(true)}
            InputProps={{ readOnly: true }}
            fullWidth
          />
          <TextField
            label="Check out"
            value={checkOutDate ? format(checkOutDate, 'MMM d, yyyy') : ''}
            onClick={() => setShowCalendar(true)}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Box>

        <Drawer
          anchor="bottom"
          open={showCalendar}
          onClose={() => setShowCalendar(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '85vh',
            },
          }}
        >
          <Box sx={{ p: 2 }}>{renderCalendarContent()}</Box>
        </Drawer>
      </>
    );
  }

  return renderCalendarContent();
};

export default DateInput;
