import React from 'react';
import { Box, Typography, Avatar, Rating, Divider, CircularProgress, Grid } from '@mui/material';
import { useGetPropertyReviewsQuery, useGetPropertyRatingSummaryQuery } from '../../api/reviewsApi';
import { format } from 'date-fns';

interface ReviewsListProps {
  propertyId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ propertyId }) => {
  const { data: reviews, isLoading: reviewsLoading } = useGetPropertyReviewsQuery({ property_id: propertyId });
  const { data: summary, isLoading: summaryLoading } = useGetPropertyRatingSummaryQuery(propertyId);

  if (reviewsLoading || summaryLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#028090' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Guest Reviews
      </Typography>

      {summary && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#028090' }}>
              {summary.average_rating.toFixed(1)}
            </Typography>
            <Rating value={summary.average_rating} readOnly precision={0.1} />
            <Typography variant="body2" color="text.secondary">
              Based on {summary.total_reviews} reviews
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
          {/* We could add more distribution stats here if available */}
        </Box>
      )}

      <Grid container spacing={3}>
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Grid item xs={12} md={6} key={review.id}>
              <Box sx={{ p: 3, border: '1px solid #eee', borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#028090' }}>
                    {review.user_id.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Guest
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(review.created_at), 'MMMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Box>
                <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', lineBreak: 'anywhere' }}>
                  {review.comment}
                </Typography>
              </Box>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              No reviews yet for this property.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ReviewsList;
