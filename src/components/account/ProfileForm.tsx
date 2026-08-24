'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { toast } from 'react-toastify';
import FormField from '../ui/FormField';
import FormSelect from '../ui/FormSelect';
import { profileFormSchema, ProfileFormValues } from '../../lib/schemas/profileSchema';
import { usePatchProfileMutation } from '../../api/profileApi';

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
}

export default function ProfileForm({ profile, email, phone }: ProfileFormProps) {
  const [patchProfile] = usePatchProfileMutation();

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

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      // Only send changed fields
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
    } catch (err: any) {
      const msg = err?.data?.detail || err?.data?.message || 'Failed to update profile';
      toast.error(msg);
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
        <TextField
          label="Email Address"
          value={email || ''}
          disabled
          fullWidth
          size="small"
          InputProps={{
            endAdornment: <LockOutlinedIcon sx={{ color: '#bbb', fontSize: 18 }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: '#f3f4f6',
            },
          }}
        />
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
  );
}
