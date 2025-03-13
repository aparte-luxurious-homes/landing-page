import React from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Rating,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useGetPropertyReviewsQuery } from '../../api/reviewApi';

// interface Review {
//   id: string;
//   rating: number;
//   review: string;
//   reviewer: string;
//   date: string;
// }

interface ReviewsPopupProps {
  open: boolean;
  onClose: () => void;
  property_id: string;
  unit_id: string;
  // reviews: Review[];
}

const ReviewsPopup: React.FC<ReviewsPopupProps> = ({
  open,
  onClose,
  unit_id,
  property_id,
}) => {
  const { data: reviews, isLoading } = useGetPropertyReviewsQuery({
    property_id,
    unit_id,
  });
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle sx={{ color: 'primary.main' }}>Reviews and Ratings</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <p>Loading reviews ...</p>
        ) : (
          <List>
            {reviews?.data.map((review) => (
              <ListItem key={review.id} alignItems="flex-start">
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={Number(review.rating)} readOnly />
                      <Typography variant="body2" color="text.secondary">
                        {review.user.profile.firstName} -{' '}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                  secondary={review.review}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewsPopup;
