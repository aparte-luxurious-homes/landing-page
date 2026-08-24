'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { useState } from 'react';
import { toast } from 'react-toastify';
import CardSection from '../ui/CardSection';
import { useGetMyReferralCodeQuery } from '../../api/referralsApi';

export default function ReferralCodeCard() {
  const { data, isLoading } = useGetMyReferralCodeQuery();
  const [copied, setCopied] = useState(false);

  const code = data?.data?.code;
  const link = data?.data?.link;

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleShare = async () => {
    if (!code) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Aparte Referral',
          text: `Use my referral code ${code} on Aparte!`,
          url: link || undefined,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  if (isLoading) {
    return (
      <CardSection title="Referral Code">
        <Skeleton variant="rounded" width={200} height={40} />
      </CardSection>
    );
  }

  if (!code) return null;

  return (
    <CardSection title="Referral Code" subtitle="Share your code and earn rewards when friends book">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          backgroundColor: '#f0fdfa',
          border: '1px dashed #028090',
          borderRadius: '12px',
          px: 2.5,
          py: 1.5,
          width: 'fit-content',
        }}
      >
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#028090',
            letterSpacing: '0.1em',
          }}
        >
          {code}
        </Typography>

        <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
          <IconButton onClick={handleCopy} size="small" sx={{ color: '#028090' }}>
            <ContentCopyIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Share">
          <IconButton onClick={handleShare} size="small" sx={{ color: '#028090' }}>
            <ShareIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </CardSection>
  );
}
