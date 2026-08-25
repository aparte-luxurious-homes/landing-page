import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  TextField,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import { useGetExtensionQuoteQuery, useRequestStayExtensionMutation } from '../../api/bookingsApi';
import { toast } from 'react-toastify';

interface RequestExtensionModalProps {
  open: boolean;
  onClose: () => void;
  booking: any;
}

const PRIMARY = '#028090';

const RequestExtensionModal: React.FC<RequestExtensionModalProps> = ({
  open,
  onClose,
  booking,
}) => {
  const [newEndDate, setNewEndDate] = useState<string>('');
  
  const { data: quoteData, isFetching: isQuoteLoading, error: quoteError } = useGetExtensionQuoteQuery(
    { bookingId: booking?.id, new_end_date: newEndDate },
    { skip: !booking?.id || !newEndDate }
  );

  const [requestExtension, { isLoading: isRequesting }] = useRequestStayExtensionMutation();

  // Set minimum date to current end date + 1 day
  const minDate = booking?.end_date ? format(new Date(new Date(booking.end_date).getTime() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd') : '';

  useEffect(() => {
    if (open) {
      setNewEndDate('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!newEndDate) return;
    try {
      await requestExtension({
        bookingId: booking.id,
        new_end_date: newEndDate,
      }).unwrap();
      toast.success('Extension requested successfully');
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to request extension');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Request Stay Extension</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Your current check-out date is {booking?.end_date ? format(new Date(booking.end_date), 'MMM d, yyyy') : '—'}. Select a new check-out date to see the pricing.
        </Typography>

        <TextField
          fullWidth
          label="New Check-out Date"
          type="date"
          value={newEndDate}
          onChange={(e) => setNewEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: minDate }}
          sx={{ mb: 3 }}
        />

        {isQuoteLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {quoteError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to fetch extension quote.
          </Alert>
        )}

        {quoteData && quoteData.data && !isQuoteLoading && (
          <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Extension Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Extra Nights</Typography>
              <Typography variant="body2">{quoteData.data.nights}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Base Price ({quoteData.data.nights} extra night{quoteData.data.nights !== 1 ? 's' : ''})</Typography>
              <Typography variant="body2">₦{Number(quoteData.data.base_price).toLocaleString()}</Typography>
            </Box>
            
            {quoteData.data.discount_amount > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                <Typography variant="body2">Discount</Typography>
                <Typography variant="body2" fontWeight="bold">−₦{Number(quoteData.data.discount_amount).toLocaleString()}</Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2">Additional Amount to Pay</Typography>
              <Typography variant="subtitle2">₦{Number(quoteData.data.total_payable || quoteData.data.total_price).toLocaleString()}</Typography>
            </Box>
            
            {quoteData.data.upsell_message && (
              <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1, border: '1px dashed', borderColor: 'primary.200' }}>
                <Typography variant="caption" sx={{ color: 'primary.800', fontWeight: 500, display: 'block', textAlign: 'center' }}>
                  💡 {quoteData.data.upsell_message}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isRequesting}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!newEndDate || isRequesting || !quoteData?.data}
          sx={{ bgcolor: PRIMARY, '&:hover': { bgcolor: '#026d7a' } }}
        >
          {isRequesting ? <CircularProgress size={20} color="inherit" /> : 'Request Extension'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestExtensionModal;
