import React, { useState, useCallback } from 'react';
import { Box, Typography, Avatar, Rating, Divider, CircularProgress, Grid, Button } from '@mui/material';
import { useGetPropertyReviewsQuery, useGetPropertyRatingSummaryQuery } from '../../api/reviewsApi';
import { format } from 'date-fns';

interface ReviewsListProps {
  propertyId: string;
}

const PAGE_SIZE = 6;

const ReviewsList: React.FC<ReviewsListProps> = ({ propertyId }) => {
  const [page, setPage] = useState(1);
  const { data: reviews, isLoading: reviewsLoading, isFetching } = useGetPropertyReviewsQuery({ property_id: propertyId, page, size: PAGE_SIZE });
  const { data: summary, isLoading: summaryLoading } = useGetPropertyRatingSummaryQuery(propertyId);
  const [allReviews, setAllReviews] = useState<any[]>([]);

  // Accumulate reviews as pages are loaded
  React.useEffect(() => {
    if (reviews && reviews.length > 0) {
      setAllReviews(prev => {
        // Filter out flagged/removed reviews immediately
        const activeReviews = (reviews as any[]).filter(r => !r.is_flagged && !r.is_removed);
        
        // Avoid duplicates
        const existingIds = new Set(prev.map(r => r.id));
        const newReviews = activeReviews.filter(r => !existingIds.has(r.id));
        return page === 1 ? activeReviews : [...prev, ...newReviews];
      });
    } else if (reviews && reviews.length === 0 && page === 1) {
      setAllReviews([]);
    }
  }, [reviews, page]);

  const handleLoadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const hasMore = reviews && reviews.length === PAGE_SIZE;

  if (reviewsLoading || summaryLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#028090' }} />
      </Box>
    );
  }

  // Derive a display name or initial from available info
  const getReviewerDisplay = (review: any) => {
    // If the API returns user info (first_name, name, etc.), use it
    if (review.user?.first_name) {
      return {
        name: `${review.user.first_name}${review.user.last_name ? ' ' + review.user.last_name.charAt(0) + '.' : ''}`,
        initial: review.user.first_name.charAt(0).toUpperCase(),
      };
    }
    if (review.user?.name) {
      return {
        name: review.user.name,
        initial: review.user.name.charAt(0).toUpperCase(),
      };
    }
    if (review.reviewer_name) {
      return {
        name: review.reviewer_name,
        initial: review.reviewer_name.charAt(0).toUpperCase(),
      };
    }
    // Fallback: show "Verified Guest" with a generic initial
    return {
      name: 'Verified Guest',
      initial: 'V',
    };
  };

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Guest Reviews
      </Typography>

      {summary && summary.total_reviews > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#028090' }}>
              {summary.average_rating.toFixed(1)}
            </Typography>
            <Rating value={summary.average_rating} readOnly precision={0.1} />
            <Typography variant="body2" color="text.secondary">
              Based on {summary.total_reviews} review{summary.total_reviews !== 1 ? 's' : ''}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
        </Box>
      )}

      <Grid container spacing={3}>
        {allReviews && allReviews.length > 0 ? (
          allReviews.map((review) => {
            const { name, initial } = getReviewerDisplay(review);
            return (
              <Grid item xs={12} md={6} key={review.id}>
                <Box sx={{ p: 3, border: '1px solid #eee', borderRadius: 2, height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#028090' }}>
                      {initial}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {name}
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
            );
          })
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              No reviews yet for this property.
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Load More */}
      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            onClick={handleLoadMore}
            disabled={isFetching}
            variant="outlined"
            sx={{
              color: '#028090',
              borderColor: '#028090',
              textTransform: 'none',
              px: 4,
              '&:hover': { borderColor: '#026f7a', bgcolor: 'rgba(2, 128, 144, 0.04)' },
            }}
          >
            {isFetching ? <CircularProgress size={20} sx={{ color: '#028090' }} /> : 'Show More Reviews'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default ReviewsList;
