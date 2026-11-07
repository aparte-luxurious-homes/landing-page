import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../app/store";
import { BASE_API_URL } from '../utils/url';
import type { EmailHealthFields } from '../lib/email-health';

export interface ProfileResponse {
    /**
     * Email-health fields (email_status, email_bounced_at, email_bounce_reason,
     * email_suggestion, pending_email) come from EmailHealthFields; read them
     * through readEmailHealth() rather than directly.
     */
    data: EmailHealthFields & {
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
        /** Agent approval gate. null for non-agents; ACTIVE for approved/legacy agents. */
        agentApprovalStatus?: AgentApprovalStatusValue | null;
        agentApprovalRejectionReason?: string | null;
        agentKycSubmittedAt?: string | null;
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
    // No `email`: PUT /profile refuses a different address (400). Email
    // changes go through requestEmailChange / confirmEmailChange, which prove
    // the new address receives mail.
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

export type AgentApprovalStatusValue =
    | "KYC_PENDING"
    | "PENDING_APPROVAL"
    | "ACTIVE"
    | "REJECTED";

/** POST /profile/agent-kyc — every field is required by the API. */
export interface AgentKycSubmission {
    firstName: string;
    lastName: string;
    dob: string; // YYYY-MM-DD
    documentType: KycDocumentType;
    file: File;
    address: string;
    city: string;
    state: string;
    country: string;
}

export interface AgentKycSubmissionResponse {
    message: string;
    data: {
        title: string;
        detail: string;
        agentApprovalStatus: AgentApprovalStatusValue | null;
        agentApprovalRejectionReason: string | null;
        agentKycSubmittedAt: string | null;
        document: KycDocument;
    };
}

/** POST /profile/email/change — a 6-digit code is on its way to the new address. */
export interface EmailChangeStarted {
    pendingEmail: string;
    expiresAt: string | null;
    /** Seconds until another code may be requested. */
    resendAfterSeconds: number;
}

/** POST /profile/email/confirm — the account now uses the new address. */
export interface EmailChangeConfirmed {
    email: string;
    /** Emails that had failed to reach the old address and were sent again. */
    resent: number;
}

const DEFAULT_RESEND_AFTER_SECONDS = 60;

type Loose = Record<string, unknown>;

/** The API may wrap the body in {message, data} and may camelCase it. */
function unwrap(response: unknown): Loose {
    const r = (response ?? {}) as Loose;
    return r.data && typeof r.data === 'object' ? (r.data as Loose) : r;
}

function pick(obj: Loose, snake: string, camel: string): unknown {
    return obj[snake] ?? obj[camel];
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
        submitAgentKyc: builder.mutation<AgentKycSubmissionResponse, AgentKycSubmission>({
            query: (s) => {
                const form = new FormData();
                form.append("first_name", s.firstName);
                form.append("last_name", s.lastName);
                form.append("dob", s.dob);
                form.append("document_type", s.documentType);
                form.append("file", s.file);
                form.append("address", s.address);
                form.append("city", s.city);
                form.append("state", s.state);
                form.append("country", s.country);
                return {
                    url: "profile/agent-kyc",
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
        requestEmailChange: builder.mutation<EmailChangeStarted, { email: string }>({
            query: ({ email }) => ({
                url: 'profile/email/change',
                method: 'POST',
                body: { email },
            }),
            transformResponse: (response: unknown, _meta, arg): EmailChangeStarted => {
                const d = unwrap(response);
                const after = Number(pick(d, 'resend_after_seconds', 'resendAfterSeconds'));
                return {
                    pendingEmail: String(pick(d, 'pending_email', 'pendingEmail') ?? arg.email),
                    expiresAt: (pick(d, 'expires_at', 'expiresAt') as string | null) ?? null,
                    resendAfterSeconds: Number.isFinite(after) && after >= 0 ? after : DEFAULT_RESEND_AFTER_SECONDS,
                };
            },
            // GET /profile now carries pending_email.
            invalidatesTags: ['Profile'],
        }),
        confirmEmailChange: builder.mutation<EmailChangeConfirmed, { code: string }>({
            query: ({ code }) => ({
                url: 'profile/email/confirm',
                method: 'POST',
                body: { code },
            }),
            transformResponse: (response: unknown): EmailChangeConfirmed => {
                const d = unwrap(response);
                const resent = Number(d.resent);
                return { email: String(d.email ?? ''), resent: Number.isFinite(resent) ? resent : 0 };
            },
            // Also on failure: running out of tries clears the pending change.
            invalidatesTags: () => ['Profile'],
        }),
        cancelEmailChange: builder.mutation<void, void>({
            query: () => ({ url: 'profile/email/change', method: 'DELETE' }),
            invalidatesTags: ['Profile'],
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
    useSubmitAgentKycMutation,
    useUpdateProfileMutation,
    usePatchProfileMutation,
    useVerifyIdentityMutation,
    useChangePasswordMutation,
    useRequestEmailChangeMutation,
    useConfirmEmailChangeMutation,
    useCancelEmailChangeMutation,
} = profileApi;
