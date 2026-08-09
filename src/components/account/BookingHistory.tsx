'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@/lib/router';
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
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { styled } from '@mui/system';
import { format, differenceInHours } from 'date-fns';
import {
  useGetUserBookingsQuery,
  useRetryBookingPaymentMutation,
  useCheckInBookingMutation,
  useCheckOutBookingMutation,
  useRequestCancellationMutation,
} from '../../api/bookingsApi';
import { useLazyGetPropertyReviewsQuery } from '../../api/reviewsApi';
import type { Booking } from '../../api/bookingsApi';
import {
  RateReview as ReviewIcon,
  ReportProblem as DisputeIcon,
} from '@mui/icons-material';
import SubmitReviewModal from '../property/SubmitReviewModal';
import RaiseDisputeModal from './RaiseDisputeModal';
import ExtendStayModal from './ExtendStayModal';
import {
  useGetBookingExtensionsQuery,
  useCancelExtensionRequestMutation,
} from '../../api/bookingsApi';
import { toast } from 'react-toastify';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

type BookingStatusType =
  | 'APPROVAL_PENDING'
  | 'PENDING'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'COMPLETED';

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
  const { data: extensionsData, isLoading } = useGetBookingExtensionsQuery(
    booking.id,
    {
      skip: !booking.id,
    }
  );
  const [cancelExtension, { isLoading: isCancelling }] =
    useCancelExtensionRequestMutation();

  const items = Array.isArray(extensionsData)
    ? extensionsData
    : extensionsData?.items ||
      (extensionsData as any)?.data?.items ||
      (extensionsData as any)?.data ||
      [];

  const activeExtension = items?.find((ext: any) => {
    const s = ext?.status
      ?.toUpperCase()
      ?.trim()
      ?.replace(/[\s-]+/g, '_');
    return (
      s === 'AWAITING_OWNER_APPROVAL' ||
      s === 'PENDING_PAYMENT' ||
      s === 'AWAITING_PAYMENT'
    );
  });

  const confirmedExtension = items?.find((ext: any) => {
    const s = ext?.status
      ?.toUpperCase()
      ?.trim()
      ?.replace(/[\s-]+/g, '_');
    return s === 'CONFIRMED' || s === 'APPROVED';
  });

  if (isLoading) return <CircularProgress size={20} sx={{ mt: 1 }} />;

  const isFinished =
    booking.status === 'CHECKED_OUT' ||
    booking.status === 'COMPLETED' ||
    booking.status === 'CANCELLED';
  if (isFinished || (!activeExtension && !confirmedExtension)) return null;

  const handleCancel = async () => {
    if (!activeExtension) return;
    try {
      await cancelExtension({
        bookingId: booking.id,
        extensionId: activeExtension.id,
      }).unwrap();
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
          total_charging_fee: Number(
            activeExtension.extension_amount ||
              activeExtension.extensionAmount ||
              activeExtension.total_amount ||
              activeExtension.amount ||
              0
          ),
          caution_fee: 0,
          base_price: Number(
            activeExtension.price_per_night ||
              activeExtension.pricePerNight ||
              activeExtension.price ||
              activeExtension.daily_rate ||
              0
          ),
          nights:
            activeExtension.extra_nights || activeExtension.extraNights || 0,
          unit_image: '',
          isExtension: true,
          transaction_ref: activeExtension.transaction_ref,
        },
      },
    });
  };

  return (
    <Box sx={{ mt: 2, width: '100%' }}>
      {activeExtension &&
        (() => {
          const s = activeExtension.status
            ?.toUpperCase()
            ?.trim()
            ?.replace(/[\s-]+/g, '_');
          return s === 'AWAITING_OWNER_APPROVAL';
        })() && (
          <Alert
            severity="info"
            sx={{ mb: 1 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                Cancel
              </Button>
            }
          >
            <AlertTitle>Extension Pending Confirmation</AlertTitle>
            Your extension request is awaiting owner approval. We'll notify you
            once approved.
          </Alert>
        )}

      {activeExtension &&
        (() => {
          const s = activeExtension.status
            ?.toUpperCase()
            ?.trim()
            ?.replace(/[\s-]+/g, '_');
          return s === 'PENDING_PAYMENT' || s === 'AWAITING_PAYMENT';
        })() && (
          <Alert
            severity="success"
            sx={{ mb: 1 }}
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  size="small"
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  onClick={handlePayNow}
                  sx={{ textTransform: 'none' }}
                >
                  Pay Now
                </Button>
              </Box>
            }
          >
            <AlertTitle>Extension Approved</AlertTitle>
            Owner approved your extension! Please pay ₦
            {activeExtension.extension_amount.toLocaleString()} to confirm your
            stay until{' '}
            {format(new Date(activeExtension.new_end_date), 'MMM dd, yyyy')}.
          </Alert>
        )}

      {confirmedExtension && (
        <Alert severity="success" sx={{ mb: 1 }}>
          <AlertTitle>Stay Extended</AlertTitle>
          Stay successfully extended until{' '}
          {format(new Date(confirmedExtension.new_end_date), 'MMM dd, yyyy')}!
        </Alert>
      )}
    </Box>
  );
};

