import { z } from 'zod';

export const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(255),
  lastName: z.string().min(1, 'Last name is required').max(255),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().or(z.literal('')),
  dob: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Date must be in YYYY-MM-DD format',
    }),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?\d{10,15}$/.test(val), {
      message: 'Enter a valid phone number (10-15 digits)',
    }),
  address: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(255).optional().or(z.literal('')),
  state: z.string().max(255).optional().or(z.literal('')),
  country: z.string().max(255).optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

const stripWhitespace = (val: unknown) => typeof val === 'string' ? val.replace(/\s/g, '') : val;

export const passwordChangeSchema = z
  .object({
    current_password: z.preprocess(stripWhitespace, z.string().min(8, 'Password must be at least 8 characters')),
    new_password: z.preprocess(
      stripWhitespace,
      z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(32)
        .refine((val) => /[A-Z]/.test(val), {
          message: 'Must contain at least one uppercase letter',
        })
        .refine((val) => /\d/.test(val), {
          message: 'Must contain at least one digit',
        }),
    ),
    new_password_confirmation: z.preprocess(stripWhitespace, z.string().min(8).max(32)),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: 'Passwords do not match',
    path: ['new_password_confirmation'],
  });

export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

export const kycVerificationSchema = z.object({
  type: z.literal('nin'),
  value: z
    .string()
    .regex(/^\d{11}$/, 'NIN must be exactly 11 digits'),
  mobileNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?\d{10,15}$/, 'Enter a valid phone number'),
  consent: z.literal(true, {
    error: 'You must consent to identity verification',
  }),
});

export type KycVerificationValues = z.infer<typeof kycVerificationSchema>;
