import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { redirectToAdminDashboard } from '~/utils/adminRedirect';
import { isAgentDashboardAllowed } from '~/utils/agentApproval';
import { AGENT_KYC_PATH } from '~/utils/agentAuthRedirect';
import { RootState } from '../app/store';
import { toast } from "react-toastify";
import { extractErrorMessage } from '../utils/errorHandler';
import { isHandledAuthGateError } from '../utils/phoneVerification';
import type { EmailHealthFields } from '../lib/email-health';

// ==================== Types ====================

interface User extends EmailHealthFields {
  id: string | number;
  email: string | null;
  phone: string;
  role: string;
  isVerified?: boolean;
  emailVerified?: boolean;
  /** True only once the number has been confirmed by SMS. */
  phoneVerified?: boolean;
  phoneVerifiedAt?: string | null;
  /** Agent approval gate — see utils/agentApproval.ts. */
  agentApprovalStatus?: string | null;
  agentApprovalRejectionReason?: string | null;
  verificationToken?: string | null;
  createdAt?: string;
  updatedAt?: string;
  profile?: {
    firstName: string;
    lastName?: string;
    [key: string]: any;
  };
}

interface Authorization {
  type: string;
  token: string;
  name?: string | null;
  abilities?: string[];
  lastUsedAt?: string | null;
  expiresAt?: string | null;
}

// Signup Types
// Backend SignupSchema now requires BOTH email AND phone (dual-OTP flow),
// but the email-only and phone-only entry forms let the user fill one first
// and collect the other on the next step. Keeping the fields optional here
// lets those partial submissions compile; the backend still validates.
export interface SignupRequest {
  email?: string;
  phone?: string;
  password: string;
  role: string;
  name?: string;       // first name (backend SignupSchema field)
  last_name?: string;  // backend SignupSchema field
  referral_code?: string;
}

export interface SignupResponse {
  message: string;
  data: {
    role: string;
    id: string;
    verificationToken: string;
    email: string;
    phone: string;
    requiresOTP?: boolean;
  };
}

// Login Types
export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
  role?: string; // Optional for login
}

export interface LoginResponse {
  message: string;
  data: {
    user: User;
    authorization: Authorization;
  };
  requiresOTP?: boolean;
}

// OTP Verification Types
export interface VerifyOtpRequest {
  email?: string;
  phone?: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  data: {
    user: User;
    authorization: Authorization;
  };
}

// Resend OTP Types
export interface ResendOtpRequest {
  email?: string;
  phone?: string;
}

export interface ResendOtpResponse {
  message: string;
  data?: {
    verificationToken?: string;
    expiresIn?: number;
    detail?: string; // For error details like "User not found"
  };
  detail?: string; // For error details like "User not found"
}

// Password Reset Types
export interface RequestPasswordResetRequest {
  email?: string;
  phone?: string;
}

export interface ResetPasswordRequest {
  email?: string;
  phone?: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  message: string;
  data?: any;
}

// Phone Verification Types (phone-verification gate)
//
// `challenge` is the short-lived token from a PHONE_VERIFICATION_REQUIRED 401
// (see utils/phoneVerification.ts). With a challenge, `phone` on request-otp
// SETS or CHANGES the number being verified. The challenge-less `{phone}` /
// `{phone, otp}` bodies are legacy; new code always sends the challenge.
export interface RequestPhoneOtpRequest {
  challenge?: string;
  phone?: string;
}

export interface RequestPhoneOtpResponse {
  message?: string;
  data?: {
    phone?: string;
    phoneMasked?: string;
    resendAfterSeconds?: number;
    otp?: string; // present only when backend DEBUG=true
  };
}

export interface VerifyPhoneOtpRequest {
  challenge?: string;
  phone?: string;
  otp: string;
}

export interface VerifyPhoneOtpResponse {
  message: string;
  data: {
    user: User;
    authorization: Authorization;
  };
}

// Google Auth Types
export interface GoogleAuthRequest {
  token: string;
  role?: string;
}

// API Definition

