import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
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

    login: builder.mutation<LoginResponse, LoginRequest>({
        query: (credentials) => ({
          url: 'auth/login',
          method: 'POST',
          body: credentials,
        }),
        async onQueryStarted(_, { queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            toast.success(` Welcome back: ${data?.user?.profile?.firstName}`);
          } catch (err) {
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
            // const { message, user } = { 
            //   message: data.message, 
            //   user: data.data.user 
            // };
            toast.success(`Succesful Verification: ${data?.data?.user?.profile?.firstName || null}`);
          } catch (err) {
            const errorDetails = err as { status?: number; data?: { errors?: { message: string }[] } };
            const errorMessage = errorDetails?.data?.errors?.[0]?.message || "Verification failed!";
            toast.error(`${errorMessage}`);
          }
        },
      }),
  }),
});

export const { useSignupMutation, useLoginMutation,  useVerifyOtpMutation  } = authApi;
