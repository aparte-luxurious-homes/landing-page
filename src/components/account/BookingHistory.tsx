import React, { useState } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/system';
import { format } from 'date-fns';
import { useGetUserBookingsQuery, useRetryBookingPaymentMutation } from '../../api/bookingsApi';
import type { Booking } from '../../api/bookingsApi';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

type BookingStatusType = 'PENDING' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface BookingStatusProps {
  status: BookingStatusType;
}

const BookingStatus = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})<BookingStatusProps>(({ theme, status }) => {
  const colors = {
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
    CANCELLED: {
      bg: theme.palette.error.light,
      color: theme.palette.error.dark,
    },
    COMPLETED: {
      bg: theme.palette.info.light,
      color: theme.palette.info.dark,
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
  const [retryBookingPayment, { isLoading: isRetrying }] = useRetryBookingPaymentMutation();
  const [retryError, setRetryError] = useState<string | null>(null);
  const [retrySuccess, setRetrySuccess] = useState<string | null>(null);

  const { data, isLoading, error } = useGetUserBookingsQuery(
    undefined,
    {
      selectFromResult: ({ data, isLoading, error }) => ({
        data,
        isLoading,
        error: error as FetchBaseQueryError | SerializedError | undefined,
      }),
    }
  );

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
      setRetryError(err?.data?.detail || 'Failed to verify payment. Please try again.');
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
                  label={booking.status.replace('_', ' ')}
                  status={booking.status}
                  size="small"
                />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ₦{parseFloat(booking.total_price).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Booking ID: {booking.booking_id}
                </Typography>

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
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      ))}
    </Box>
  );
};

export default BookingHistory; 