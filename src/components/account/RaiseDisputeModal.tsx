import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
} from '@mui/material';
import { useRaiseDisputeMutation, DisputeCategory } from '../../api/disputesApi';
import { toast } from 'react-toastify';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

function formatRaiseDisputeError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Failed to raise dispute';

  const err = error as FetchBaseQueryError & { message?: string };
  const data =
    'data' in err && err.data && typeof err.data === 'object'
      ? (err.data as Record<string, unknown>)
      : undefined;
  const detail = data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((item: { msg?: string }) => item.msg || JSON.stringify(item)).join(', ');
  }
  if (detail && typeof detail === 'object' && 'msg' in detail) {
    return String((detail as { msg: string }).msg);
  }
  const message = data?.message;
  if (typeof message === 'string') return message;
  if (typeof err.message === 'string') return err.message;
  return 'Failed to raise dispute';
}

interface RaiseDisputeModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  propertyName: string;
}

const RaiseDisputeModal: React.FC<RaiseDisputeModalProps> = ({ open, onClose, bookingId, propertyName }) => {
  const [category, setCategory] = useState<DisputeCategory>('PROPERTY_MISMATCH');
  const [description, setDescription] = useState('');
  const [raiseDispute, { isLoading }] = useRaiseDisputeMutation();

  const categories: { value: DisputeCategory; label: string }[] = [
    { value: 'PROPERTY_MISMATCH', label: 'Property Mismatch' },
    { value: 'CLEANLINESS', label: 'Cleanliness Issue' },
    { value: 'MISSING_AMENITIES', label: 'Missing Amenities' },
    { value: 'UNAVAILABLE_CHECKIN', label: 'Check-in Issue' },
    { value: 'SAFETY_CONCERNS', label: 'Safety Concerns' },
    { value: 'GUEST_DAMAGE', label: 'Guest Damage' },
    { value: 'RULE_VIOLATION', label: 'Rule Violation' },
    { value: 'UNAUTHORIZED_GUEST', label: 'Unauthorized Guest' },
    { value: 'OVERSTAYING', label: 'Overstaying' },
  ];

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please provide details about the issue');
      return;
    }

    try {
      await raiseDispute({
        booking_id: bookingId,
        category,
        description,
      }).unwrap();
      toast.success('Dispute raised successfully');
      onClose();
      // Reset form
      setCategory('PROPERTY_MISMATCH');
      setDescription('');
    } catch (error: unknown) {
      toast.error(formatRaiseDisputeError(error));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Raise a dispute for {propertyName}</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as DisputeCategory)}
            fullWidth
          >
            {categories.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide specific details about the issue"
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="error"
          disabled={isLoading}
          sx={{ fontWeight: 600 }}
        >
          {isLoading ? 'Submitting...' : 'Raise Dispute'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RaiseDisputeModal;
