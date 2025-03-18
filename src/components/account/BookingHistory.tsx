import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/system';
import { format } from 'date-fns';
import { useGetUserBookingsQuery } from '../../api/bookingsApi';
import type { Booking } from '../../api/bookingsApi';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import Badge from "../badge";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

// type BookingStatusType = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// interface BookingStatusProps {
//   status: BookingStatusType;
// }

// const BookingStatus = styled(Chip, {
//   shouldForwardProp: (prop) => prop !== 'status',
// })<BookingStatusProps>(({ theme, status }) => {
//   const colors = {
//     PENDING: {
//       bg: theme.palette.warning.light,
//       color: theme.palette.warning.dark,
//     },
//     CONFIRMED: {
//       bg: theme.palette.success.light,
//       color: theme.palette.success.dark,
//     },
//     CANCELLED: {
//       bg: theme.palette.error.light,
//       color: theme.palette.error.dark,
//     },
//     COMPLETED: {
//       bg: theme.palette.info.light,
//       color: theme.palette.info.dark,
//     },
//   };

//   const statusColor = colors[status] || colors.PENDING;

//   return {
//     backgroundColor: statusColor.bg,
//     color: statusColor.color,
//     fontWeight: 600,
//   };
// });

interface BookingHistoryProps {
  userId: string;
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ userId }) => {
  const { data, isLoading, error } = useGetUserBookingsQuery(
    { userId },
    {
      selectFromResult: ({ data, isLoading, error }) => ({
        data,
        isLoading,
        error: error as FetchBaseQueryError | SerializedError | undefined,
      }),
    }
  );

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

  if (!data?.data?.data?.length) {
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
      {data.data.data.map((booking: Booking) => (
        <StyledCard key={booking.id}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {booking.unit.property.name} - {booking.unit.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {format(new Date(booking.startDate), 'MMM dd, yyyy')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.guestsCount} guest{booking.guestsCount > 1 ? 's' : ''} • {getNights(booking.startDate, booking.endDate)} night{getNights(booking.startDate, booking.endDate) > 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {booking.unit.property.address}, {booking.unit.property.city}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                <Badge status={booking?.status?.toLocaleLowerCase()} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ₦{parseFloat(booking.totalPrice).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Booking ID: {booking?.bookingId}
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