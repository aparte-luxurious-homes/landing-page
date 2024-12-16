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
  }


  interface LoginRequest {
    email?: string;
    phone?: string;
    password: string;
    role: string;
  }

  interface LoginResponse {
    message: string;
    data: {
      role: string;
      verificationToken: string;
      email: string;
      phone: string;
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
      const token = (getState() as RootState).auth.token;
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
            role: data.data.role 
          };
          // Use the message and role as needed
          console.log('Signup Success:', { message, role });
        } catch (error) {
          console.error('Signup failed:', error);
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
            const { message, role } = { 
              message: data.message, 
              role: data.data.role 
            };
            console.log('Login Success:', { message, role});
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
              user: data.data.user 
            };
            console.log('OTP Verification Success:', { message, user });
          } catch (error) {
            console.error('OTP Verification failed:', error);
          }
        },
      }),
  }),
});

export const { useSignupMutation, useLoginMutation,  useVerifyOtpMutation  } = authApi;
