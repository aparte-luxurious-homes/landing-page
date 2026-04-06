import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuickProfileComplete from '../booking/QuickProfileComplete';
import { useGetProfileQuery } from '../../api/profileApi';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Chip,
} from '@mui/material';
import { styled } from '@mui/system';
import { format, differenceInHours } from 'date-fns';
import {
  useGetUserBookingsQuery,
  useRetryBookingPaymentMutation,
  useCheckInBookingMutation,
  useCheckOutBookingMutation
} from '../../api/bookingsApi';
import { useLazyGetPropertyReviewsQuery } from '../../api/reviewsApi';
import type { Booking } from '../../api/bookingsApi';
import { RateReview as ReviewIcon, ReportProblem as DisputeIcon } from '@mui/icons-material';
import SubmitReviewModal from '../property/SubmitReviewModal';
import RaiseDisputeModal from './RaiseDisputeModal';
import ExtendStayModal from './ExtendStayModal';
import { 
  useGetBookingExtensionsQuery, 
  useCancelExtensionRequestMutation,
  BookingExtension,
  ExtensionStatus
} from '../../api/bookingsApi';
import { usePostPaymentMutation, useGetGatewayConfigQuery } from '../../api/paymentApi';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

type BookingStatusType = 'APPROVAL_PENDING' | 'PENDING' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCEL_REQUESTED' | 'CANCELLED' | 'COMPLETED';

interface BookingStatusProps {
  status: BookingStatusType;
  label?: string;
  size?: 'small' | 'medium';
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

const StayExtensionManager: React.FC<{ booking: Booking }> = ({ booking }) => {
  const navigate = useNavigate();
  const { data: extensionsData, isLoading } = useGetBookingExtensionsQuery(booking.id, {
    skip: booking.status !== 'CHECKED_IN' && booking.status !== 'CONFIRMED'
  });
  const [cancelExtension, { isLoading: isCancelling }] = useCancelExtensionRequestMutation();

  const activeExtension = extensionsData?.data?.items?.find(
    ext => ext.status === 'AWAITING_OWNER_APPROVAL' || ext.status === 'PENDING_PAYMENT'
  );

  const confirmedExtension = extensionsData?.data?.items?.find(ext => ext.status === 'CONFIRMED');

  if (isLoading) return <CircularProgress size={20} sx={{ mt: 1 }} />;
  if (!activeExtension && !confirmedExtension) return null;

  const handleCancel = async () => {
    if (!activeExtension) return;
    try {
      await cancelExtension({ bookingId: booking.id, extensionId: activeExtension.id }).unwrap();
      toast.success('Extension request cancelled');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to cancel extension');
    }
  };

  const handlePayNow = () => {
    if (!activeExtension) return;
    // Navigate to confirm-booking with extension data
    navigate('/confirm-booking', {
      state: {
        extensionId: activeExtension.id,
        bookingId: booking.id,
        bookingContext: {
          id: booking.property?.id,
          title: booking.property?.name || booking.unit?.name || 'Property',
          unit_id: booking.unit_id || booking.unit?.id,
          check_in_date: activeExtension.original_end_date,
          check_out_date: activeExtension.new_end_date,
          adults: booking.guests_count,
          unit_count: booking.unit_count || 1,
          total_charging_fee: activeExtension.extension_amount,
          caution_fee: 0, // Extensions don't have caution fee
          base_price: activeExtension.price_per_night,
          nights: activeExtension.extra_nights,
          unit_image: '',
          isExtension: true,
          transaction_ref: activeExtension.transaction_ref
        }
      }
    });
  };

  return (
    <Box sx={{ mt: 2, width: '100%' }}>
      {activeExtension && activeExtension.status === 'AWAITING_OWNER_APPROVAL' && (
        <Alert severity="info" sx={{ mb: 1 }} action={
          <Button color="inherit" size="small" onClick={handleCancel} disabled={isCancelling}>
            Cancel
          </Button>
        }>
          Your extension request is awaiting owner approval. We'll notify you once approved.
        </Alert>
      )}

      {activeExtension && activeExtension.status === 'PENDING_PAYMENT' && (
        <Alert severity="success" sx={{ mb: 1 }} action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" size="small" onClick={handleCancel} disabled={isCancelling}>
              Cancel
            </Button>
            <Button variant="contained" size="small" color="success" onClick={handlePayNow} sx={{ textTransform: 'none' }}>
              Pay Now
            </Button>
          </Box>
        }>
          Owner approved your extension! Please pay ₦{activeExtension.extension_amount.toLocaleString()} to confirm.
        </Alert>
      )}

      {confirmedExtension && (
        <Alert severity="success" sx={{ mb: 1 }}>
          Stay Extended until {format(new Date(confirmedExtension.new_end_date), 'MMM dd, yyyy')}!
        </Alert>
      )}
    </Box>
  );
};

