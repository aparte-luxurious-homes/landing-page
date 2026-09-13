import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../app/store";
import { BASE_API_URL } from '../utils/url';

export interface ProfileResponse {
    data: {
        userId: string;
        email: string;
        phone: string;
        role: string;
        isVerified: boolean;
        referralCode?: string | null;
        referralLink?: string | null;
        hasReferrer?: boolean;
        /** When true, show account reminder to add bank details for caution fee refunds */
        shouldShowPayoutNudge?: boolean;
        /** Server-side profile-completeness flag (HOST_REQUIRED_PROFILE_FIELDS set). */
        isProfileComplete?: boolean;
        is_profile_complete?: boolean;
        missingProfileFields?: string[];
        missing_profile_fields?: string[];
        createdAt?: string;
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
    userId: string;
}

export interface PatchProfileRequest {
    first_name?: string;
    last_name?: string;
    bio?: string;
    address?: string;
    city?: string;
    dob?: string;
    state?: string;
    country?: string;
    phone?: string;
    gender?: string;
    email?: string;
}

interface PatchProfileResponse {
    message: string;
    data: Record<string, unknown>;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export type KycDocumentType =
    | "INTERNATIONAL_PASSPORT"
    | "NIN"
    | "DRIVERS_LICENSE";

export type KycDocStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface KycDocument {
    id: string;
    user_id: string;
    document_type: KycDocumentType;
    document_url: string;
    status: KycDocStatus;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface KycDocumentsList {
    profile_kyc_status: KycDocStatus | null;
    items: KycDocument[];
}

export interface KycDocumentsResponse {
    data: KycDocumentsList;
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
    tagTypes: ['Profile', 'KycDocuments'],
    endpoints: (builder) => ({
        getProfile: builder.query<ProfileResponse, void>({
            query: () => "profile",
            providesTags: ['Profile']
        }),
        getMyKycDocuments: builder.query<KycDocumentsResponse, void>({
            query: () => "profile/kyc/documents",
            transformResponse: (response: { data?: KycDocumentsList } | KycDocumentsList) => {
                const data = (response as { data?: KycDocumentsList })?.data ?? (response as KycDocumentsList);
                return { data };
            },
            providesTags: ['KycDocuments'],
        }),
        uploadMyKycDocument: builder.mutation<
            { data: KycDocument },
            { file: File; documentType: KycDocumentType }
        >({
            query: ({ file, documentType }) => {
                const form = new FormData();
                form.append("file", file);
                form.append("document_type", documentType);
                return {
                    url: "profile/kyc/documents",
                    method: "POST",
                    body: form,
                    formData: true,
                };
            },
            invalidatesTags: ['KycDocuments', 'Profile'],
        }),
        verifyIdentity: builder.mutation<{ message: string; data: Record<string, unknown> }, any>({
            query: (payload) => ({
                url: 'profile/verify-identity',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Profile']
        }),
        updateProfile: builder.mutation<{ message: string; data: Record<string, unknown> }, FormData>({
            query: (formData) => ({
                url: 'profile',
                method: 'PUT',
                body: formData,
                formData: true,
            }),
            invalidatesTags: ['Profile']
        }),
        patchProfile: builder.mutation<PatchProfileResponse, Partial<PatchProfileRequest>>({
            query: (data) => {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        formData.append(key, String(value));
                    }
                });
                return {
                    url: 'profile',
                    method: 'PUT',
                    body: formData,
                    formData: true,
                };
            },
            invalidatesTags: ['Profile']
        }),
        changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
            query: (payload) => ({
                url: 'profile/password',
                method: 'PUT',
                body: payload,
            }),
        }),
    }),
});

export const {
    useGetProfileQuery,
    useGetMyKycDocumentsQuery,
    useUploadMyKycDocumentMutation,
    useUpdateProfileMutation,
    usePatchProfileMutation,
    useVerifyIdentityMutation,
    useChangePasswordMutation,
} = profileApi;
