import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AppDispatch, RootState } from '../app/store';
import { setToken } from '../features/auth/authSlice';

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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
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
  }),
});

export const { useSignupMutation } = authApi;