const BookingHistory: React.FC<BookingHistoryProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [retryBookingPayment, { isLoading: isRetrying }] = useRetryBookingPaymentMutation();
  const [checkInBooking, { isLoading: isCheckingIn }] = useCheckInBookingMutation();
  const [checkOutBooking, { isLoading: isCheckingOut }] = useCheckOutBookingMutation();
  const [triggerGetPropertyReviews] = useLazyGetPropertyReviewsQuery();
  const { data: profileData } = useGetProfileQuery();
  const [retryError, setRetryError] = useState<string | null>(null);
  const [retrySuccess, setRetrySuccess] = useState<string | null>(null);
  const [checkoutConfirmId, setCheckoutConfirmId] = useState<string | null>(null);
  const [showProfileComplete, setShowProfileComplete] = useState(false);

  // Feature state
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<{ id: string, name: string } | null>(null);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState<{ id: string, name: string } | null>(null);
  const [selectedBookingForExtension, setSelectedBookingForExtension] = useState<Booking | null>(null);

  const { data, isLoading, error } = useGetUserBookingsQuery();
  const fetchedPropertyIdsRef = useRef<Set<string>>(new Set());
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // If the user changes, clear cached review checks.
    fetchedPropertyIdsRef.current = new Set();
    setReviewedBookingIds({});
  }, [userId]);

  // If the user already submitted a review for a booking, hide the "Review" button.
  // We infer this by fetching reviews for each completed booking's property and matching `review.booking_id`.
  useEffect(() => {
    const items = data?.data?.items;
    if (!items?.length) return;

    const completedBookings = items.filter((b: Booking) => b.status === 'COMPLETED');
    const propertyIds = Array.from(
      new Set(completedBookings.map((b: Booking) => b.property?.id).filter(Boolean))
    ) as string[];

    propertyIds.forEach(async (propId) => {
      if (fetchedPropertyIdsRef.current.has(propId)) return;
      fetchedPropertyIdsRef.current.add(propId);
      try {
        const reviews = await triggerGetPropertyReviews({ property_id: propId }).unwrap();
        if (reviews?.length) {
          const mapping: Record<string, boolean> = {};
          reviews.forEach((r: any) => {
            mapping[r.booking_id] = true;
          });
          setReviewedBookingIds(prev => ({ ...prev, ...mapping }));
        }
      } catch (err) {
        console.error('Failed to fetch reviews for property:', propId, err);
      }
    });
  }, [data, triggerGetPropertyReviews]);

  const canRaiseDispute = (booking: Booking) => {
    // If a dispute already exists, do not show the button
    if (booking.has_dispute) return false;

    // Status must be one that allows disputes (only Checked-in bookings)
    const allowedStatuses = ['CHECKED_IN'];
    if (!allowedStatuses.includes(booking.status)) return false;

    // Must be within 24 hours of the check-in time (scheduled or actual)
    // Fallback to start_date if checkin_time is missing
    const checkinTime = booking.checkin_time || booking.start_date;
    if (checkinTime) {
      const checkinDate = new Date(checkinTime);
      const now = new Date();
      // Calculate absolute difference in hours to be more inclusive of timing offsets
      const diffHours = Math.abs(differenceInHours(now, checkinDate));

      // Guest can dispute if they are within 24 hours of their check-in time
      return diffHours <= 24;
    }

    return false;
  };

  const canReviewProperty = (booking: Booking) => {
    // If user already reviewed via the legacy check (reviewedBookingIds) or new flag (has_review)
    if (booking.has_review || reviewedBookingIds[booking.id]) return false;

    // Status must be COMPLETED or CHECKED_OUT
    const allowedReviewStatuses = ['COMPLETED', 'CHECKED_OUT'];
    if (!allowedReviewStatuses.includes(booking.status)) return false;

    // Difference between checkin and checkout must be less than 72 hours
    if (booking.checkin_time && booking.checkout_time) {
      const checkin = new Date(booking.checkin_time);
      const checkout = new Date(booking.checkout_time);
      const stayDurationHours = differenceInHours(checkout, checkin);
      return stayDurationHours < 168;
    }

    return false;
  };

  const formatError = (error: any): string => {
    if (!error) return 'An unexpected error occurred';
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
        setRetryError(errorDataDetail?.message || 'Please complete your profile to proceed.');
        setShowProfileComplete(true);
        return;
      }
      setRetryError(formatError(err));
    }
  };

  const handleCheckOut = async (bookingId: string, skipConfirm = false) => {
    setRetryError(null);
    setRetrySuccess(null);
    const bookingForReview = data?.data?.items?.find((b: Booking) => b.id === bookingId);
    const reviewPropertyName =
      bookingForReview?.property?.name || bookingForReview?.unit?.name || 'Property';

    if (!skipConfirm) {
      const booking = data?.data?.items?.find((b: Booking) => b.id === bookingId);
      if (booking && booking.end_date) {
        const endDate = new Date(booking.end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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
      // Open review modal right after successful checkout.
      // Booking status may not have updated to "COMPLETED" yet, but the user already checked out.
      setSelectedBookingForReview({ id: bookingId, name: reviewPropertyName });
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
        <Typography color="error">Failed to load booking history. Please try again later.</Typography>
      </Box>
    );
  }

  if (!data?.data?.items?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">You haven't made any bookings yet.</Typography>
      </Box>
    );
  }

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
                <StayExtensionManager booking={booking} />
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

                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  {canReviewProperty(booking) && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ReviewIcon />}
                      onClick={() => setSelectedBookingForReview({ id: booking.id, name: booking.property?.name || booking.unit?.name || 'Property' })}
                      sx={{ textTransform: 'none', color: '#028090', borderColor: '#028090' }}
                    >
                      Review
                    </Button>
                  )}

                  {canRaiseDispute(booking) && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<DisputeIcon />}
                      onClick={() =>
                        setSelectedBookingForDispute({
                          id: booking.id,
                          name: booking.property?.name || booking.unit?.name || 'Property',
                        })
                      }
                      sx={{ textTransform: 'none' }}
                    >
                      Dispute
                    </Button>
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
                            nights: getNights(booking.start_date || '', booking.end_date || ''),
                            unit_image: '',
                          }
                        }
                      })}
                      sx={{ bgcolor: '#028090', '&:hover': { bgcolor: '#026d7a' } }}
                    >
                      Pay
                    </Button>
                  )}

                  {(booking.status === 'PENDING' || booking.status === 'PENDING_PAYMENT') && booking.transaction_ref && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleRetryPayment(booking.id)}
                      disabled={isRetrying}
                    >
                      {isRetrying ? <CircularProgress size={20} /> : 'Verify'}
                    </Button>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleCheckIn(booking.id)}
                      disabled={isCheckingIn}
                      sx={{ bgcolor: '#028090', '&:hover': { bgcolor: '#026d7a' } }}
                    >
                      {isCheckingIn ? <CircularProgress size={20} /> : 'Check In'}
                    </Button>
                  )}

                  {booking.status === 'CHECKED_IN' && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedBookingForExtension(booking)}
                        sx={{ 
                          textTransform: 'none', 
                          color: '#028090', 
                          borderColor: '#028090',
                          '&:hover': { bgcolor: 'rgba(2, 128, 144, 0.04)', borderColor: '#026d7a' }
                        }}
                      >
                        Extend Stay
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleCheckOut(booking.id)}
                        disabled={isCheckingOut}
                        sx={{ bgcolor: '#028090', '&:hover': { bgcolor: '#026f7a' } }}
                      >
                        {isCheckingOut ? <CircularProgress size={20} /> : 'Check Out'}
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </StyledCard>
      ))}

      {selectedBookingForReview && (
        <SubmitReviewModal
          open={!!selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          bookingId={selectedBookingForReview.id}
          propertyName={selectedBookingForReview.name}
        />
      )}

      {selectedBookingForDispute && (
        <RaiseDisputeModal
          open={!!selectedBookingForDispute}
          onClose={() => setSelectedBookingForDispute(null)}
          bookingId={selectedBookingForDispute.id}
          propertyName={selectedBookingForDispute.name}
        />
      )}

      {selectedBookingForExtension && (
        <ExtendStayModal
          open={!!selectedBookingForExtension}
          onClose={() => setSelectedBookingForExtension(null)}
          bookingId={selectedBookingForExtension.id}
          currentEndDate={selectedBookingForExtension.end_date}
          pricePerNight={parseFloat(selectedBookingForExtension.unit?.price_per_night || '0')}
          propertyName={selectedBookingForExtension.property?.name || selectedBookingForExtension.unit?.name || 'Property'}
        />
      )}

      {/* Early Checkout Confirmation Dialog */}
      <Dialog
        open={!!checkoutConfirmId}
        onClose={() => setCheckoutConfirmId(null)}
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
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
          <Button onClick={() => setCheckoutConfirmId(null)} variant="outlined" sx={{ borderRadius: 2 }}>Stay longer</Button>
          <Button
            onClick={() => checkoutConfirmId && handleCheckOut(checkoutConfirmId, true)}
            variant="contained"
            sx={{ borderRadius: 2, bgcolor: '#028090', '&:hover': { bgcolor: '#026d7a' } }}
          >
            Confirm Check-Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Profile Completion Modal */}
      {showProfileComplete && (
        <QuickProfileComplete
          initialData={{
            firstName: profileData?.data?.profile?.firstName,
            lastName: profileData?.data?.profile?.lastName,
            phone: profileData?.data?.phone,
            dob: profileData?.data?.profile?.dob ? String(profileData.data.profile.dob) : undefined,
          }}
          onClose={() => setShowProfileComplete(false)}
          onComplete={() => { setShowProfileComplete(false); }}
        />
      )}
    </Box>
  );
};

export default BookingHistory;