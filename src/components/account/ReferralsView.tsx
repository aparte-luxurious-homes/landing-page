'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, CircularProgress, Chip } from '@mui/material';
import { useGetMyReferralCodeQuery, useGetAgentStatsQuery, useGetMyReferralsQuery } from '../../api/referralsApi';
import { CopyAll as CopyIcon, Share as ShareIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const ReferralsView: React.FC = () => {
  const { data: codeData, isLoading: codeLoading } = useGetMyReferralCodeQuery();
  const { data: statsData, isLoading: statsLoading } = useGetAgentStatsQuery();
  const { data: referralsData, isLoading: referralsLoading } = useGetMyReferralsQuery();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Referral link copied to clipboard');
  };

  const handleShare = () => {
    if (codeData?.data?.link && navigator.share) {
      navigator.share({
        title: 'Join AparteNG',
        text: 'Come book a luxurious stay on AparteNG with my referral code: ' + codeData.data.code,
        url: codeData.data.link,
      });
    }
  };

  if (codeLoading || statsLoading || referralsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#028090' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 4, color: '#028090', fontWeight: 600 }}>
        Referrals & Rewards
      </Typography>

      {/* Referral Code Section */}
      <Card variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Your Referral Link
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Earn rewards by inviting your friends to join AparteNG.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f8fafb', p: 1, px: 2, borderRadius: 1.5, mt: 2, border: '1px solid #eee' }}>
              <Typography variant="caption" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: { xs: 200, sm: 350 } }}>
                {codeData?.data?.link || 'No referral link available'}
              </Typography>
              <Button 
                startIcon={<CopyIcon />} 
                onClick={() => handleCopy(codeData?.data?.link || '')}
                sx={{ ml: 2, color: '#028090', textTransform: 'none' }}
              >
                Copy
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
            <Button 
              variant="contained" 
              startIcon={<ShareIcon />} 
              onClick={handleShare}
              sx={{ bgcolor: '#028090', '&:hover': { bgcolor: '#026f7a' }, borderRadius: 1.5, px: 3 }}
            >
              Share
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="#028090">{statsData?.data?.total_referrals || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Total Referrals</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="#028090">{statsData?.data?.active_referrals || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Active Referrals</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="#028090">{statsData?.data?.total_bookings || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Successful Bookings</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Referrals List Section */}
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Invited Friends
      </Typography>
      {!referralsData?.data?.items || referralsData.data.items.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No friends invited yet. Start sharing your link!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {referralsData.data.items.map((referral) => (
            <Grid item xs={12} key={referral.id}>
              <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>{referral.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{referral.email} • Joined on {format(new Date(referral.created_at), 'MMM dd, yyyy')}</Typography>
                </Box>
                <Chip 
                  label={referral.is_active ? 'Active' : 'Inactive'} 
                  color={referral.is_active ? 'success' : 'default'} 
                  size="small" 
                  variant="outlined"
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ReferralsView;