const BookingCard: React.FC<{
  booking: Booking;
  navigate: (path: string, options?: any) => void;
  getNights: (start: string, end: string) => number;
  handleRetryPayment: (id: string) => void;
  isRetrying: boolean;
  handleCheckIn: (id: string) => void;
  isCheckingIn: boolean;
  handleCheckOut: (id: string) => void;
  isCheckingOut: boolean;
  canCancelBooking: (booking: Booking) => boolean;
  onRequestCancellation: (booking: Booking) => void;
  canReviewProperty: (booking: Booking) => boolean;
  canRaiseDispute: (booking: Booking) => boolean;
  setSelectedBookingForReview: (
    val: { id: string; propertyId: string; name: string } | null
  ) => void;
  setSelectedBookingForDispute: (
    val: { id: string; name: string } | null
  ) => void;
  setSelectedBookingForExtension: (val: any) => void;
}> = ({
  booking,
  navigate,
  getNights,
  handleRetryPayment,
  isRetrying,
  handleCheckIn,
  isCheckingIn,
  handleCheckOut,
  isCheckingOut,
  canCancelBooking,
  onRequestCancellation,
  canReviewProperty,
  canRaiseDispute,
  setSelectedBookingForReview,
  setSelectedBookingForDispute,
  setSelectedBookingForExtension,
}) => {
  const { data: extensionsData } = useGetBookingExtensionsQuery(booking.id, {
    skip: !booking.id,
  });

  const items = Array.isArray(extensionsData)
    ? extensionsData
    : extensionsData?.items ||
      (extensionsData as any)?.data?.items ||
      (extensionsData as any)?.data ||
      [];

  const confirmedExtension = items?.find(
    (ext: any) => ext?.status?.toUpperCase() === 'CONFIRMED'
  );

  const effectiveEndDate = confirmedExtension?.new_end_date || booking.end_date;
  const totalNights = effectiveEndDate
    ? getNights(booking.start_date, effectiveEndDate)
    : 0;

  return (
    <StyledCard
      key={booking.id}
      role="link"
      tabIndex={0}
      aria-label={`View booking details for ${booking.property?.name || booking.unit?.name || 'property'}`}
      onClick={() => navigate(`/account/bookings/${booking.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/account/bookings/${booking.id}`);
        }
      }}
      sx={{ cursor: 'pointer' }}
    >
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              {booking.property?.name ||
                booking.unit?.name ||
                'Booking Information'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {booking.start_date
                ? format(new Date(booking.start_date), 'MMM dd, yyyy')
                : '--'}{' '}
              -{' '}
              {effectiveEndDate
                ? format(new Date(effectiveEndDate), 'MMM dd, yyyy')
                : '--'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.guests_count || 0} guest
              {(booking.guests_count || 0) > 1 ? 's' : ''} • {totalNights} night
              {totalNights > 1 ? 's' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {booking.property?.address || 'N/A'}
              {booking.property?.city ? `, ${booking.property.city}` : ''}
            </Typography>
            {booking.status === 'CANCELLED' && booking.rejection_reason && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: '#fed7aa',
                  backgroundColor: '#fff7ed',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#9a3412', fontWeight: 600, display: 'block' }}
                >
                  Owner's reason
                </Typography>
                <Typography variant="body2" sx={{ color: '#c2410c', mt: 0.5 }}>
                  {booking.rejection_reason}
                </Typography>
              </Box>
            )}
            <Box onClick={(e) => e.stopPropagation()}>
              <StayExtensionManager booking={booking} />
            </Box>
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
            onClick={(e) => e.stopPropagation()}
          >
            <BookingStatus
              label={
                booking.status === 'APPROVAL_PENDING'
                  ? 'Awaiting Approval'
                  : booking.status.replace(/_/g, ' ')
              }
              status={booking.status}
              size="small"
            />
            <Typography variant="h6" sx={{ mt: 1 }}>
              ₦{booking.total_price.toLocaleString()}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Booking ID: {booking.booking_id}
            </Typography>

            <Box
              sx={{
                mt: 2,
                display: 'flex',
                flexWrap: 'wrap',
                flexDirection: 'column',
                gap: 1,
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: { xs: 'flex-end', md: 'flex-end' },
              }}
            >
              {canReviewProperty(booking) && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ReviewIcon />}
                  onClick={() =>
                    setSelectedBookingForReview({
                      id: booking.id,
                      propertyId:
                        booking.property?.id || booking.unit?.property_id || '',
                      name:
                        booking.property?.name ||
                        booking.unit?.name ||
                        'Property',
                    })
                  }
                  sx={{
                    textTransform: 'none',
                    color: '#028090',
                    borderColor: '#028090',
                  }}
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
                      name:
                        booking.property?.name ||
                        booking.unit?.name ||
                        'Property',
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
                  onClick={() =>
                    navigate('/confirm-booking', {
                      state: {
                        existingBookingId: booking.booking_id,
                        bookingContext: {
                          id: booking.property?.id,
                          title:
                            booking.property?.name ||
                            booking.unit?.name ||
                            'Property',
                          unit_id: booking.unit_id || booking.unit?.id,
                          check_in_date: booking.start_date,
                          check_out_date: booking.end_date,
                          adults: booking.guests_count,
                          unit_count: booking.unit_count || 1,
                          // total_payable = total_price + gateway_fee (what the gateway actually
                          // charges). Falls back to total_price for legacy bookings created before
                          // gateway-fee tracking, which the backend leaves with gateway_fee=0.
                          total_charging_fee:
                            booking.total_payable ?? booking.total_price,
                          caution_fee: booking.caution_fee || 0,
                          base_price: Number(
                            booking.unit?.price_per_night ||
                              booking.unit?.pricePerNight ||
                              0
                          ),
                          nights: getNights(
                            booking.start_date || '',
                            booking.end_date || ''
                          ),
                          unit_image: '',
                        },
                      },
                    })
                  }
                  sx={{ bgcolor: '#028090', '&:hover': { bgcolor: '#026d7a' } }}
                >
                  Pay
                </Button>
              )}

              {(booking.status === 'PENDING' ||
                booking.status === 'PENDING_PAYMENT') &&
                booking.transaction_ref && (
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
                      '&:hover': {
                        bgcolor: 'rgba(2, 128, 144, 0.04)',
                        borderColor: '#026d7a',
                      },
                    }}
                  >
                    Extend Stay
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleCheckOut(booking.id)}
                    disabled={isCheckingOut}
                    sx={{
                      bgcolor: '#028090',
                      '&:hover': { bgcolor: '#026f7a' },
                    }}
                  >
                    {isCheckingOut ? (
                      <CircularProgress size={20} />
                    ) : (
                      'Check Out'
                    )}
                  </Button>
                </>
              )}

              {canCancelBooking(booking) && (
                <Button
                  variant="text"
                  size="small"
                  color="error"
                  onClick={() => onRequestCancellation(booking)}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Request Cancellation
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

const BookingHistory: React.FC<BookingHistoryProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [retryBookingPayment, { isLoading: isRetrying }] =
    useRetryBookingPaymentMutation();
  const [checkInBooking, { isLoading: isCheckingIn }] =
    useCheckInBookingMutation();
  const [checkOutBooking, { isLoading: isCheckingOut }] =
    useCheckOutBookingMutation();
  const [requestCancellation, { isLoading: isRequestingCancellation }] =
    useRequestCancellationMutation();
  const [triggerGetPropertyReviews] = useLazyGetPropertyReviewsQuery();
  const { data: profileData } = useGetProfileQuery();
  const [retryError, setRetryError] = useState<string | null>(null);
  const [retrySuccess, setRetrySuccess] = useState<string | null>(null);
  const [checkoutConfirmId, setCheckoutConfirmId] = useState<string | null>(
    null
  );
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] =
    useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showProfileComplete, setShowProfileComplete] = useState(false);

  // Feature state
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<{
    id: string;
    propertyId: string;
    name: string;
  } | null>(null);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedBookingForExtension, setSelectedBookingForExtension] =
    useState<Booking | null>(null);

  const { data, isLoading, error } = useGetUserBookingsQuery();
  const fetchedPropertyIdsRef = useRef<Set<string>>(new Set());
  const [reviewedBookingIds, setReviewedBookingIds] = useState<
    Record<string, boolean>
  >({});

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

    const allowedStatuses = ['COMPLETED', 'CHECKED_OUT', 'CHECKED-OUT'];
    const eligibleBookings = items.filter((b: Booking) =>
      allowedStatuses.includes(b.status.toUpperCase())
    );
    const propertyIds = Array.from(
      new Set(
        eligibleBookings.map((b: Booking) => b.property?.id).filter(Boolean)
      )
    ) as string[];

    propertyIds.forEach(async (propId) => {
      if (fetchedPropertyIdsRef.current.has(propId)) return;
      fetchedPropertyIdsRef.current.add(propId);
      try {
        const reviews = await triggerGetPropertyReviews({
          property_id: propId,
        }).unwrap();
        const reviewsList = Array.isArray(reviews)
          ? reviews
          : (reviews as any)?.items || (reviews as any)?.data || [];

        if (reviewsList?.length) {
          const mapping: Record<string, boolean> = {};
          reviewsList.forEach((r: any) => {
            const bId = r.booking_id || r.bookingId;
            if (bId) mapping[bId] = true;
          });
          setReviewedBookingIds((prev) => ({ ...prev, ...mapping }));
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

    // Explicitly blocked by backend
    if (booking.is_reviewable === false) return false;

    // Check review window expiration
    if (booking.review_window_expires_at) {
      const expirationDate = new Date(booking.review_window_expires_at);
      if (new Date() > expirationDate) return false;
    }

    // Status must be COMPLETED, CHECKED_OUT, or CHECKED-OUT (case-insensitive)
    const normalizedStatus = booking.status?.toUpperCase();
    const allowedReviewStatuses = ['COMPLETED', 'CHECKED_OUT', 'CHECKED-OUT'];
    if (!allowedReviewStatuses.includes(normalizedStatus)) return false;

    const checkinTime = booking.checkin_time || (booking as any).checkinTime;
    const checkoutTime = booking.checkout_time || (booking as any).checkoutTime;

    if (checkinTime && checkoutTime) {
      const checkin = new Date(checkinTime);
      const checkout = new Date(checkoutTime);
      const stayDurationHours = differenceInHours(checkout, checkin);
      return stayDurationHours < 168; // Within 7 days
    }

    // Fallback: If status is within allowed statuses, allow review even if times are missing
    if (allowedReviewStatuses.includes(normalizedStatus)) return true;

    return false;
  };

  const canCancelBooking = (booking: Booking) => {
    const cancellableStatuses: BookingStatusType[] = [
      'PENDING',
      'PENDING_PAYMENT',
      'CONFIRMED',
    ];
    return cancellableStatuses.includes(booking.status);
  };

  const formatError = (error: any): string => {
    if (!error) return 'An unexpected error occurred';
    const detail = error?.data?.detail || error?.detail || error;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((err: any) => err.msg || JSON.stringify(err))
        .join(', ');
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
        setRetrySuccess(
          result.data.message || 'Payment verified successfully!'
        );
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
        (Array.isArray(errorDataDetail) &&
          errorDataDetail[0]?.code === 'KYC_REQUIRED') ||
        (typeof errorDataDetail === 'string' &&
          errorDataDetail.includes('Identity verification'));

      if (isKycRequired) {
        setRetryError(
          errorDataDetail?.message || 'Please complete your profile to proceed.'
        );
        setShowProfileComplete(true);
        return;
      }
      setRetryError(formatError(err));
    }
  };

  const handleCheckOut = async (bookingId: string, skipConfirm = false) => {
    setRetryError(null);
    setRetrySuccess(null);
    const bookingForReview = data?.data?.items?.find(
      (b: Booking) => b.id === bookingId
    );
    const reviewPropertyName =
      bookingForReview?.property?.name ||
      bookingForReview?.unit?.name ||
      'Property';

    if (!skipConfirm) {
      const booking = data?.data?.items?.find(
        (b: Booking) => b.id === bookingId
      );
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
      setSelectedBookingForReview({
        id: bookingId,
        propertyId:
          bookingForReview?.property?.id ||
          bookingForReview?.unit?.property_id ||
          '',
        name: reviewPropertyName,
      });
    } catch (err: any) {
      setRetryError(formatError(err));
    }
  };

  const getBaseBookingAmount = (booking: Booking) => {
    const nights = getNights(booking.start_date || '', booking.end_date || '');
    const unitPrice = Number(
      booking.unit?.price_per_night || booking.unit?.pricePerNight || 0
    );
    const computedBase = unitPrice > 0 ? unitPrice * nights : 0;
    return computedBase > 0 ? computedBase : Number(booking.total_price || 0);
  };

  const getCancellationBreakdown = (booking: Booking) => {
    const baseAmount = getBaseBookingAmount(booking);
    const nonRefundableAmount = baseAmount * 0.2;
    const refundableAmount = baseAmount * 0.8;
    return { refundableAmount, nonRefundableAmount };
  };

  const openCancellationDialog = (booking: Booking) => {
    setSelectedBookingForCancellation(booking);
    setCancellationReason('');
  };

  const closeCancellationDialog = () => {
    if (isRequestingCancellation) return;
    setSelectedBookingForCancellation(null);
    setCancellationReason('');
  };

  const handleConfirmCancellation = async () => {
    if (!selectedBookingForCancellation) return;

    setRetryError(null);
    setRetrySuccess(null);

    try {
      await requestCancellation({
        bookingId: selectedBookingForCancellation.id,
        cancellation_reason: cancellationReason.trim(),
      }).unwrap();
      setRetrySuccess('Cancellation request submitted successfully.');
      closeCancellationDialog();
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

  const getNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Box>
      {retrySuccess && (
        <Alert
          severity="success"
          onClose={() => setRetrySuccess(null)}
          sx={{ mb: 2 }}
        >
          {retrySuccess}
        </Alert>
      )}
      {retryError && (
        <Alert
          severity="error"
          onClose={() => setRetryError(null)}
          sx={{ mb: 2 }}
        >
          {retryError}
        </Alert>
      )}

      {data.data.items.map((booking: Booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          navigate={navigate}
          getNights={getNights}
          handleRetryPayment={handleRetryPayment}
          isRetrying={isRetrying}
          handleCheckIn={handleCheckIn}
          isCheckingIn={isCheckingIn}
          handleCheckOut={handleCheckOut}
          isCheckingOut={isCheckingOut}
          canCancelBooking={canCancelBooking}
          onRequestCancellation={openCancellationDialog}
          canReviewProperty={canReviewProperty}
          canRaiseDispute={canRaiseDispute}
          setSelectedBookingForReview={setSelectedBookingForReview}
          setSelectedBookingForDispute={setSelectedBookingForDispute}
          setSelectedBookingForExtension={setSelectedBookingForExtension}
        />
      ))}

      {selectedBookingForReview && (
        <SubmitReviewModal
          open={!!selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          bookingId={selectedBookingForReview.id}
          propertyId={selectedBookingForReview.propertyId}
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
          pricePerNight={Number(
            selectedBookingForExtension.unit?.price_per_night ||
              selectedBookingForExtension.unit?.pricePerNight ||
              0
          )}
          propertyName={
            selectedBookingForExtension.property?.name ||
            selectedBookingForExtension.unit?.name ||
            'Property'
          }
          propertyId={selectedBookingForExtension.property?.id}
          unitId={
            selectedBookingForExtension.unit_id ||
            selectedBookingForExtension.unit?.id
          }
        />
      )}

      {/* Early Checkout Confirmation Dialog */}
      <Dialog
        open={!!checkoutConfirmId}
        onClose={() => setCheckoutConfirmId(null)}
        PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Early Check-Out Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {(() => {
              const selectedBooking = checkoutConfirmId
                ? data?.data?.items?.find(
                    (b: Booking) => b.id === checkoutConfirmId
                  )
                : null;
              const endDateStr = selectedBooking?.end_date
                ? format(new Date(selectedBooking.end_date), 'MMM dd, yyyy')
                : 'the scheduled date';
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
            onClick={() =>
              checkoutConfirmId && handleCheckOut(checkoutConfirmId, true)
            }
            variant="contained"
            sx={{
              borderRadius: 2,
              bgcolor: '#028090',
              '&:hover': { bgcolor: '#026d7a' },
            }}
          >
            Confirm Check-Out
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog
        open={!!selectedBookingForCancellation}
        onOpenChange={(open) => {
          if (!open) closeCancellationDialog();
        }}
      >
        <AlertDialogContent className="sm:max-w-[500px] z-[1500]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              Cancel Booking
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="mt-2 text-gray-500 space-y-3">
                <p>
                  Are you sure you want to cancel your booking for{' '}
                  <strong className="text-gray-700">
                    {selectedBookingForCancellation?.property?.name ||
                      selectedBookingForCancellation?.unit?.name ||
                      'this property'}
                  </strong>
                  ?
                </p>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="mb-2 text-sm font-semibold text-amber-800">
                    Refund Details
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-amber-700">
                    <li>
                      Non-refundable amount (20%):{' '}
                      <strong>
                        ₦
                        {selectedBookingForCancellation
                          ? getCancellationBreakdown(
                              selectedBookingForCancellation
                            ).nonRefundableAmount.toLocaleString()
                          : '0'}
                      </strong>
                    </li>
                    <li>
                      Refundable amount (up to 80%):{' '}
                      <strong>
                        ₦
                        {selectedBookingForCancellation
                          ? getCancellationBreakdown(
                              selectedBookingForCancellation
                            ).refundableAmount.toLocaleString()
                          : '0'}
                      </strong>
                    </li>
                  </ul>
                </div>

                <p className="text-sm">
                  The 20% booking fee is non-refundable. You will receive up to
                  80% of the base booking price in your wallet, according to our
                  cancellation policy.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-6 flex flex-col gap-2">
            <label
              htmlFor="reason"
              className="text-sm font-medium text-gray-700"
            >
              Cancellation Reason (Optional)
            </label>
            <textarea
              id="reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g., Guest requested cancellation, Double booking..."
              className="min-h-[100px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
            <AlertDialogCancel
              onClick={closeCancellationDialog}
              disabled={isRequestingCancellation}
              className="border-gray-300 text-gray-700 me-4 hover:bg-gray-50"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancellation}
              disabled={isRequestingCancellation}
              className="border-none bg-red-600 text-white hover:!bg-red-700"
            >
              {isRequestingCancellation ? 'Processing...' : 'Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Profile Completion Modal */}
      {showProfileComplete && (
        <QuickProfileComplete
          initialData={{
            firstName: profileData?.data?.profile?.firstName,
            lastName: profileData?.data?.profile?.lastName,
            phone: profileData?.data?.phone,
            dob: profileData?.data?.profile?.dob
              ? String(profileData.data.profile.dob)
              : undefined,
          }}
          onClose={() => setShowProfileComplete(false)}
          onComplete={() => {
            setShowProfileComplete(false);
          }}
        />
      )}
    </Box>
  );
};

export default BookingHistory;
