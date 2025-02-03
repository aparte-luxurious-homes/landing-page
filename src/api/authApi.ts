import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';

interface SignupResponse {
  message: string;
  data: {
    role: string;
    verificationToken: string;
    email: string;
    phone: string;
  };
}

interface SignupRequest {
  email?: string;
  phone?: string;
  password: string;
  role: string;
  fullName?: string; // Add fullName property
}

interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
  role: string;
}

interface LoginResponse {
  // message: string;
  user: {
    id: string;
    role: string;
    verificationToken: string | null;
    email: string;
    phone: string;
  };
  authorization: {
    type: string;
    token: string;
  };
}

interface VerifyOtpRequest {
  email?: string;
  phone?: string;
  otp: string;
}

interface VerifyOtpResponse {
  message: string;
  data: {
    user: {
      id: number;
      email: string | null;
      phone: string;
      role: string;
      isVerified: boolean;
      createdAt: string;
      updatedAt: string;
    };
    authorization: {
      type: string;
      name: string | null;
      token: string;
      abilities: string[];
      lastUsedAt: string | null;
      expiresAt: string | null;
    };
  };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).root.auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (credentials) => ({
        url: 'auth/signup',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { message, role } = {
            message: data.message,
            role: data.data.role,
          };
          // Use the message and role as needed
          console.log('Signup Success:', { message, role });
        } catch (error) {
          console.error('Signup failed:', error);
        }
      },
    }),

    resendSignupOtp: builder.mutation({
      query: (payload) => ({
        url: '/auth/otp/resend',
        method: 'POST',
        body: payload,
      }),
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('Login Success:', data);
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),

    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (credentials) => ({
        url: 'auth/otp/verify',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { message, user } = {
            message: data.message,
            user: data.data.user,
          };
          console.log('OTP Verification Success:', { message, user });
        } catch (error) {
          console.error('OTP Verification failed:', error);
        }
      },
    }),

    requestPasswordReset: builder.mutation({
      query: (payload) => ({
        url: '/auth/password/otp',
        method: 'POST',
        body: payload,
      }),
    }),

    resetPassword: builder.mutation({
      query: (payload) => ({
        url: '/auth/password/reset',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useResendSignupOtpMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
} = authApi;
