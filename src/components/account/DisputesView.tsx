import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Collapse,
  IconButton,
  Divider,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { useGetMyDisputesQuery, DisputeStatus } from '../../api/disputesApi';
import { format } from 'date-fns';

const DisputesView: React.FC = () => {
  const { data: disputes, isLoading, error } = useGetMyDisputesQuery();
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
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
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary" sx={{ mb: 1 }}>You haven't raised any disputes.</Typography>
          <Typography variant="caption" color="text.secondary">
            If you have an issue with a booking, you can raise a dispute from your booking history.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {disputes.map((dispute) => {
            const isExpanded = expandedId === dispute.id;
            return (
              <Grid item xs={12} key={dispute.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                  }}
                  onClick={() => toggleExpand(dispute.id)}
                >
                  <CardContent sx={{ pb: isExpanded ? 1 : undefined }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {dispute.dispute_id}
                          </Typography>
                          <Chip
                            label={dispute.category.replace(/_/g, ' ')}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 22 }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Raised on {format(new Date(dispute.created_at), 'MMMM dd, yyyy')}
                          {dispute.booking_id && (
                            <> • Booking: {dispute.booking_id}</>
                          )}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={dispute.status.replace(/_/g, ' ')}
                          color={getStatusColor(dispute.status) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleExpand(dispute.id); }}>
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Preview description (truncated when collapsed) */}
                    {!isExpanded && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%',
                        }}
                      >
                        {dispute.description}
                      </Typography>
                    )}

                    {/* Expanded Details */}
                    <Collapse in={isExpanded} timeout="auto">
                      <Box sx={{ mt: 1 }}>
                        <Divider sx={{ mb: 2 }} />

                        {/* Full Description */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Description
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {dispute.description}
                          </Typography>
                        </Box>

                        {/* Evidence */}
                        {dispute.evidence && dispute.evidence.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                              Evidence ({dispute.evidence.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {dispute.evidence.map((item, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${item.media_type} ${idx + 1}`}
                                  size="small"
                                  component="a"
                                  href={item.media_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  clickable
                                  sx={{ textTransform: 'capitalize' }}
                                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Resolution Outcome */}
                        {dispute.outcome && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdfa', borderRadius: 1, border: '1px solid #e0f2f1' }}>
                            <Typography variant="subtitle2" sx={{ color: '#028090', fontWeight: 600 }}>
                              Resolution Outcome
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {dispute.outcome.replace(/_/g, ' ')}
                            </Typography>
                            {dispute.admin_notes && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Admin Notes: {dispute.admin_notes}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* Status info for AWAITING_EVIDENCE */}
                        {dispute.status === 'AWAITING_EVIDENCE' && (
                          <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ffe0b2' }}>
                            <Typography variant="subtitle2" color="warning.dark" fontWeight={600}>
                              Action Required
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              Additional evidence has been requested. Please visit your dispute details to upload supporting files.
                            </Typography>
                          </Box>
                        )}

                        {/* Timeline info */}
                        <Box sx={{ mt: 2, display: 'flex', gap: 3 }}>
                          <Typography variant="caption" color="text.secondary">
                            Created: {format(new Date(dispute.created_at), 'MMM dd, yyyy HH:mm')}
                          </Typography>
                          {dispute.updated_at && dispute.updated_at !== dispute.created_at && (
                            <Typography variant="caption" color="text.secondary">
                              Updated: {format(new Date(dispute.updated_at), 'MMM dd, yyyy HH:mm')}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default DisputesView;
