'use client';

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
  Typography,
  IconButton,
  Box,
  TextField,
  Drawer,
  Button,
} from '@mui/material';
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
  isEventCentre?: boolean;
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
  maxMonths = 6,
  isEventCentre = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

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
      if (isEventCentre) {
        onCheckOutDateSelect(date);
        onClose();
      } else {
        onCheckOutDateSelect(null);
      }
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
  const isSelectingCheckoutNow = !!checkInDate && !checkOutDate;

  const BRAND = '#028090';
  const DEEP = '#026672';
  const BAND = '#E3F2F4';
  const SERIF = 'Fraunces, ui-serif, Georgia, serif';

  const renderCalendar = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const firstDayIndex = start.getDay();
    const isSelectingCheckout = !!checkInDate && !checkOutDate;

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          rowGap: 0.5,
        }}
      >
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <Typography
            key={i}
            align="center"
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'rgba(25,25,25,0.45)',
              pb: 0.75,
            }}
          >
            {d}
          </Typography>
        ))}

        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <Box key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const key = formatDateLocal(day);
          const avail = availableDates.find(
            (a: any) => formatDateLocal(new Date(a.date)) === key
          );
          const col = day.getDay();
          const isToday = key === formatDateLocal(today);
          const isBlackout = !!(avail?.is_blackout || avail?.isBlackout);
          const isBookedOut = avail?.count === 0;
          const specialPrice = avail?.pricing;
          const isDisabled = shouldDateAppearDisabled(day);

          const isStart = !!checkInDate && formatDateLocal(checkInDate) === key;
          const isEnd = !!checkOutDate && formatDateLocal(checkOutDate) === key;
          const isSelected = isStart || isEnd;
          const rangeEnd = checkOutDate ?? (isSelectingCheckout && hoverDate && hoverDate > checkInDate! ? hoverDate : null);
          const inRange = !!checkInDate && !!rangeEnd && day > checkInDate && day < rangeEnd;
          const isPreview = !checkOutDate && inRange;
          const isRangeEnd = !!rangeEnd && formatDateLocal(rangeEnd) === key;
          const hasTail = !!checkInDate && !!rangeEnd && ((isStart && rangeEnd > checkInDate) || (isRangeEnd && rangeEnd > checkInDate));

          // The band is painted on the cell (full width) so consecutive days
          // read as one continuous strip; endpoints get a half band.
          let band = 'transparent';
          if (inRange) band = isPreview ? 'rgba(2,128,144,0.08)' : BAND;
          else if (hasTail && isStart)
            band = `linear-gradient(to right, transparent 50%, ${checkOutDate ? BAND : 'rgba(2,128,144,0.08)'} 50%)`;
          else if (hasTail && isRangeEnd && checkOutDate)
            band = `linear-gradient(to left, transparent 50%, ${BAND} 50%)`;
          else if (hasTail && isRangeEnd)
            band = `linear-gradient(to left, transparent 50%, rgba(2,128,144,0.08) 50%)`;

          const muted = isDisabled && !isSelected;

          return (
            <Box
              key={day.getTime()}
              sx={{
                background: band,
                display: 'flex',
                justifyContent: 'center',
                ...(inRange && col === 0 && { borderRadius: '999px 0 0 999px' }),
                ...(inRange && col === 6 && { borderRadius: '0 999px 999px 0' }),
              }}
            >
              <Box
                component="button"
                type="button"
                aria-label={format(day, 'EEEE, d MMMM yyyy')}
                aria-pressed={isSelected}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                sx={{
                  all: 'unset',
                  boxSizing: 'border-box',
                  width: '100%',
                  maxWidth: 48,
                  aspectRatio: '1 / 1',
                  minHeight: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  bgcolor: isSelected ? DEEP : 'transparent',
                  color: isSelected ? '#fff' : muted ? 'rgba(25,25,25,0.28)' : '#191919',
                  boxShadow: isSelected ? '0 6px 14px -4px rgba(2,102,114,0.55)' : 'none',
                  transition: 'background-color .15s, transform .15s',
                  WebkitTapHighlightColor: 'transparent',
                  '&:hover': !isDisabled && !isSelected ? { boxShadow: `inset 0 0 0 1.5px ${BRAND}` } : undefined,
                  '&:active': !isDisabled ? { transform: 'scale(0.92)' } : undefined,
                  '&:focus-visible': { outline: `3px solid ${BRAND}`, outlineOffset: 1 },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.9375rem',
                    fontWeight: isSelected || isToday ? 700 : 500,
                    lineHeight: 1,
                    textDecoration: isBlackout || (isBookedOut && !isSelectingCheckout) ? 'line-through' : 'none',
                  }}
                >
                  {format(day, 'd')}
                </Box>
                {specialPrice && !isDisabled ? (
                  <Box
                    component="span"
                    sx={{
                      mt: '3px',
                      fontSize: '0.5625rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      color: isSelected ? 'rgba(255,255,255,0.85)' : BRAND,
                    }}
                  >
                    ₦{Math.round(specialPrice / 1000)}k
                  </Box>
                ) : isToday && !isSelected ? (
                  <Box component="span" sx={{ mt: '4px', width: 4, height: 4, borderRadius: '50%', bgcolor: BRAND }} />
                ) : null}
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  const DateCard: React.FC<{ label: string; date: Date | null; active: boolean; placeholder: string }> = ({
    label,
    date,
    active,
    placeholder,
  }) => (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        px: 2,
        py: 1.25,
        borderRadius: '18px',
        border: '1.5px solid',
        borderColor: active ? BRAND : 'rgba(25,25,25,0.12)',
        bgcolor: active ? 'rgba(2,128,144,0.06)' : '#fff',
        transition: 'all .2s',
      }}
    >
      <Typography sx={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: active ? DEEP : 'rgba(25,25,25,0.5)' }}>
        {label}
      </Typography>
      <Typography noWrap sx={{ fontFamily: SERIF, fontWeight: 600, fontSize: '1.125rem', color: date ? '#191919' : 'rgba(25,25,25,0.35)' }}>
        {date ? format(date, 'EEE, d MMM') : placeholder}
      </Typography>
    </Box>
  );

  const chipSx = {
    textTransform: 'none',
    borderRadius: 999,
    px: 1.75,
    py: 0.5,
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: DEEP,
    borderColor: 'rgba(25,25,25,0.15)',
    flexShrink: 0,
    '&:hover': { borderColor: BRAND, bgcolor: 'rgba(2,128,144,0.06)' },
  } as const;

  const renderMonthHeader = (month: Date, prev: boolean, next: boolean) => {
    const navBtn = {
      width: 36,
      height: 36,
      border: '1px solid rgba(25,25,25,0.12)',
      '&:hover': { bgcolor: 'rgba(2,128,144,0.08)' },
      '&.Mui-disabled': { opacity: 0.35 },
    };
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, minHeight: 36 }}>
        {prev ? (
          <IconButton aria-label="Previous month" onClick={handlePrevMonth} disabled={!canGoPrev} sx={navBtn}>
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box sx={{ width: 36 }} />
        )}
        <Typography sx={{ fontFamily: SERIF, fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em' }}>
          {format(month, 'MMMM yyyy')}
        </Typography>
        {next ? (
          <IconButton aria-label="Next month" onClick={handleNextMonth} disabled={!canGoNext} sx={navBtn}>
            <NavigateNextIcon fontSize="small" />
          </IconButton>
        ) : (
          <Box sx={{ width: 36 }} />
        )}
      </Box>
    );
  };

  const canGoPrev = startOfMonth(currentMonth) > startOfMonth(today);
  const canGoNext = isBefore(endOfMonth(addMonths(currentMonth, showTwoMonths ? 1 : 0)), maxDate);

  const renderCalendarContent = () => (
    <Box
      sx={{
        width,
        p: { xs: 2, md: 2.5 },
        backgroundColor: '#fff',
        borderRadius: '28px',
        boxShadow: '0 24px 48px -16px rgba(25,25,25,0.2)',
        border: '1px solid rgba(25,25,25,0.06)',
      }}
    >
      {/* Selection summary */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {isEventCentre ? (
          <DateCard label="Event date" date={checkInDate} active={!checkInDate} placeholder="Pick a day" />
        ) : (
          <>
            <DateCard label="Check-in" date={checkInDate} active={!checkInDate} placeholder="Add date" />
            <DateCard label="Check-out" date={checkOutDate} active={isSelectingCheckoutNow} placeholder="Add date" />
          </>
        )}
      </Box>

      {/* Quick picks */}
      {!isEventCentre && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mb: 2.5,
            overflowX: 'auto',
            mx: -0.5,
            px: 0.5,
            pb: 0.5,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Button size="small" variant="outlined" onClick={() => handleQuickSelect(1)} sx={chipSx}>
            <Icon icon="mdi:moon-waning-crescent" width={16} style={{ marginRight: 6 }} />
            1 night
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleQuickSelect(2)} sx={chipSx}>
            <Icon icon="mdi:moon-waning-gibbous" width={16} style={{ marginRight: 6 }} />
            2 nights
          </Button>
          <Button size="small" variant="outlined" onClick={handleWeekendSelect} sx={chipSx}>
            <Icon icon="mdi:calendar-weekend" width={16} style={{ marginRight: 6 }} />
            Weekend
          </Button>
        </Box>
      )}

      {/* Months */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: showTwoMonths ? '1fr 1fr' : '1fr' }, columnGap: 4, rowGap: 3 }}>
        <Box>
          {renderMonthHeader(currentMonth, true, !showTwoMonths)}
          {renderCalendar(currentMonth)}
        </Box>
        {showTwoMonths && (
          <Box>
            {renderMonthHeader(addMonths(currentMonth, 1), false, true)}
            {renderCalendar(addMonths(currentMonth, 1))}
          </Box>
        )}
      </Box>

      {/* Nights stepper — appears once a check-in is picked */}
      {!isEventCentre && checkInDate && (
        <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid rgba(25,25,25,0.08)' }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(25,25,25,0.5)', mb: 1 }}>
            Or pick a length of stay
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => {
              const isSelected = nights === n;
              const isAvailable = areConsecutiveDatesAvailable(checkInDate, n);
              return (
                <Box
                  key={n}
                  component="button"
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => {
                    const newCheckOut = new Date(checkInDate);
                    newCheckOut.setDate(newCheckOut.getDate() + n);
                    onCheckOutDateSelect(newCheckOut);
                    onClose();
                  }}
                  sx={{
                    all: 'unset',
                    boxSizing: 'border-box',
                    flexShrink: 0,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    color: isSelected ? '#fff' : isAvailable ? DEEP : 'rgba(25,25,25,0.25)',
                    bgcolor: isSelected ? DEEP : 'transparent',
                    border: '1.5px solid',
                    borderColor: isSelected ? DEEP : 'rgba(25,25,25,0.15)',
                    WebkitTapHighlightColor: 'transparent',
                    '&:hover': isAvailable && !isSelected ? { borderColor: BRAND } : undefined,
                  }}
                >
                  {n}
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Footer: live summary + clear */}
      {!isEventCentre && checkInDate && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={{ fontWeight: 700, color: DEEP, fontSize: '0.9375rem' }}>
            {nights > 0 ? `${nights} night${nights !== 1 ? 's' : ''} selected` : 'Now choose a check-out'}
          </Typography>
          <Button
            size="small"
            onClick={() => {
              onCheckInDateSelect(null);
              onCheckOutDateSelect(null);
            }}
            sx={{ textTransform: 'none', fontWeight: 700, color: 'rgba(25,25,25,0.7)', textDecoration: 'underline' }}
          >
            Clear dates
          </Button>
        </Box>
      )}
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
