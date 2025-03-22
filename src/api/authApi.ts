import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { redirectToAdminDashboard } from '~/utils/adminRedirect';
import { RootState } from '../app/store';
import { toast } from "react-toastify";

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
      profile: {
        firstName: string;
      };
    };
    authorization:{
      type: string;
      token: string;
    }
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
        profile: {
          firstName: string;
        }
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
  
  
 
interface ResetPasswordRequest {
  email?: string;
  phone?: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

interface ResetPasswordResponse {
  message: string;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).root.auth.token;
      if (token) {
        localStorage.setItem("aparte-auth", token)
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
          toast.success(`Signup successful! Welcome to Aparte, ${data?.data?.role}`);
        } catch (err) {
          const errorDetails = err as { status?: number; data?: { errors?: { message: string }[] } };
          const errorMessage = errorDetails?.data?.errors?.[0]?.message || "Sign Up failed!";
          toast.error(`${errorMessage}`);
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
            if (data?.user?.role === "AGENT" || data?.user?.role === "OWNER") {
              toast.success('Account verified! Redirecting to your dashboard...');
              redirectToAdminDashboard();
            } else {
              toast.success(` Welcome back: ${data?.user?.profile?.firstName}`);
            }
          } catch (err) {
            console.log("Error", err);
            const errorDetails = err as { status?: number; data?: { errors?: { message: string }[] } };
            const errorMessage = errorDetails?.data?.errors?.[0]?.message || "Login failed!";
            toast.error(`${errorMessage}`);
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

    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (payload) => ({
        url: '/auth/password/reset',
        method: 'POST',
        body: payload,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          toast.success(data.message || 'Password reset successful');
        } catch (err) {
          const errorDetails = err as { status?: number; data?: { errors?: { message: string }[] } };
          const errorMessage = errorDetails?.data?.errors?.[0]?.message || "Password reset failed!";
          toast.error(`${errorMessage}`);
        }
      },
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
