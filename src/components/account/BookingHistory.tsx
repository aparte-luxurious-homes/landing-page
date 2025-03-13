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
  TextField,
  Rating,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/system';
import { format } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useGetUserBookingsQuery } from '../../api/bookingsApi';
import { useCreatePropertyReviewMutation } from '../../api/reviewApi';
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
    fontWeight: 500,
    fontSize: '0.4rem', // Adjust font size here
    height: '24px', // Adjust height to fit the smaller font size
    display: 'flex',
    alignItems: 'center',
    textTransform: 'capitalize', // Ensure only the first letter is capitalized
    marginBottom: '8px', // Add margin bottom for spacing
  };
});

interface Booking {
  id: string;
  unit: {
    id: string;
    propertyId: string;
    property: {
      id: number;
      ownerId: number;
      name: string;
      image?: string; // Make image property optional
    };
  };
  startDate: string;
  endDate: string;
  check_in: string;
  check_out: string;
  guestsCount: number;
  nights: number;
  totalPrice: string;
  status: BookingStatusType;
  created_at: string;
}

interface BookingHistoryProps {
  customStyles?: React.CSSProperties;
  showHeader?: boolean;
}

const BookingHistory: React.FC<BookingHistoryProps> = ({
  customStyles,
  showHeader,
}) => {
  const { data, isLoading, error } = useGetUserBookingsQuery(undefined, {
    selectFromResult: ({ data, isLoading, error }) => ({
      data,
      isLoading,
      error: error as FetchBaseQueryError | SerializedError | undefined,
    }),
  });

  const [propertyReview, { isLoading: isSubmittingReview }] =
    useCreatePropertyReviewMutation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);

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
    // Navigate to in-app messaging
    navigate('/messages', {
      state: { counterparty: id },
    });
  };

  const handleTrackBooking = (id: string) => {
    // Navigate to track booking page
    console.log('Track booking:', id);
  };

  const handleRateAndReview = (id: string) => {
    setSelectedBooking(
      data?.data.data.find((booking) => booking.id === id) || null
    );
    setOpenReviewDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false);
    setSelectedBooking(null);
    setRating(null);
    setReview('');
    setPhotos([]);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setPhotos(Array.from(event.target.files));
    }
  };

  const handleSubmitReview = async () => {
    if (isSubmittingReview) return;
    // Submit the review and rating
    try {
      console.log('Rating:', rating);
      console.log('Review:', review);

      const formData = new FormData();
      formData.append('unit_id', selectedBooking?.unit.id || '');
      formData.append('booking_id', selectedBooking?.id || '');
      formData.append('rating', (rating || 0).toString());
      formData.append('review', review);

      photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });

      await propertyReview({
        property_id: selectedBooking?.unit.property.id.toString() || '',
        formData,
      }).unwrap();
      toast.success('Review submitted successfully!');
      handleCloseReviewDialog();
    } catch (err) {
      toast.error('Unable to submit review, please try again later!');
    }
  };

  const handleRaiseDispute = (bookingId: string) => {
    navigate('/disputes', { state: { bookingId } });
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
      <Box sx={customStyles}>
        {showHeader && (
          <Typography variant="h4" color="primary" sx={{ mb: 4 }}>
            My Bookings
          </Typography>
        )}
        <Typography color="error">
          Failed to load booking history. Please try again later.
        </Typography>
      </Box>
    );
  }

  if (!data?.data.data.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          You haven't made any bookings yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={customStyles}>
      {showHeader && (
        <Typography variant="h4" color="primary" sx={{ mb: 4 }}>
          My Bookings
        </Typography>
      )}
      {data.data.data.map((booking: Booking) => (
        <StyledCard key={booking.id}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  {booking.unit.property.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {format(new Date(booking.startDate), 'MMM dd, yyyy')} -{' '}
                  {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.guestsCount} guest
                  {booking.guestsCount > 1 ? 's' : ''} • {booking.nights} night
                  {booking.nights > 1 ? 's' : ''}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  ₦{Number(booking.totalPrice || 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                <BookingStatus
                  label={booking.status.toLowerCase()}
                  status={booking.status}
                  size="small"
                />
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    mt: 2,
                    flexWrap: 'nowrap',
                    marginTop: 'auto',
                    flexDirection: isMobile ? 'column' : 'row',
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => handleViewDetails(booking)}
                    sx={{
                      fontSize: '0.6rem',
                      whiteSpace: 'nowrap',
                      mb: isMobile ? 1 : 0,
                    }}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleRaiseDispute(booking.id)}
                    sx={{
                      fontSize: '0.6rem',
                      whiteSpace: 'nowrap',
                      mb: isMobile ? 1 : 0,
                    }}
                  >
                    Dispute
                  </Button>
                  {booking.status === 'PENDING' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handlePay(booking.id)}
                      sx={{
                        fontSize: '0.6rem',
                        whiteSpace: 'nowrap',
                        mb: isMobile ? 1 : 0,
                      }}
                    >
                      Pay Now
                    </Button>
                  )}
                  {booking.status === 'CONFIRMED' && (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                          handleContactManager(
                            `${booking.unit.property.ownerId}`
                          )
                        }
                        sx={{
                          fontSize: '0.6rem',
                          whiteSpace: 'nowrap',
                          mb: isMobile ? 1 : 0,
                        }}
                      >
                        Contact Manager
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleTrackBooking(booking.id)}
                        sx={{
                          fontSize: '0.6rem',
                          whiteSpace: 'nowrap',
                          mb: isMobile ? 1 : 0,
                        }}
                      >
                        Track Booking
                      </Button>
                    </>
                  )}
                  {booking.status === 'COMPLETED' && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleRateAndReview(booking.id)}
                      sx={{
                        fontSize: '0.6rem',
                        whiteSpace: 'nowrap',
                        mb: isMobile ? 1 : 0,
                      }}
                    >
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
        <Dialog
          open={!!selectedBooking && !openReviewDialog}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Booking Details</DialogTitle>
          <DialogContent>
            <Typography variant="h6">
              {selectedBooking.unit.property.name}
            </Typography>
            {selectedBooking.unit.property.image && (
              <img
                src={selectedBooking.unit.property.image}
                alt={selectedBooking.unit.property.name}
                style={{ width: '100%', marginBottom: '16px' }}
              />
            )}
            <Typography variant="body2" color="text.secondary">
              {format(new Date(selectedBooking.startDate), 'MMM dd, yyyy')} -{' '}
              {format(new Date(selectedBooking.endDate), 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedBooking.guestsCount} guest
              {selectedBooking.guestsCount > 1 ? 's' : ''} •{' '}
              {selectedBooking.nights} night
              {selectedBooking.nights > 1 ? 's' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Amount: ₦
              {Number(selectedBooking.totalPrice || 0).toLocaleString()}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog
        open={openReviewDialog}
        onClose={handleCloseReviewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Rate & Review</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please rate your stay and leave a review.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Rating
              name="rating"
              value={rating}
              onChange={(_event, newValue) => {
                setRating(newValue);
              }}
              sx={{ fontSize: '5rem' }} // Custom size for larger stars
            />
            <TextField
              label="Review"
              multiline
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              variant="outlined"
              fullWidth
            />
            <Button variant="contained" component="label">
              Upload Photos
              <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
            </Button>
            {photos.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {photos.map((photo, index) => (
                  <Typography key={index} variant="body2">
                    {photo.name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isSubmittingReview}
            onClick={handleCloseReviewDialog}
            color="primary"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmitReview} color="primary">
            {isSubmittingReview ? 'Processing...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Box>
  );
};

export default BookingHistory;