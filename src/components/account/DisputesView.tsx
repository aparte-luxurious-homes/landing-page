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

                        {/* Evidence Section - More visual display */}
                        {dispute.evidence && dispute.evidence.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              Supporting Evidence ({dispute.evidence.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                              {dispute.evidence.map((item, idx) => {
                                const isImage = item.media_type === 'IMAGE' || (item.media_url && /\.(jpg|jpeg|png|webp)/i.test(item.media_url));
                                const isVideo = item.media_type === 'VIDEO' || (item.media_url && /\.(mp4|mov|webm)/i.test(item.media_url));
                                
                                return (
                                  <Box
                                    key={idx}
                                    component="a"
                                    href={item.media_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                      textDecoration: 'none',
                                      color: 'inherit',
                                      width: 100,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      '&:hover .preview-box': { borderColor: '#028090', transform: 'translateY(-2px)' }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Box
                                      className="preview-box"
                                      sx={{
                                        width: '100%',
                                        height: 80,
                                        bgcolor: '#f5f7f8',
                                        borderRadius: 1.5,
                                        border: '1px solid #e0e0e0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                      }}
                                    >
                                      {isImage ? (
                                        <Box
                                          component="img"
                                          src={item.media_url}
                                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                          onError={(e: any) => { e.currentTarget.src = 'https://placehold.co/100x80?text=File'; }}
                                        />
                                      ) : isVideo ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                          <Box component="span" sx={{ fontSize: '1.2rem' }}>🎬</Box>
                                        </Box>
                                      ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                          <Box component="span" sx={{ fontSize: '1.2rem' }}>📄</Box>
                                        </Box>
                                      )}
                                      <Box sx={{ 
                                        position: 'absolute', 
                                        bottom: 0, 
                                        left: 0, 
                                        right: 0, 
                                        bgcolor: 'rgba(2, 128, 144, 0.8)', 
                                        color: 'white', 
                                        fontSize: '0.65rem', 
                                        textAlign: 'center', 
                                        py: 0.2 
                                      }}>
                                        {item.media_type || 'FILE'}
                                      </Box>
                                    </Box>
                                    <Typography variant="caption" noWrap sx={{ width: '100%', textAlign: 'center', color: '#028090' }}>
                                      View File
                                    </Typography>
                                  </Box>
                                );
                              })}
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