import { BASE_API_URL } from '../utils/url';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).root?.auth?.token;
      if (token) {
        localStorage.setItem("aparte-auth", token);
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // SIGNUP
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (credentials) => ({
        url: 'auth/signup',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.data?.verificationToken) {
            toast.success(`Verification code sent to your ${data.data.email ? 'email' : 'phone'}!`);
          }
        } catch (err) {
          const errorMessage = extractErrorMessage(err, "Sign up failed!");
          toast.error(errorMessage);
        }
      },
    }),

    // LOGIN
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.requiresOTP) {
            toast.info('Please verify your account with the OTP sent');
          } else {
            const user = data?.data?.user;
            const firstName = user?.profile?.firstName;
            
            if (user?.role === "AGENT") {
              if (isAgentDashboardAllowed(user)) {
                toast.success('Account verified! Redirecting to your dashboard...');
                redirectToAdminDashboard();
              } else {
                toast.success('Complete KYC verification to activate your agent account.');
                if (typeof window !== 'undefined') {
                  window.location.assign(AGENT_KYC_PATH);
                }
              }
            } else if (user?.role === "OWNER") {
              toast.success('Account verified! Redirecting to your dashboard...');
              redirectToAdminDashboard();
            } else {
              toast.success(`Welcome back${firstName ? `, ${firstName}` : ''}!`);
            }
          }
        } catch (err) {
          // Phone / email verification gates get a dedicated screen from the
          // caller, not a generic error toast.
          if (!isHandledAuthGateError(err)) {
            const errorMessage = extractErrorMessage(err, "Login failed!");
            toast.error(errorMessage);
          }
        }
      },
    }),

    // VERIFY OTP
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (credentials) => ({
        url: 'auth/otp/verify',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success('OTP verified successfully!');
          // console.log('OTP Verification Success:', { 
          //   message: data.message,
          //   user: data.data.user 
          // });
        } catch (err) {
          // Email confirmed, phone still to do: the caller opens the phone step.
          if (!isHandledAuthGateError(err)) {
            const errorMessage = extractErrorMessage(err, "OTP verification failed!");
            toast.error(errorMessage);
          }
        }
      },
    }),

    // RESEND OTP
    resendSignupOtp: builder.mutation<ResendOtpResponse, ResendOtpRequest>({
      query: (payload) => ({
        url: 'auth/otp/resend',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message || 'OTP resent successfully!');
        } catch (err) {
          const errorMessage = extractErrorMessage(err, "Failed to resend OTP");
          toast.error(errorMessage);
        }
      },
    }),

    // REQUEST PASSWORD RESET OTP
    requestPasswordReset: builder.mutation<ResendOtpResponse, RequestPasswordResetRequest>({
      query: (payload) => ({
        url: 'auth/password/otp',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message || 'Password reset OTP sent!');
        } catch (err) {
          const errorMessage = extractErrorMessage(err, "Failed to request password reset");
          toast.error(errorMessage);
        }
      },
    }),

    // For RESET PASSWORD
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (payload) => ({
        url: 'auth/password/reset',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message || 'Password reset successful!');
        } catch (err) {
          const errorMessage = extractErrorMessage(err, "Password reset failed!");
          toast.error(errorMessage);
        }
      },
    }),

    // REQUEST PHONE OTP (phone-verification gate). No toasts here: the
    // phone step reads the structured errors (cooldown, limit, SMS not
    // delivered, number taken, challenge expired) and reacts to each.
    requestPhoneOtp: builder.mutation<RequestPhoneOtpResponse, RequestPhoneOtpRequest>({
      query: (payload) => ({
        url: 'auth/phone/request-otp',
        method: 'POST',
        body: payload,
      }),
    }),

    // VERIFY PHONE OTP (returns a full session, same shape as login)
    verifyPhoneOtp: builder.mutation<VerifyPhoneOtpResponse, VerifyPhoneOtpRequest>({
      query: (payload) => ({
        url: 'auth/phone/verify',
        method: 'POST',
        body: payload,
      }),
    }),

    // GOOGLE AUTH
    googleAuth: builder.mutation<LoginResponse, GoogleAuthRequest>({
      query: (payload) => ({
        url: 'auth/google',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const firstName = data?.data?.user?.profile?.firstName;
          toast.success(`Welcome${firstName ? `, ${firstName}` : ''}!`);
        } catch (err) {
          if (!isHandledAuthGateError(err)) {
            const errorMessage = extractErrorMessage(err, "Google authentication failed!");
            toast.error(errorMessage);
          }
        }
      },
    }),
  }),
  tagTypes: ['User'],
});


export const {
  useSignupMutation,
  useResendSignupOtpMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useRequestPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useGoogleAuthMutation,
} = authApi;