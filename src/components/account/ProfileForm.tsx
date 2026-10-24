'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { toast } from 'react-toastify';
import FormField from '../ui/FormField';
import FormSelect from '../ui/FormSelect';
import EmailSuggestion from '../inputs/EmailSuggestion';
import ConfirmEmailChangeDialog from './ConfirmEmailChangeDialog';
import { profileFormSchema, ProfileFormValues } from '../../lib/schemas/profileSchema';
import { usePatchProfileMutation } from '../../api/profileApi';
import { useEmailHint } from '../../hooks/useEmailHint';
import { normaliseEmail } from '../../lib/email-check';
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

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#f9fafb',
    transition: 'all 0.2s ease',
    '&:hover': { backgroundColor: '#f3f4f6' },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#028090', borderWidth: 2 },
    },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#028090' },
};

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
  /** Focus the email field on mount (arriving from the email-health banner). */
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
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  // Payload waiting on the "use this email?" confirmation.
  const [pendingPayload, setPendingPayload] = useState<Record<string, string> | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [savingConfirmed, setSavingConfirmed] = useState(false);

  const defaults: ProfileFormValues = {
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    gender: (['MALE', 'FEMALE', 'OTHER'].includes(profile?.gender || '') ? profile!.gender! : '') as ProfileFormValues['gender'],
    dob: profile?.dob || '',
    phone: phone || '',
    email: email || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    country: profile?.country || '',
  };

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { isDirty, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: defaults,
  });

  // Sync form when profile data refreshes (e.g. after save)
  useEffect(() => {
    reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.firstName, profile?.lastName, profile?.gender, profile?.dob, phone, email, profile?.address, profile?.city, profile?.state, profile?.country]);

  const emailValue = watch('email') ?? '';
  const emailHint = useEmailHint(emailValue, (next) =>
    setValue('email', next, { shouldDirty: true, shouldValidate: true }),
  );

  const health = readEmailHealth(emailHealth);
  // Only while the box still holds the address that bounced.
  const showBounceNote =
    isEmailFailing(health) && normaliseEmail(emailValue) === normaliseEmail(email);

  useEffect(() => {
    if (!focusEmail) return;
    const el = emailInputRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus({ preventScroll: true });
    el.select();
  }, [focusEmail]);

  const save = async (payload: Record<string, string>) => {
    try {
      await patchProfile(payload).unwrap();
      toast.success(
        payload.email ? `Profile updated. We'll email you at ${payload.email}.` : 'Profile updated successfully!',
      );
      return true;
    } catch (err) {
      if (payload.email) {
        const { message, aboutEmail } = describeEmailChangeError(err);
        if (aboutEmail) setError('email', { type: 'server', message });
        throw new Error(message);
      }
      const data = (err as { data?: { detail?: unknown; message?: unknown } })?.data;
      const msg = data?.detail || data?.message || 'Failed to update profile';
      toast.error(typeof msg === 'string' ? msg : 'Failed to update profile');
      return false;
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    // Only send changed fields
    const payload: Record<string, string> = {};
    if (data.firstName !== defaults.firstName) payload.first_name = data.firstName;
    if (data.lastName !== defaults.lastName) payload.last_name = data.lastName;
    if (data.gender !== defaults.gender && data.gender) payload.gender = data.gender;
    if (data.dob !== defaults.dob && data.dob) payload.dob = data.dob;
    if (data.phone !== defaults.phone && data.phone) payload.phone = data.phone;
    const nextEmail = (data.email || '').trim();
    if (nextEmail && normaliseEmail(nextEmail) !== normaliseEmail(defaults.email)) {
      payload.email = nextEmail;
    }
    if (data.address !== defaults.address) payload.address = data.address || '';
    if (data.city !== defaults.city) payload.city = data.city || '';
    if (data.state !== defaults.state) payload.state = data.state || '';
    if (data.country !== defaults.country) payload.country = data.country || '';

    if (Object.keys(payload).length === 0) {
      toast.info('No changes to save');
      return;
    }

    // A new address is read back once before it's saved — see ConfirmEmailChangeDialog.
    if (payload.email) {
      setConfirmError(null);
      setPendingPayload(payload);
      return;
    }

    await save(payload);
  };

  const confirmEmailChange = async () => {
    if (!pendingPayload) return;
    setSavingConfirmed(true);
    setConfirmError(null);
    try {
      await save(pendingPayload);
      setPendingPayload(null);
    } catch (err) {
      setConfirmError((err as Error).message);
    } finally {
      setSavingConfirmed(false);
    }
  };

  const sectionHeading = (text: string) => (
    <Typography variant="subtitle2" sx={{ color: '#028090', fontWeight: 600, mt: 1, mb: 0.5, letterSpacing: '0.02em' }}>
      {text}
    </Typography>
  );

  return (
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
        <Box>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                id="profile-email"
                inputRef={(el: HTMLInputElement | null) => {
                  field.ref(el);
                  emailInputRef.current = el;
                }}
                value={field.value ?? ''}
                onBlur={() => {
                  field.onBlur();
                  emailHint.onBlur();
                }}
                label="Email Address"
                type="email"
                autoComplete="email"
                error={!!fieldState.error || showBounceNote}
                helperText={
                  fieldState.error?.message ??
                  (showBounceNote
                    ? `Emails to this address aren't reaching you.${health.reason ? ` ${health.reason}` : ''}`
                    : undefined)
                }
                fullWidth
                size="small"
                sx={FIELD_SX}
              />
            )}
          />
          <EmailSuggestion {...emailHint.hint} className="px-1" />
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
            disabled={isSubmitting || savingConfirmed}
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
            {isSubmitting || savingConfirmed ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      )}

      <ConfirmEmailChangeDialog
        open={!!pendingPayload}
        email={pendingPayload?.email ?? ''}
        saving={savingConfirmed}
        error={confirmError}
        onCancel={() => {
          setPendingPayload(null);
          setConfirmError(null);
        }}
        onConfirm={confirmEmailChange}
      />
    </Box>
  );
}
