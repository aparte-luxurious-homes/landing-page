import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Close as CloseIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import {
  addDays,
  addMonths,
  subMonths,
  differenceInDays,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  startOfToday,
} from 'date-fns';
import { useRequestStayExtensionMutation } from '../../api/bookingsApi';
import { useGetUnitAvailabilityQuery } from '../../api/propertiesApi';
import { 
  usePostPaymentMutation, 
  useGetGatewayConfigQuery 
} from '../../api/paymentApi';
import { useGetProfileQuery } from '../../api/profileApi';
import PaymentMethodSelection from '../booking/PaymentMethodSelection';
import { toast } from 'react-toastify';

interface ExtendStayModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  currentEndDate: string; // YYYY-MM-DD
  pricePerNight: number;
  propertyName: string;
  propertyId?: string;
  unitId?: string;
}

const ExtendStayModal: React.FC<ExtendStayModalProps> = ({
  open,
  onClose,
  bookingId,
  currentEndDate,
  pricePerNight,
  propertyName,
  propertyId,
  unitId,
}) => {
  const parseDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentEndDateObj = parseDate(currentEndDate);
  const today = startOfToday();
  
  const [newEndDate, setNewEndDate] = useState<Date | null>(
    addDays(currentEndDateObj, 1)
  );
  const [calendarMonth, setCalendarMonth] = useState(
    startOfMonth(addDays(currentEndDateObj, 1))
  );
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('');
  
  const [requestExtension, { isLoading: isRequesting }] = useRequestStayExtensionMutation();
  const [postPayment, { isLoading: isInitializingPayment }] = usePostPaymentMutation();
  const { data: profileData } = useGetProfileQuery();
  const { data: gatewayConfigResponse } = useGetGatewayConfigQuery(
    paymentGateway,
    { skip: !paymentGateway || paymentMethod !== 'ONLINE' }
  );

  const wallet = profileData?.data?.wallets?.find((w: any) => w.currency === 'NGN');

  // The earliest selectable date is the day after the current checkout
  const minDate = addDays(currentEndDateObj, 1);

  const { data: availabilityData, isLoading: isAvailabilityLoading } = useGetUnitAvailabilityQuery(
    { propertyId: propertyId!, unitId: unitId! },
    { skip: !propertyId || !unitId || !open }
  );

  // Process availability data into lookup-friendly structures
  const { unavailableDates, firstBlockedDate } = React.useMemo(() => {
    if (!availabilityData?.data || !Array.isArray(availabilityData.data)) {
      return { unavailableDates: new Map<string, { isBlackout: boolean; isBooked: boolean }>(), firstBlockedDate: undefined };
    }

    const dateMap = new Map<string, { isBlackout: boolean; isBooked: boolean }>();

    availabilityData.data.forEach((item: any) => {
      const dateStr = typeof item === 'string' ? item : item.date;
      if (!dateStr) return;

      const isBlackout = item.is_blackout || item.isBlackout || item.is_black_out || false;
      const isBooked = item.count === 0 || item.status === 'UNAVAILABLE' || item.status === 'BOOKED';

      if (isBlackout || isBooked) {
        dateMap.set(dateStr, { isBlackout, isBooked: isBooked && !isBlackout });
      }
    });

    // Find the first blocked date AFTER the current end date.
    // For extensions, the guest's stay must be contiguous — they can't skip
    // over a blocked date. So the first blackout or booked date after
    // currentEndDate is the hard wall.
    const sortedBlockedDates = Array.from(dateMap.keys())
      .filter(dateStr => {
        const d = parseDate(dateStr);
        return d.getTime() > currentEndDateObj.getTime();
      })
      .sort();

    const firstBlocked = sortedBlockedDates.length > 0
      ? parseDate(sortedBlockedDates[0])
      : undefined;

    return { unavailableDates: dateMap, firstBlockedDate: firstBlocked };
  }, [availabilityData, currentEndDateObj]);

  /**
   * Determines if a given date should be disabled (not selectable) in the calendar.
   * 
   * For stay extensions, the new checkout date must satisfy ALL of:
   * 1. It's after the current checkout date (minDate)
   * 2. Every night between currentEndDate and the new date is available
   * 3. The date itself is not a blackout date
   * 
   * Key booking rule from the main DateInput:
   * - Blackout dates: ALWAYS disabled (guest can't check out on a blackout)
   * - Booked-out dates (count=0): ALLOWED as checkout (guest leaves that morning,
   *   so the next guest can check in that same day)
   * - But booked-out dates block INTERMEDIATE nights
   */
  const isDateDisabled = (date: Date): boolean => {
    // Must be after current checkout
    if (date <= currentEndDateObj) return true;
    // Must not be in the past
    if (isBefore(date, today)) return true;

    const dateStr = formatDateLocal(date);
    const entry = unavailableDates.get(dateStr);

    // Blackout dates are always disabled — can't check out on owner-blocked days
    if (entry?.isBlackout) return true;

    // Check if all intermediate nights are available.
    // The guest stays each night from currentEndDate to (newEndDate - 1).
    // If ANY intermediate date is blocked (blackout OR booked), this date is unreachable.
    if (firstBlockedDate && date > firstBlockedDate) {
      // If the target date is past the first blocked date, all
      // intermediate nights can't be available
      return true;
    }

    // Special case: if the target date IS the firstBlockedDate AND it's a
    // booked date (not blackout), allow it as checkout
    if (firstBlockedDate && date.getTime() === firstBlockedDate.getTime()) {
      const blockedEntry = unavailableDates.get(formatDateLocal(firstBlockedDate));
      // If the blocked date is a blackout, disabled. If booked, allowed as checkout.
      if (blockedEntry?.isBlackout) return true;
      // It's booked — allowed as checkout (guest leaves that morning)
      return false;
    }

    return false;
  };

  /**
   * Returns visual styling info for each date cell.
   */
  const getDateStatus = (date: Date): {
    isDisabled: boolean;
    isBlackout: boolean;
    isBooked: boolean;
    isSelected: boolean;
    isInRange: boolean;
    isPast: boolean;
    isBeforeMin: boolean;
  } => {
    const dateStr = formatDateLocal(date);
    const entry = unavailableDates.get(dateStr);
    const disabled = isDateDisabled(date);
    const isPast = isBefore(date, today);
    const isBeforeMin = date <= currentEndDateObj;

    return {
      isDisabled: disabled,
      isBlackout: entry?.isBlackout || false,
      isBooked: entry?.isBooked || false,
      isSelected: newEndDate ? formatDateLocal(newEndDate) === dateStr : false,
      isInRange: newEndDate
        ? date > currentEndDateObj && date < newEndDate
        : false,
      isPast,
      isBeforeMin,
    };
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    setNewEndDate(date);
  };

  const handlePrevMonth = () => {
    setCalendarMonth(subMonths(calendarMonth, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(addMonths(calendarMonth, 1));
  };

  const extraNights = newEndDate 
    ? Math.max(0, differenceInDays(
        new Date(newEndDate.getFullYear(), newEndDate.getMonth(), newEndDate.getDate()),
        new Date(currentEndDateObj.getFullYear(), currentEndDateObj.getMonth(), currentEndDateObj.getDate())
      ))
    : 0;
  
  const dailyRate = pricePerNight || 0;
  const extensionAmount = extraNights * dailyRate;

  const handleSubmit = async () => {
    if (!newEndDate) return;
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if (paymentMethod === 'ONLINE' && !paymentGateway) {
      toast.error('Please select a payment gateway');
      return;
    }
    if (!wallet?.id) {
      toast.error('Wallet information not found');
      return;
    }

    if (isDateDisabled(newEndDate)) {
      toast.error('The selected date is no longer available. Please choose an earlier date.');
      return;
    }
    
    try {
      // Step 1: Create the Extension Booking
      const extensionResponse = await requestExtension({
        bookingId,
        new_end_date: format(newEndDate, 'yyyy-MM-dd'),
      }).unwrap();

      const createdBookingId = extensionResponse.booking_id;
      const totalAmount = extensionResponse.total_price;

      // Step 2: Initiate Payment
      const paymentPayload = {
        amount: totalAmount.toString(),
        booking_id: createdBookingId,
        provider: paymentMethod === 'WALLET' ? '' : paymentGateway,
        description: `Stay Extension Payment for booking ${createdBookingId}`,
        action: 'DEBIT',
        comment: 'Extension Payment',
        userId: profileData?.data?.userId || '',
        currency: 'NGN',
        type: 'PAYMENT',
        email: profileData?.data?.email || '',
        propertyId: 0, 
        redirect_url: `${window.location.origin}/booking-validation?bookingId=${createdBookingId}&isExtension=true`
      };

      const paymentResponse = await postPayment({
        id: wallet.id,
        payload: paymentPayload,
      }).unwrap();

      const transactionRef = paymentResponse?.data?.reference;
      
      if (paymentMethod === 'WALLET' && paymentResponse?.data?.status === 'SUCCESSFUL') {
        toast.success('Stay extended successfully (paid from wallet)');
        onClose();
        setTimeout(() => window.location.reload(), 1500);
        return;
      }

      if (paymentMethod === 'ONLINE' && paymentResponse?.data?.paymentLink) {
        const gatewayConfig = gatewayConfigResponse?.data;
        const validationUrl = `${window.location.origin}/booking-validation?paymentReference=${transactionRef}&bookingId=${createdBookingId}&provider=${paymentGateway}&isExtension=true`;

        if (paymentGateway === 'MONNIFY' && window.MonnifySDK && gatewayConfig) {
          window.MonnifySDK.initialize({
            amount: totalAmount,
            currency: 'NGN',
            reference: transactionRef,
            customerFullName: `${profileData?.data?.profile?.firstName || ''} ${profileData?.data?.profile?.lastName || ''}`.trim() || 'Customer',
            customerEmail: profileData?.data?.email,
            apiKey: gatewayConfig.apiKey,
            contractCode: gatewayConfig.contractCode,
            paymentDescription: `Extension Payment for ${createdBookingId}`,
            isTestMode: gatewayConfig.isTestMode,
            onComplete: () => {
              window.location.href = validationUrl;
            },
            onClose: () => {
              toast.info('Payment window closed');
            },
          });
        } else if (paymentGateway === 'PAYSTACK' && window.PaystackPop && gatewayConfig) {
          const handler = window.PaystackPop.setup({
            key: gatewayConfig.publicKey,
            email: profileData?.data?.email,
            amount: totalAmount * 100,
            ref: transactionRef,
            callback: () => {
              window.location.href = validationUrl;
            },
            onClose: () => {
              toast.info('Payment window closed');
            },
          });
          handler.openIframe();
        } else {
          // Fallback to payment link
          window.location.href = paymentResponse.data.paymentLink;
        }
      }
    } catch (err: any) {
      console.error('Extension payment failed:', err);
      toast.error(err?.data?.message || 'Failed to process stay extension payment');
    }
  };

  // Render a single month's calendar grid
  const renderCalendar = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const firstDayIndex = start.getDay();

    return (
      <Grid container spacing={0.5}>
        {/* Day-of-week headers */}
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <Grid key={day} size={{ xs: 1.7 }}>
            <Typography
              variant="caption"
              align="center"
              sx={{ 
                display: 'block', 
                fontWeight: 600, 
                color: 'text.secondary',
                fontSize: '0.7rem',
                py: 0.5,
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}

        {/* Empty cells before the 1st */}
        {Array.from({ length: firstDayIndex }).map((_, index) => (
          <Grid key={`empty-${index}`} size={{ xs: 1.7 }} />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const status = getDateStatus(day);

          return (
            <Grid key={day.getTime()} size={{ xs: 1.7 }}>
              <Paper
                elevation={0}
                onClick={() => handleDateClick(day)}
                sx={{
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: status.isDisabled ? 'not-allowed' : 'pointer',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  backgroundColor: status.isSelected
                    ? '#028090'
                    : status.isInRange
                      ? '#e0f2f1'
                      : status.isBlackout
                        ? '#fff1f1'
                        : status.isBooked && !status.isSelected
                          ? '#fff7ed'
                          : '#fff',
                  border: status.isSelected
                    ? '2px solid #026672'
                    : status.isBlackout
                      ? '1px dashed #fecaca'
                      : status.isBooked
                        ? '1px solid #fed7aa'
                        : '1px solid #f3f4f6',
                  opacity: status.isDisabled
                    ? (status.isPast || status.isBeforeMin ? 0.35 : 0.5)
                    : 1,
                  '&:hover': {
                    backgroundColor: !status.isDisabled
                      ? status.isSelected
                        ? '#026672'
                        : '#f0fdfa'
                      : undefined,
                    transform: !status.isDisabled ? 'scale(1.05)' : undefined,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: status.isSelected ? 700 : 400,
                    color: status.isSelected
                      ? '#fff'
                      : status.isInRange
                        ? '#028090'
                        : status.isBlackout
                          ? '#dc2626'
                          : status.isBooked
                            ? '#ea580c'
                            : status.isDisabled
                              ? '#9ca3af'
                              : '#374151',
                    textDecoration: status.isBlackout ? 'line-through' : 'none',
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                {/* Small dot indicator for blackout/booked */}
                {status.isBlackout && (
                  <Box sx={{
                    position: 'absolute', top: 2, right: 2,
                    width: 4, height: 4, bgcolor: '#dc2626', borderRadius: '50%',
                  }} />
                )}
                {status.isBooked && !status.isBlackout && (
                  <Box sx={{
                    position: 'absolute', top: 2, right: 2,
                    width: 4, height: 4, bgcolor: '#f97316', borderRadius: '50%',
                  }} />
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Extend Stay
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Extending your stay at <strong>{propertyName}</strong>
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'info.main' }}>
            Current Check-out: {format(currentEndDateObj, 'MMM dd, yyyy')}
          </Typography>

          {/* Custom Calendar */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              New Check-out Date
            </Typography>

            {isAvailabilityLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#028090' }} />
              </Box>
            ) : (
              <Box sx={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: 2, 
                p: 1.5,
                bgcolor: '#fafafa',
              }}>
                {/* Month navigation header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <IconButton
                    onClick={handlePrevMonth}
                    size="small"
                    disabled={isBefore(calendarMonth, startOfMonth(minDate))}
                  >
                    <NavigateBeforeIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#028090' }}>
                    {format(calendarMonth, 'MMMM yyyy')}
                  </Typography>
                  <IconButton onClick={handleNextMonth} size="small">
                    <NavigateNextIcon fontSize="small" />
                  </IconButton>
                </Box>

                {renderCalendar(calendarMonth)}

                {/* Legend */}
                <Box sx={{ mt: 1.5, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, bgcolor: '#028090', borderRadius: '50%' }} />
                    <Typography variant="caption" color="text.secondary">Selected</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, bgcolor: '#f97316', borderRadius: '50%' }} />
                    <Typography variant="caption" color="text.secondary">Booked</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, bgcolor: '#dc2626', borderRadius: '50%' }} />
                    <Typography variant="caption" color="text.secondary">Unavailable</Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {newEndDate && (
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 500, color: '#028090' }}>
                New check-out: {format(newEndDate, 'MMMM d, yyyy')}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ bgcolor: '#f8fafb', p: 2, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Additional Nights</Typography>
              <Typography variant="body2" fontWeight={600}>{extraNights} {extraNights === 1 ? 'night' : 'nights'}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Daily Rate</Typography>
              <Typography variant="body2" fontWeight={600}>₦{dailyRate.toLocaleString()}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1" fontWeight={700}>Total Extension Cost</Typography>
              <Typography variant="subtitle1" fontWeight={700} color="primary">
                ₦{extensionAmount.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 1 }}>
            <PaymentMethodSelection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              paymentGateway={paymentGateway}
              setPaymentGateway={setPaymentGateway}
              wallet={wallet}
              formatPrice={(p) => `₦${p.toLocaleString()}`}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, px: 3 }}>
        <Button onClick={onClose} variant="text" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isRequesting || isInitializingPayment || isAvailabilityLoading || !newEndDate || extraNights <= 0}
          sx={{ 
            bgcolor: '#028090', 
            '&:hover': { bgcolor: '#026f7a' },
            minWidth: 150
          }}
        >
          {isRequesting || isInitializingPayment ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            paymentMethod === 'WALLET' ? 'Pay with Wallet' : 'Proceed to Pay'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtendStayModal;
