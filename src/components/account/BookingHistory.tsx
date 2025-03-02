import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/system';
import { format } from 'date-fns';
import { useGetUserBookingsQuery } from '../../api/bookingsApi';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

type BookingStatusType = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

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

interface Booking {
  id: string;
  property: {
    name: string;
    id: string;
  };
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_amount: number;
  status: BookingStatusType;
  created_at: string;
}

interface BookingsResponse {
  data: Booking[];
  message: string;
}

const BookingHistory: React.FC = () => {
  const { data, isLoading, error } = useGetUserBookingsQuery(undefined, {
    selectFromResult: ({ data, isLoading, error }) => ({
      data: data as BookingsResponse,
      isLoading,
      error: error as FetchBaseQueryError | SerializedError | undefined,
    }),
  });

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

  if (!data?.data?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          You haven't made any bookings yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {data.data.map((booking: Booking) => (
        <StyledCard key={booking.id}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {booking.property.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {format(new Date(booking.check_in), 'MMM dd, yyyy')} - {format(new Date(booking.check_out), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.guests} guest{booking.guests > 1 ? 's' : ''} • {booking.nights} night{booking.nights > 1 ? 's' : ''}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                <BookingStatus
                  label={booking.status.replace('_', ' ')}
                  status={booking.status}
                  size="small"
                />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ₦{booking.total_amount.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      ))}
    </Box>
  );
};

export default BookingHistory; 