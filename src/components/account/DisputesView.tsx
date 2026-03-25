import React from 'react';
import { Box, Typography, Card, CardContent, Chip, CircularProgress, Grid } from '@mui/material';
import { useGetMyDisputesQuery, DisputeStatus } from '../../api/disputesApi';
import { format } from 'date-fns';

const DisputesView: React.FC = () => {
  const { data: disputes, isLoading, error } = useGetMyDisputesQuery();

  const getStatusColor = (status: DisputeStatus) => {
    switch (status) {
      case 'OPEN': return 'info';
      case 'UNDER_REVIEW': return 'warning';
      case 'AWAITING_EVIDENCE': return 'secondary';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#028090' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">Failed to load disputes. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 4, color: '#028090', fontWeight: 600 }}>
        My Disputes
      </Typography>

      {!disputes || disputes.length === 0 ? (
        <Typography color="text.secondary">You haven't raised any disputes.</Typography>
      ) : (
        <Grid container spacing={2}>
          {disputes.map((dispute) => (
            <Grid item xs={12} key={dispute.id}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {dispute.dispute_id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Raised on {format(new Date(dispute.created_at), 'MMMM dd, yyyy')}
                      </Typography>
                    </Box>
                    <Chip 
                      label={dispute.status.replace('_', ' ')} 
                      color={getStatusColor(dispute.status) as any}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Category: <strong>{dispute.category.replace('_', ' ')}</strong>
                    </Typography>
                    <Typography variant="body2">
                      {dispute.description}
                    </Typography>
                  </Box>
                  {dispute.outcome && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafb', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="primary">Resolution Outcome</Typography>
                      <Typography variant="body2">{dispute.outcome.replace('_', ' ')}</Typography>
                      {dispute.admin_notes && (
                        <Typography variant="caption" color="text.secondary">{dispute.admin_notes}</Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DisputesView;
