import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuickProfileComplete from '../booking/QuickProfileComplete';
import { useGetProfileQuery } from '../../api/profileApi';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Skeleton,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/system';
import { format } from 'date-fns';
import {
  useGetUserBookingsQuery,
  useRetryBookingPaymentMutation,
  useCheckInBookingMutation,
  useCheckOutBookingMutation,
  useRequestCancellationMutation
} from '../../api/bookingsApi';
import type { Booking } from '../../api/bookingsApi';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

type BookingStatusType = 'APPROVAL_PENDING' | 'PENDING' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCEL_REQUESTED' | 'CANCELLED' | 'COMPLETED';

interface BookingStatusProps {
  status: BookingStatusType;
}

const BookingStatus = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<BookingStatusProps>(({ theme, status }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    APPROVAL_PENDING: {
      bg: '#fff7ed',
      color: '#c2410c',
    },
    PENDING: {
      bg: theme.palette.warning.light,
      color: theme.palette.warning.dark,
    },
    PENDING_PAYMENT: {
      bg: theme.palette.warning.light,
      color: theme.palette.warning.dark,
    },
    CONFIRMED: {
      bg: theme.palette.success.light,
      color: theme.palette.success.dark,
    },
    CHECKED_IN: {
      bg: theme.palette.info.light,
      color: theme.palette.info.dark,
    },
    CHECKED_OUT: {
      bg: theme.palette.primary.light,
      color: theme.palette.primary.dark,
    },
    CANCEL_REQUESTED: {
      bg: theme.palette.warning.light,
      color: theme.palette.warning.dark,
    },
    CANCELLED: {
      bg: theme.palette.error.light,
      color: theme.palette.error.dark,
    },
    COMPLETED: {
      bg: theme.palette.secondary.light,
      color: theme.palette.secondary.dark,
    },
  };

  const statusColor = colors[status] || colors.PENDING;

  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: 600,
  };
});

