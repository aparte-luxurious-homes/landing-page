import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../app/store";
import { BASE_API_URL } from '../utils/url';

interface ProfileResponse {
    data: {
        userId: string;
        status?: string;
        provider?: string;
        currency?: string;
        email: string;
        phone: string;
        role: string;
        isVerified: boolean;
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
            phone?: string;
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
    gender?: string;
    dob?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    nin?: string;
    bvn?: string;
    currentPassword?: string;
    newPassword?: string;
}

export interface UpdateProfileResponse {
    data: ProfileData;
    message: string;
}

export interface PatchProfileRequest {
    first_name?: string;
    last_name?: string;
    bio?: string;
    address?: string;
    city?: string;
    dob?: number | string;
    state?: string;
    country?: string;
    phone?: number | string;
    bvn?: string;
    nin?: string;
    gender?: number;
    email?: string;
}

interface PatchProfileResponse {
    success: boolean;
    message: string;
    updatedProfile: PatchProfileRequest;
}

export const profileApi = createApi({
    reducerPath: "profileApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_API_URL,
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
        verifyIdentity: builder.mutation<UpdateProfileResponse, any>({
            query: (payload) => ({
                url: 'profile/verify-identity',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Profile']
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
        patchProfile: builder.mutation<PatchProfileResponse, Partial<PatchProfileRequest>>({
            query: (data) => ({
                url: 'profile',
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Profile']
        }),
    }),
});

export const { 
    useGetProfileQuery, 
    useUpdateProfileMutation, 
    usePatchProfileMutation,
    useVerifyIdentityMutation 
} = profileApi;
