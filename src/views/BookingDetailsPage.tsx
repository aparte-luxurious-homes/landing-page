'use client';

import React, { useMemo } from 'react';
import { Link as RouterLink, useParams } from '@/lib/router';
import { format } from 'date-fns';
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  useGetBookingByIdQuery,
  useGetBookingExtensionsQuery,
} from '../api/bookingsApi';
import type { Booking, BookingExtension } from '../api/bookingsApi';
import { useGetProfileQuery } from '../api/profileApi';
import { extractErrorMessage } from '../utils/errorHandler';

const PRIMARY = '#028090';

function getNights(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function statusChipColors(status: Booking['status']): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    APPROVAL_PENDING: { bg: '#fff7ed', color: '#c2410c' },
    PENDING: { bg: '#fef3c7', color: '#b45309' },
    PENDING_PAYMENT: { bg: '#fef3c7', color: '#b45309' },
    CONFIRMED: { bg: '#d1fae5', color: '#047857' },
    CHECKED_IN: { bg: '#dbeafe', color: '#1d4ed8' },
    CHECKED_OUT: { bg: '#ccfbf1', color: '#0f766e' },
    CANCEL_REQUESTED: { bg: '#fef3c7', color: '#b45309' },
    CANCELLED: { bg: '#fee2e2', color: '#b91c1c' },
    COMPLETED: { bg: '#ede9fe', color: '#5b21b6' },
  };
  return map[status] || map.PENDING;
}

function statusLabel(status: Booking['status']): string {
  if (status === 'APPROVAL_PENDING') return 'Awaiting Approval';
  return status.replace(/_/g, ' ');
}

function normalizeExtensionItems(
  extensionsData: unknown
): BookingExtension[] {
  if (Array.isArray(extensionsData)) return extensionsData as BookingExtension[];
  if (!extensionsData || typeof extensionsData !== 'object') return [];
  const o = extensionsData as Record<string, unknown>;
  const items = o.items ?? (o.data as Record<string, unknown>)?.items ?? o.data;
  if (Array.isArray(items)) return items as BookingExtension[];
  return [];
}

const BookingDetailsPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const {
    data: booking,
    isLoading,
    isError,
    error,
  } = useGetBookingByIdQuery(bookingId ?? '', {
    skip: !bookingId,
  });
  const { data: profileData } = useGetProfileQuery();
  const { data: extensionsRaw, isLoading: extLoading } =
    useGetBookingExtensionsQuery(bookingId ?? '', {
      skip: !bookingId,
    });

  const extensions = useMemo(
    () => normalizeExtensionItems(extensionsRaw),
    [extensionsRaw]
  );

  const confirmedExtension = extensions.find(
    (ext) => ext?.status?.toUpperCase() === 'CONFIRMED'
  );
  const effectiveEndDate =
    confirmedExtension?.new_end_date || booking?.end_date || '';
  const nights =
    booking?.start_date && effectiveEndDate
      ? getNights(booking.start_date, effectiveEndDate)
      : 0;

  const unitPrice = Number(
    booking?.unit?.price_per_night ?? booking?.unit?.pricePerNight ?? 0
  );
  const subtotalFromNights =
    unitPrice > 0 && nights > 0 ? unitPrice * nights : null;
  const cautionFee = Number(booking?.caution_fee ?? 0);
  const gatewayFee = booking?.gateway_fee;
  const totalPrice = Number(booking?.total_price ?? 0);
  const totalPayable = booking?.total_payable;

  const guestName = [
    profileData?.data?.profile?.firstName,
    profileData?.data?.profile?.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  const errorMessage = isError ? extractErrorMessage(error) : null;

  const content = () => {
    if (!bookingId) {
      return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="text.secondary">Missing booking reference.</Typography>
          <Button
            component={RouterLink}
            to="/account?tab=bookings"
            sx={{ mt: 2, color: PRIMARY }}
          >
            Back to my bookings
          </Button>
        </Box>
      );
    }

    if (isLoading) {
      return (
        <Paper elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          <Skeleton variant="text" width="40%" height={40} />
          <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 3 }} />
        </Paper>
      );
    }

    if (isError || !booking) {
      return (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            {errorMessage || 'We could not load this booking.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            It may have been removed or the link is incorrect.
          </Typography>
          <Button
            component={RouterLink}
            to="/account?tab=bookings"
            variant="contained"
            sx={{ bgcolor: PRIMARY, '&:hover': { bgcolor: '#026d7a' } }}
          >
            Back to my bookings
          </Button>
        </Box>
      );
    }

    const sc = statusChipColors(booking.status);

    return (
      <Paper
        elevation={0}
        sx={{
          maxWidth: 720,
          mx: 'auto',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          bgcolor: '#fff',
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 4 },
            py: 3,
            borderBottom: '1px dashed',
            borderColor: 'divider',
            bgcolor: '#f8fafb',
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: PRIMARY, letterSpacing: 2, fontWeight: 700 }}
          >
            Booking receipt
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
              mt: 1,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#111' }}>
                AparteNG
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Confirmation № {booking.booking_id}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Internal ID: {booking.id}
              </Typography>
            </Box>
            <Chip
              label={statusLabel(booking.status)}
              size="medium"
              sx={{
                fontWeight: 600,
                bgcolor: sc.bg,
                color: sc.color,
                border: 'none',
              }}
            />
          </Box>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
          {guestName ? (
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Guest:</strong> {guestName}
              {profileData?.data?.email ? (
                <>
                  {' '}
                  · {profileData.data.email}
                </>
              ) : null}
            </Typography>
          ) : null}

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Property & stay
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {booking.property?.name || booking.unit?.name || 'Accommodation'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {booking.property?.address || '—'}
            {booking.property?.city
              ? `, ${booking.property.city}${booking.property?.state ? `, ${booking.property.state}` : ''}`
              : ''}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                Check-in
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {booking.start_date
                  ? format(new Date(booking.start_date), 'EEEE, MMM d, yyyy')
                  : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Check-out
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {effectiveEndDate
                  ? format(new Date(effectiveEndDate), 'EEEE, MMM d, yyyy')
                  : '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Guests
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {booking.guests_count ?? 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nights
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {nights}
              </Typography>
            </Box>
          </Box>

          {booking.unit?.name ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <strong>Unit:</strong> {booking.unit.name}
            </Typography>
          ) : null}

          {booking.checkin_time || booking.checkout_time ? (
            <Box sx={{ mb: 2 }}>
              {booking.checkin_time ? (
                <Typography variant="caption" display="block" color="text.secondary">
                  Recorded check-in:{' '}
                  {format(new Date(booking.checkin_time), 'MMM d, yyyy h:mm a')}
                </Typography>
              ) : null}
              {booking.checkout_time ? (
                <Typography variant="caption" display="block" color="text.secondary">
                  Recorded check-out:{' '}
                  {format(new Date(booking.checkout_time), 'MMM d, yyyy h:mm a')}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Charges
          </Typography>
          <TableContainer>
            <Table size="small" sx={{ '& td': { border: 'none', py: 1 } }}>
              <TableBody>
                {unitPrice > 0 ? (
                  <TableRow>
                    <TableCell sx={{ pl: 0, color: 'text.secondary' }}>
                      Nightly rate × {nights} night{nights === 1 ? '' : 's'}
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 0 }}>
                      ₦{(unitPrice * nights).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ) : null}
                {subtotalFromNights != null &&
                Math.abs(subtotalFromNights - totalPrice) > 1 ? (
                  <TableRow>
                    <TableCell sx={{ pl: 0, color: 'text.secondary' }}>
                      Room subtotal (as booked)
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 0 }}>
                      ₦{subtotalFromNights.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ) : null}
                {cautionFee > 0 ? (
                  <TableRow>
                    <TableCell sx={{ pl: 0, color: 'text.secondary' }}>
                      Caution FEE
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 0 }}>
                      ₦{cautionFee.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ) : null}
                {gatewayFee != null && gatewayFee > 0 ? (
                  <TableRow>
                    <TableCell sx={{ pl: 0, color: 'text.secondary' }}>
                      Payment gateway fee
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 0 }}>
                      ₦{Number(gatewayFee).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ) : null}
                <TableRow>
                  <TableCell sx={{ pl: 0, fontWeight: 700 }}>Total (booking)</TableCell>
                  <TableCell align="right" sx={{ pr: 0, fontWeight: 700 }}>
                    ₦{totalPrice.toLocaleString()}
                  </TableCell>
                </TableRow>
                {totalPayable != null &&
                totalPayable > 0 &&
                totalPayable !== totalPrice ? (
                  <TableRow>
                    <TableCell sx={{ pl: 0, color: 'text.secondary' }}>
                      Total charged (incl. fees)
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 0, fontWeight: 600 }}>
                      ₦{Number(totalPayable).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>

          {booking.transaction_ref ? (
            <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
              <strong>Payment reference:</strong> {booking.transaction_ref}
            </Typography>
          ) : null}

          {booking.status === 'CANCELLED' && booking.rejection_reason ? (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1,
                border: '1px solid #fed7aa',
                bgcolor: '#fff7ed',
              }}
            >
              <Typography variant="caption" sx={{ color: '#9a3412', fontWeight: 600 }}>
                Owner's note
              </Typography>
              <Typography variant="body2" sx={{ color: '#c2410c', mt: 0.5 }}>
                {booking.rejection_reason}
              </Typography>
            </Box>
          ) : null}

          {booking.cancellation_reason ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Cancellation reason
              </Typography>
              <Typography variant="body2">{booking.cancellation_reason}</Typography>
            </Box>
          ) : null}

          {extLoading ? (
            <Skeleton sx={{ mt: 3 }} height={80} />
          ) : extensions.length > 0 ? (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Stay extensions
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>New check-out</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {extensions.map((ext) => (
                      <TableRow key={ext.id}>
                        <TableCell>
                          {ext.new_end_date
                            ? format(new Date(ext.new_end_date), 'MMM d, yyyy')
                            : '—'}
                        </TableCell>
                        <TableCell align="right">
                          ₦
                          {Number(
                            ext.extension_amount ?? ext.extensionAmount ?? 0
                          ).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {ext.status?.replace(/_/g, ' ') ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : null}

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 3 }}
          >
            Booked on{' '}
            {booking.createdAt
              ? format(new Date(booking.createdAt), 'MMM d, yyyy · h:mm a')
              : '—'}
          </Typography>
        </Box>
      </Paper>
    );
  };

  return <>{content()}</>;
};

export default BookingDetailsPage;