interface BookingHistoryProps {
  userId: string;
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ userId: _userId }) => {
  const navigate = useNavigate();
  const [retryBookingPayment, { isLoading: isRetrying }] = useRetryBookingPaymentMutation();
  const [checkInBooking, { isLoading: isCheckingIn }] = useCheckInBookingMutation();
  const [checkOutBooking, { isLoading: isCheckingOut }] = useCheckOutBookingMutation();
  const [requestCancellation, { isLoading: isRequestingCancellation }] = useRequestCancellationMutation();
  const { data: profileData } = useGetProfileQuery();
  const [retryError, setRetryError] = useState<string | null>(null);
  const [retrySuccess, setRetrySuccess] = useState<string | null>(null);
  const [checkoutConfirmId, setCheckoutConfirmId] = useState<string | null>(null);

  const [showProfileComplete, setShowProfileComplete] = useState(false);

  const { data, isLoading, error } = useGetUserBookingsQuery(
    undefined,
    {
      selectFromResult: ({ data, isLoading, error }) => ({
        data,
        isLoading,
        error,
      }),
    }
  );

  const formatError = (error: any): string => {
    if (!error) return 'An unexpected error occurred';

    // Handle case where we get the full RTK Query error object
    const detail = error?.data?.detail || error?.detail || error;

    if (typeof detail === 'string') return detail;

    if (Array.isArray(detail)) {
      return detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
    }

    if (typeof detail === 'object') {
      return detail.message || detail.msg || JSON.stringify(detail);
    }

    return 'An unexpected error occurred';
  };

  const handleRetryPayment = async (bookingId: string) => {
    setRetryError(null);
    setRetrySuccess(null);

    try {
      const result = await retryBookingPayment(bookingId).unwrap();
      if (result.data.success) {
        setRetrySuccess(result.data.message || 'Payment verified successfully!');
      } else {
        setRetryError(result.data.message || 'Payment verification failed');
      }
    } catch (err: any) {
      setRetryError(formatError(err));
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    setRetryError(null);
    setRetrySuccess(null);
    try {
      const result = await checkInBooking(bookingId).unwrap();
      setRetrySuccess(result.message || 'Check-in successful!');
    } catch (err: any) {
      const errorDataDetail = err?.data?.detail;
      const isKycRequired =
        errorDataDetail?.code === 'KYC_REQUIRED' ||
        (Array.isArray(errorDataDetail) && errorDataDetail[0]?.code === 'KYC_REQUIRED') ||
        typeof errorDataDetail === 'string' && errorDataDetail.includes('Identity verification');

      if (isKycRequired) {
        setRetryError(errorDataDetail?.message || 'Please complete your identity verification to proceed with check-in.');
        setShowProfileComplete(true);
        return;
      }
      setRetryError(formatError(err));
    }
  };

  const handleCheckOut = async (bookingId: string, skipConfirm = false) => {
    setRetryError(null);
    setRetrySuccess(null);

    // If skipConfirm is false, check if it's an early checkout
    if (!skipConfirm) {
      const booking = data?.data?.items?.find((b: Booking) => b.id === bookingId);
      if (booking && booking.end_date) {
        const endDate = new Date(booking.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // If today is before end date, show confirmation
        if (today < endDate) {
          setCheckoutConfirmId(bookingId);
          return;
        }
      }
    }

    setCheckoutConfirmId(null);
    try {
      const result = await checkOutBooking(bookingId).unwrap();
      setRetrySuccess(result.message || 'Check-out successful!');
    } catch (err: any) {
      setRetryError(formatError(err));
    }
  };

  const handleRequestCancellation = async (bookingId: string) => {
    setRetryError(null);
    setRetrySuccess(null);
    try {
      const result = await requestCancellation({ bookingId, cancellation_reason: 'Guest requested cancellation' }).unwrap();
      setRetrySuccess(result.message || 'Cancellation request sent!');
    } catch (err: any) {
      setRetryError(formatError(err));
    }
  };

  if (isLoading) {
    return (
      <Box>
        {[...Array(3)].map((_, index) => (
          <StyledCard key={index}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="30%" height={20} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Skeleton variant="rectangular" height={60} />
                </Grid>
              </Grid>
            </CardContent>
          </StyledCard>
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">
          Failed to load booking history. Please try again later.
        </Typography>
      </Box>
    );
  }

  if (!data?.data?.items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          You haven't made any bookings yet.
        </Typography>
      </Box>
    );
  }

  // Calculate nights between dates
  const getNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Box>
      {retrySuccess && (
        <Alert severity="success" onClose={() => setRetrySuccess(null)} sx={{ mb: 2 }}>
          {retrySuccess}
        </Alert>
      )}
      {retryError && (
        <Alert severity="error" onClose={() => setRetryError(null)} sx={{ mb: 2 }}>
          {retryError}
        </Alert>
      )}

      {data.data.items.map((booking: Booking) => (
        <StyledCard key={booking.id}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {booking.property?.name || booking.unit?.name || 'Booking Information'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {booking.start_date ? format(new Date(booking.start_date), 'MMM dd, yyyy') : '--'} - {booking.end_date ? format(new Date(booking.end_date), 'MMM dd, yyyy') : '--'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.guests_count || 0} guest{(booking.guests_count || 0) > 1 ? 's' : ''} • {booking.start_date && booking.end_date ? getNights(booking.start_date, booking.end_date) : 0} night{(getNights(booking.start_date || '', booking.end_date || '') || 0) > 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {booking.property?.address || 'N/A'}{booking.property?.city ? `, ${booking.property.city}` : ''}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                <BookingStatus
                  label={booking.status === 'APPROVAL_PENDING' ? 'Awaiting Approval' : booking.status.replace(/_/g, ' ')}
                  status={booking.status}
                  size="small"
                />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ₦{parseFloat(booking.total_price).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Booking ID: {booking.booking_id}
                </Typography>

                {booking.status === 'APPROVAL_PENDING' && (
                  <Typography variant="caption" sx={{ mt: 1, color: '#c2410c', fontWeight: 600, display: 'block' }}>
                    Awaiting owner approval
                  </Typography>
                )}

                {booking.status === 'PENDING' && !booking.transaction_ref && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate('/confirm-booking', {
                      state: {
                        existingBookingId: booking.booking_id,
                        bookingContext: {
                          id: booking.property?.id,
                          title: booking.property?.name || booking.unit?.name || 'Property',
                          unit_id: booking.unit_id || booking.unit?.id,
                          check_in_date: booking.start_date,
                          check_out_date: booking.end_date,
                          adults: booking.guests_count,
                          unit_count: booking.unit_count || 1,
                          total_charging_fee: parseFloat(booking.total_price),
                          caution_fee: parseFloat(booking.caution_fee || '0'),
                          base_price: parseFloat(booking.unit?.price_per_night || '0'),
                          nights: Math.round((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / 86400000),
                          unit_image: '',
                        }
                      }
                    })}
                    sx={{ mt: 1, bgcolor: '#028090', '&:hover': { bgcolor: '#026d7a' } }}
                  >
                    Complete Payment
                  </Button>
                )}

                {(booking.status === 'PENDING' || booking.status === 'PENDING_PAYMENT') && booking.transaction_ref && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleRetryPayment(booking.id)}
                    disabled={isRetrying}
                    sx={{ mt: 1 }}
                  >
                    {isRetrying ? <CircularProgress size={20} /> : 'Retry Payment'}
                  </Button>
                )}

                {booking.status === 'CONFIRMED' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleCheckIn(booking.id)}
                    disabled={isCheckingIn}
                    sx={{ mt: 1, bgcolor: '#028090', '&:hover': { bgcolor: '#026d7a' } }}
                  >
                    {isCheckingIn ? <CircularProgress size={20} /> : 'Check In'}
                  </Button>
                )}

                {booking.status === 'CHECKED_IN' && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleCheckOut(booking.id)}
                    disabled={isCheckingOut}
                    sx={{ mt: 1, bgcolor: '#028090', '&:hover': { bgcolor: '#026d7a' } }}
                  >
                    {isCheckingOut ? <CircularProgress size={20} /> : 'Check Out'}
                  </Button>
                )}

                {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    onClick={() => handleRequestCancellation(booking.id)}
                    disabled={isRequestingCancellation}
                    sx={{ mt: 1 }}
                  >
                    {isRequestingCancellation ? <CircularProgress size={20} /> : 'Request Cancellation'}
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      ))}

      {/* Early Checkout Confirmation Dialog */}
      <Dialog
        open={!!checkoutConfirmId}
        onClose={() => setCheckoutConfirmId(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Early Check-Out Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {(() => {
              const selectedBooking = checkoutConfirmId ? data?.data?.items?.find((b: Booking) => b.id === checkoutConfirmId) : null;
              const endDateStr = selectedBooking?.end_date ? format(new Date(selectedBooking.end_date), 'MMM dd, yyyy') : 'the scheduled date';
              return `Your stay is scheduled to end on ${endDateStr}. Are you sure you want to check out early? This action cannot be undone.`;
            })()}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCheckoutConfirmId(null)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Stay longer
          </Button>
          <Button
            onClick={() => checkoutConfirmId && handleCheckOut(checkoutConfirmId, true)}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 2,
              bgcolor: '#028090',
              '&:hover': { bgcolor: '#026d7a' }
            }}
          >
            Confirm Check-Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Completion Modal for KYC */}
      {showProfileComplete && (
        <QuickProfileComplete
          initialData={{
            firstName: profileData?.data?.profile?.firstName,
            lastName: profileData?.data?.profile?.lastName,
            phone: profileData?.data?.phone,
            dob: profileData?.data?.profile?.dob ? String(profileData.data.profile.dob) : undefined,
          }}
          onComplete={() => {
            setShowProfileComplete(false);
          }}
        />
      )}
    </Box>
  );
};

export default BookingHistory; 