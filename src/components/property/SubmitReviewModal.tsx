import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { useSubmitReviewMutation } from '../../api/reviewsApi';
import { toast } from 'react-toastify';

interface SubmitReviewModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  propertyName: string;
}

const SubmitReviewModal: React.FC<SubmitReviewModalProps> = ({ open, onClose, bookingId, propertyName }) => {
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [submitReview, { isLoading }] = useSubmitReviewMutation();

  const handleSubmit = async () => {
    if (!rating) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await submitReview({
        booking_id: bookingId,
        rating,
        comment,
      }).unwrap();
      toast.success('Review submitted successfully');
      onClose();
      // Reset form
      setRating(5);
      setComment('');
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Review your stay at {propertyName}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Rate your experience
            </Typography>
            <Rating
              value={rating}
              onChange={(_, newValue) => setRating(newValue)}
              size="large"
            />
          </Box>
          <TextField
            label="Tell us about your stay"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike? (Max 500 characters)"
            inputProps={{ maxLength: 500 }}
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
          disabled={isLoading}
          sx={{ bgcolor: '#028090', '&:hover': { bgcolor: '#026f7a' } }}
        >
          {isLoading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmitReviewModal;
