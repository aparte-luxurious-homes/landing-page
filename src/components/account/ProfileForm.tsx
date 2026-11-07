'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import FormField from '../ui/FormField';
import FormSelect from '../ui/FormSelect';
import ChangeEmailDialog from './ChangeEmailDialog';
import { profileFormSchema, ProfileFormValues } from '../../lib/schemas/profileSchema';
import { useCancelEmailChangeMutation, usePatchProfileMutation } from '../../api/profileApi';
import {
  EmailHealthFields,
  describeEmailChangeError,
  isEmailFailing,
  readEmailHealth,
} from '../../lib/email-health';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

interface ProfileFormProps {
  profile?: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    dob?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  email?: string;
  phone?: string;
  /** The profile payload's email-health fields, to flag an address that bounces. */
  emailHealth?: EmailHealthFields | null;
  /** Open the change-email flow on mount (arriving with ?focus=email). */
  focusEmail?: boolean;
}

export default function ProfileForm({
  profile,
  email,
  phone,
  emailHealth,
  focusEmail = false,
}: ProfileFormProps) {
  const [patchProfile] = usePatchProfileMutation();
  const [cancelEmailChange, { isLoading: cancellingEmail }] = useCancelEmailChangeMutation();
  const emailBoxRef = useRef<HTMLDivElement | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const defaults: ProfileFormValues = {
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    gender: (['MALE', 'FEMALE', 'OTHER'].includes(profile?.gender || '') ? profile!.gender! : '') as ProfileFormValues['gender'],
    dob: profile?.dob || '',
    phone: phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || '',
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaults,
  });

  // Sync form when profile data refreshes (e.g. after save)
  useEffect(() => {
    reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.firstName, profile?.lastName, profile?.gender, profile?.dob, phone, profile?.address, profile?.city, profile?.state, profile?.country]);

  const health = readEmailHealth(emailHealth);
  const pendingEmail = health.pendingEmail;

  useEffect(() => {
    if (!focusEmail) return;
    emailBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setEmailDialogOpen(true);
  }, [focusEmail]);

  const onCancelPending = async () => {
    try {
      await cancelEmailChange().unwrap();
      toast.info('Email change cancelled.');
    } catch (err) {
      toast.error(describeEmailChangeError(err, 'cancel').message);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      // Only send changed fields. Never `email`: PUT /profile refuses a
      // different address — that goes through ChangeEmailDialog.
      const payload: Record<string, string> = {};
      if (data.firstName !== defaults.firstName) payload.first_name = data.firstName;
      if (data.lastName !== defaults.lastName) payload.last_name = data.lastName;
      if (data.gender !== defaults.gender && data.gender) payload.gender = data.gender;
      if (data.dob !== defaults.dob && data.dob) payload.dob = data.dob;
      if (data.phone !== defaults.phone && data.phone) payload.phone = data.phone;
      if (data.address !== defaults.address) payload.address = data.address || '';
      if (data.city !== defaults.city) payload.city = data.city || '';
      if (data.state !== defaults.state) payload.state = data.state || '';
      if (data.country !== defaults.country) payload.country = data.country || '';

      if (Object.keys(payload).length === 0) {
        toast.info('No changes to save');
        return;
      }

      await patchProfile(payload).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err) {
      const data = (err as { data?: { detail?: unknown; message?: unknown } })?.data;
      const msg = data?.detail || data?.message;
      toast.error(typeof msg === 'string' ? msg : 'Failed to update profile');
    }
  };

  const sectionHeading = (text: string) => (
    <Typography variant="subtitle2" sx={{ color: '#028090', fontWeight: 600, mt: 1, mb: 0.5, letterSpacing: '0.02em' }}>
      {text}
    </Typography>
  );

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        {sectionHeading('Personal Information')}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
          <FormField name="firstName" control={control} label="First Name" />
          <FormField name="lastName" control={control} label="Last Name" />
          <FormSelect name="gender" control={control} label="Gender" options={GENDER_OPTIONS} />
          <FormField name="dob" control={control} label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} />
        </Box>

        {sectionHeading('Contact & Address')}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
          <Box ref={emailBoxRef}>
            {/* Read-only: a new address must prove it receives mail first (ChangeEmailDialog). */}
            <TextField
              id="profile-email"
              value={email || ''}
              label="Email Address"
              placeholder="No email yet"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true }}
              error={isEmailFailing(health)}
              helperText={
                isEmailFailing(health)
                  ? `Emails to this address aren't reaching you.${health.reason ? ` ${health.reason}` : ''}`
                  : undefined
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#f3f4f6',
                },
              }}
            />
            {pendingEmail ? (
              <Box
                role="status"
                sx={{ mt: 1, p: 1.5, borderRadius: '12px', backgroundColor: '#eef6f6', color: '#13272b' }}
              >
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  Waiting for you to enter the code we sent to <strong>{pendingEmail}</strong>.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setEmailDialogOpen(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '10px',
                      backgroundColor: '#028090',
                      '&:hover': { backgroundColor: '#026d7a' },
                    }}
                  >
                    Enter code
                  </Button>
                  <Button
                    size="small"
                    onClick={onCancelPending}
                    disabled={cancellingEmail}
                    sx={{ textTransform: 'none', color: '#555', fontWeight: 500 }}
                  >
                    {cancellingEmail ? 'Cancelling…' : 'Cancel'}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Button
                size="small"
                onClick={() => setEmailDialogOpen(true)}
                sx={{ mt: 0.5, px: 1, textTransform: 'none', fontWeight: 600, color: '#028090' }}
              >
                {email ? 'Change email' : 'Add email'}
              </Button>
            )}
          </Box>
          <FormField name="phone" control={control} label="Phone Number" placeholder="+234 801 234 5678" />
          <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
            <FormField name="address" control={control} label="Address" />
          </Box>
          <FormField name="city" control={control} label="City" />
          <FormField name="state" control={control} label="State" />
          <FormField name="country" control={control} label="Country" />
        </Box>

        {/* Action buttons — only visible when dirty */}
        {isDirty && (
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
            <Button
              onClick={() => reset(defaults)}
              variant="text"
              sx={{ textTransform: 'none', color: '#888', fontWeight: 500 }}
            >
              Discard
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                backgroundColor: '#028090',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1,
                '&:hover': { backgroundColor: '#026d7a' },
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Outside the form: React bubbles a portal's submit to its tree parent. */}
      <ChangeEmailDialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        currentEmail={email}
        pendingEmail={pendingEmail}
      />
    </>
  );
}
