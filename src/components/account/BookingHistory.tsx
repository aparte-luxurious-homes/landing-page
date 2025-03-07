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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/system';
import { format } from 'date-fns';
// import { useGetUserBookingsQuery } from '../../api/bookingsApi'; // Comment out the API import for testing
// import { SerializedError } from '@reduxjs/toolkit';
// import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

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
})<BookingStatusProps>(({ status }) => {
  const colors = {
    PENDING: {
      bg: '#FFECB3', // Light yellow
      color: '#FFB300', // Dark yellow
    },
    CONFIRMED: {
      bg: '#B2DFDB', // Light teal
      color: '#028090', // Custom color
    },
    CANCELLED: {
      bg: '#FFCDD2', // Light red
      color: '#D32F2F', // Dark red
    },
    COMPLETED: {
      bg: '#B2EBF2', // Light blue
      color: '#028090', // Custom color
    },
  };

  const statusColor = colors[status] || colors.PENDING;

  return {
    backgroundColor: statusColor.bg,
    color: statusColor.color,
    fontWeight: 600,
    fontSize: '0.6rem', // Adjust font size here
    height: '18px', // Adjust height to fit the smaller font size
    display: 'flex',
    alignItems: 'center',
  };
});

interface Booking {
  id: string;
  property: {
    name: string;
    id: string;
    image: string; // Add image property for the property
  };
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  total_amount: number;
  status: BookingStatusType;
  created_at: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    property: {
      name: 'Ocean View Apartment',
      id: '101',
      image: 'path/to/ocean-view.jpg', // Mock image path
    },
    check_in: '2025-03-10',
    check_out: '2025-03-15',
    guests: 2,
    nights: 5,
    total_amount: 50000,
    status: 'PENDING',
    created_at: '2025-03-01',
  },
  {
    id: '2',
    property: {
      name: 'Mountain Retreat',
      id: '202',
      image: 'path/to/mountain-retreat.jpg', // Mock image path
    },
    check_in: '2025-04-01',
    check_out: '2025-04-07',
    guests: 4,
    nights: 6,
    total_amount: 120000,
    status: 'CONFIRMED',
    created_at: '2025-03-20',
  },
  {
    id: '3',
    property: {
      name: 'City Center Condo',
      id: '303',
      image: 'path/to/city-center-condo.jpg', // Mock image path
    },
    check_in: '2025-05-05',
    check_out: '2025-05-10',
    guests: 1,
    nights: 5,
    total_amount: 75000,
    status: 'COMPLETED',
    created_at: '2025-04-25',
  },
];

const BookingHistory: React.FC = () => {
  // const { data, isLoading, error } = useGetUserBookingsQuery(undefined, {
  //   selectFromResult: ({ data, isLoading, error }) => ({
  //     data: data as BookingsResponse,
  //     isLoading,
  //     error: error as FetchBaseQueryError | SerializedError | undefined,
  //   }),
  // });

  const isLoading = false; // Set to false for testing
  const error = null; // Set to null for testing
  const data = { data: mockBookings }; // Use mock data for testing

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  const handlePay = (id: string) => {
    // Navigate to payment page
    console.log('Pay for booking:', id);
  };

  const handleContactManager = (id: string) => {
    // Open contact manager options
    console.log('Contact manager for booking:', id);
  };

  const handleTrackBooking = (id: string) => {
    // Navigate to track booking page
    console.log('Track booking:', id);
  };

  const handleRateAndReview = (id: string) => {
    // Navigate to rate and review page
    console.log('Rate and review booking:', id);
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
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button variant="outlined" onClick={() => handleViewDetails(booking)} sx={{ fontSize: '0.6rem' }}>
                    View Details
                  </Button>
                  {booking.status === 'PENDING' && (
                    <Button variant="contained" color="primary" onClick={() => handlePay(booking.id)} sx={{ fontSize: '0.6rem' }}>
                      Pay Now
                    </Button>
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <>
                      <Button variant="contained" color="secondary" onClick={() => handleContactManager(booking.id)} sx={{ fontSize: '0.6rem' }}>
                        Contact Manager
                      </Button>
                      <Button variant="contained" color="info" onClick={() => handleTrackBooking(booking.id)} sx={{ fontSize: '0.6rem' }}>
                        Track Booking
                      </Button>
                    </>
                  )}
                  {booking.status === 'COMPLETED' && (
                    <Button variant="contained" color="primary" onClick={() => handleRateAndReview(booking.id)} sx={{ fontSize: '0.6rem' }}>
                      Rate & Review
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      ))}

      {selectedBooking && (
        <Dialog open={!!selectedBooking} onClose={handleCloseDetails}>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogContent>
            <Typography variant="h6">{selectedBooking.property.name}</Typography>
            <img src={selectedBooking.property.image} alt={selectedBooking.property.name} style={{ width: '100%', marginBottom: '16px' }} />
            <Typography variant="body2" color="text.secondary">
              {format(new Date(selectedBooking.check_in), 'MMM dd, yyyy')} - {format(new Date(selectedBooking.check_out), 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedBooking.guests} guest{selectedBooking.guests > 1 ? 's' : ''} • {selectedBooking.nights} night{selectedBooking.nights > 1 ? 's' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Amount: ₦{selectedBooking.total_amount.toLocaleString()}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default BookingHistory;