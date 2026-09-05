'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { toast } from 'react-toastify';
import ProfileImageUpload from './ProfileImageUpload';
import ProfileForm from './ProfileForm';
import ReferralCodeCard from './ReferralCodeCard';
import KycVerificationCard from './KycVerificationCard';
import GuestPayoutVerificationCard from './GuestPayoutVerificationCard';
import CardSection from '../ui/CardSection';
import { useUpdateProfileMutation } from '../../api/profileApi';
import type { ProfileResponse } from '../../api/profileApi';
import { useAppSelector } from '../../hooks';
import { selectUserRole } from '../../features/auth/authSlice';

interface ProfileTabProps {
  profile?: ProfileResponse['data'];
  isLoading: boolean;
}

function ProfileSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="circular" width={120} height={120} />
        <Skeleton width={160} height={24} />
        <Skeleton width={200} height={18} />
      </Box>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rounded" height={180} sx={{ borderRadius: '16px' }} />
      ))}
    </Box>
  );
}

export default function ProfileTab({ profile, isLoading }: ProfileTabProps) {
  const [updateProfile] = useUpdateProfileMutation();
  const [isUploading, setIsUploading] = useState(false);
  const userRole = useAppSelector(selectUserRole);
  const isGuest = userRole === 'GUEST';

  if (isLoading) return <ProfileSkeleton />;

  const firstName = profile?.profile?.firstName || '';
  const lastName = profile?.profile?.lastName || '';
  const fallbackInitial = firstName?.[0] || profile?.email?.[0] || '?';

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      await updateProfile(formData).unwrap();
      toast.success('Profile image updated!');
    } catch (err: any) {
      const msg = err?.data?.detail || 'Failed to upload image';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Avatar + Name header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pb: 1 }}>
        <ProfileImageUpload
          currentImage={profile?.profile?.profileImage}
          fallbackInitial={fallbackInitial}
          onImageSelected={handleImageUpload}
          isUploading={isUploading}
        />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#191919', mt: 1 }}>
          {firstName && lastName ? `${firstName} ${lastName}` : 'Complete your profile'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#888' }}>
          {profile?.email || ''}
        </Typography>
      </Box>

      {/* Profile form card */}
      <CardSection title="Profile Details" subtitle="Your personal and contact information">
        <ProfileForm
          profile={profile?.profile}
          email={profile?.email}
          phone={profile?.phone}
        />
      </CardSection>

      {/* Identity verification.
          Restored 2026-09-05 — it had been commented out as "temporarily
          hidden" and guests were reporting they could not complete KYC,
          correctly, because there was nothing to complete it with.

          Guests get the PAYOUT route, hosts get the NIN form.

          A guest has exactly one reason to be verified: receiving their caution
          fee back. That refund lands in their wallet and leaves through a
          payout account, and supplying a BVN there verifies them automatically
          (services/finances/router.py sets kyc_status = VERIFIED on a
          successful resolve). Asking the same person for a NIN as well is a
          second identity check for a need they do not have — and the NIN form
          additionally requires a first and last name that an agent booking on
          their behalf may never have entered.

          Nothing about login or check-in depends on either. Check-in gates on
          `guest_unclaimed` — signup_source=ADMIN_ONBOARD with neither
          is_verified nor email_verified — which is ACCOUNT CLAIMING via the
          emailed OTP, not identity. */}
      {isGuest ? (
        <GuestPayoutVerificationCard
          kycStatus={profile?.profile?.kycStatus}
          bvn={profile?.profile?.bvn}
        />
      ) : (
        <KycVerificationCard
          kycStatus={profile?.profile?.kycStatus}
          nin={profile?.profile?.nin}
          bvn={profile?.profile?.bvn}
          phone={profile?.phone}
          firstName={profile?.profile?.firstName}
          lastName={profile?.profile?.lastName}
        />
      )}

      {/* Referral code */}
      {!isGuest && <ReferralCodeCard />}
    </Box>
  );
}
