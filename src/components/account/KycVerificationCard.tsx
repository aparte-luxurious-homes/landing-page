'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import { useState } from 'react';
import { toast } from 'react-toastify';
import CardSection from '../ui/CardSection';
import FormField from '../ui/FormField';
import { kycVerificationSchema, KycVerificationValues } from '../../lib/schemas/profileSchema';
import { useVerifyIdentityMutation, profileApi } from '../../api/profileApi';
import { useDispatch } from 'react-redux';

interface KycVerificationCardProps {
  kycStatus?: string;
  nin?: string;
  bvn?: string;
  phone?: string;
}

function maskValue(val: string) {
  if (!val || val.length < 4) return '***';
  return '*'.repeat(val.length - 4) + val.slice(-4);
}

export default function KycVerificationCard({ kycStatus, nin, bvn, phone }: KycVerificationCardProps) {
  const dispatch = useDispatch();
  const [verifyIdentity] = useVerifyIdentityMutation();
  const [apiError, setApiError] = useState('');
  const isVerified = kycStatus === 'VERIFIED';

  const { control, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<KycVerificationValues>({
    resolver: zodResolver(kycVerificationSchema),
    defaultValues: {
      type: 'nin',
      value: '',
      mobileNumber: phone || '',
      consent: false as unknown as true,
    },
  });

  const consentValue = watch('consent');

  const onSubmit = async (data: KycVerificationValues) => {
    setApiError('');
    try {
      await verifyIdentity(data).unwrap();
      dispatch(profileApi.util.invalidateTags(['Profile']));
      toast.success('Identity verified successfully!');
    } catch (err: any) {
      const msg = err?.data?.detail || err?.data?.message || 'Verification failed. Please try again.';
      setApiError(msg);
    }
  };

  if (isVerified) {
    return (
      <CardSection title="Identity Verification">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VerifiedUserIcon sx={{ color: '#16a34a', fontSize: 28 }} />
          <Box sx={{ flex: 1 }}>
            <Chip label="Verified" size="small" sx={{ backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 600, mb: 0.5 }} />
            <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
              {nin && (
                <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LockIcon sx={{ fontSize: 14 }} /> NIN: {maskValue(nin)}
                </Typography>
              )}
              {bvn && (
                <Typography variant="body2" sx={{ color: '#666', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LockIcon sx={{ fontSize: 14 }} /> BVN: {maskValue(bvn)}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </CardSection>
    );
  }

  return (
    <CardSection title="Identity Verification" subtitle="Verify your NIN to unlock withdrawals and check-in">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {apiError && <Alert severity="error" onClose={() => setApiError('')}>{apiError}</Alert>}

        <FormField
          name="value"
          control={control}
          label="National Identification Number (NIN)"
          placeholder="Enter your 11-digit NIN"
          inputProps={{ maxLength: 11, inputMode: 'numeric' }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
            setValue('value', digits, { shouldValidate: true });
          }}
        />

        <FormField
          name="mobileNumber"
          control={control}
          label="Phone Number"
          placeholder="+234 801 234 5678"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={!!consentValue}
              onChange={(e) => setValue('consent', e.target.checked as unknown as true, { shouldValidate: true })}
              sx={{ '&.Mui-checked': { color: '#028090' } }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: '#666' }}>
              I consent to the verification of my identity details
            </Typography>
          }
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{
            backgroundColor: '#028090',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            py: 1.2,
            alignSelf: 'flex-start',
            '&:hover': { backgroundColor: '#026d7a' },
          }}
        >
          {isSubmitting ? 'Verifying...' : 'Verify Identity'}
        </Button>
      </Box>
    </CardSection>
  );
}
