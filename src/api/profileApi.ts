import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../app/store";

interface ProfileResponse {
    data: {
        userId: string;
        status: string;
        provider: string;
        currency: string;
        email: string;
        role: string;
        profile: {
            firstName: string;
            lastName: string;
            profileImage: string;
            bio: string;
            gender: string;
            dob: string;
            address: string;
            city: string;
            state: string;
            country: string;
            averageRating: number;
            nin: string;
            bvn: string;
            kycStatus: string;
            // accountNumber: string;
            // accountName: string;
            // bankName: string;
            // bankCode: string;
        };
        wallets: Wallet[];
    };
}

interface Wallet {
    balance: string;
    createdAt: string;
    currency: string;
    id: string;
    pendingCash: string;
    updatedAt: string;
    userId: number;
}

interface ProfileData {
    userId: string;
    status: string;
    provider: string;
    currency: string;
    email: string;
    role: string;
    wallets: Wallet[];
    firstName?: string;
    lastName?: string;
    avatar?: string;
    phone?: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    profile_image: string | File;
    email?: string;
    phone?: string;
    currentPassword?: string;
    newPassword?: string;
}

export interface UpdateProfileResponse {
    data: ProfileData;
    message: string;
}

export const profileApi = createApi({
    reducerPath: "profileApi",
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState)?.root?.auth?.token; 
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Profile'],
    endpoints: (builder) => ({
        getProfile: builder.query<ProfileResponse, void>({
            query: () => "profile",
            providesTags: ['Profile']
        }),
        updateProfile: builder.mutation<UpdateProfileResponse, FormData>({
            query: (formData) => ({
                url: 'profile',
                method: 'PUT',
                body: formData,
                formData: true,
            }),
            invalidatesTags: ['Profile']
        }),
    }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = profileApi;
