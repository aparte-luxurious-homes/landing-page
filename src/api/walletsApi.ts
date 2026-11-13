import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from '../utils/url';


// Types ported from backend schemas
export interface Wallet {
    id: string;
    user_id: string;
    balance: string;
    pending_cash: string;
    currency: string;
    created_at: string;
    updated_at: string;
}

export interface AccountResolution {
    account_name: string;
    account_number: string;
    bank_code: string;
}

export interface PayoutAccount {
    id: string;
    user_id: string;
    wallet_id: string;
    account_name: string;
    account_number: string;
    bank_name: string;
    bank_code: string;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreatePayoutAccountRequest {
    wallet_id: string;
    account_name: string;
    account_number: string;
    bank_name: string;
    bank_code: string;
    bvn?: string;
}

export interface WithdrawRequest {
    wallet_id: string;
    user_id: string; // The user initiating withdrawal
    currency: string;
    amount: string;
    payout_id: string;
    description?: string;
    comment?: string;
}

interface CustomResponse<T> {
    message: string;
    data: T;
}

interface PublicBank {
    name: string;
    code: string;
}

export const walletsApi = createApi({
    reducerPath: 'walletsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_API_URL,
        prepareHeaders: (headers, { getState }) => {
            const state = getState() as any;
            const token = state.root?.auth?.token || state.auth?.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Wallet', 'PayoutAccount', 'Transaction'],
    endpoints: (builder) => ({
        getWalletDetails: builder.query<CustomResponse<Wallet>, string>({
            query: (walletId) => `/wallets/${walletId}`,
            providesTags: (_result, _error, arg) => [{ type: 'Wallet', id: arg }],
        }),
        getPayoutAccounts: builder.query<CustomResponse<{ items: PayoutAccount[]; total: number }>, string>({
            query: (walletId) => `/wallets/${walletId}/payout-accounts`,
            providesTags: (result, _error, walletId) =>
                result
                    ? [
                        ...result.data.items.map(({ id }) => ({ type: 'PayoutAccount' as const, id })),
                        { type: 'PayoutAccount', id: `LIST-${walletId}` },
                    ]
                    : [{ type: 'PayoutAccount', id: `LIST-${walletId}` }],
        }),
        createPayoutAccount: builder.mutation<CustomResponse<PayoutAccount>, CreatePayoutAccountRequest>({
            query: ({ wallet_id, ...data }) => ({
                url: `/wallets/${wallet_id}/payout-accounts`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (_result, _error, { wallet_id }) => [{ type: 'PayoutAccount', id: `LIST-${wallet_id}` }],
        }),
        verifyPayoutAccount: builder.mutation<CustomResponse<PayoutAccount>, { wallet_id: string; account_id: string }>({
            query: ({ wallet_id, account_id }) => ({
                url: `/wallets/${wallet_id}/payout-accounts/${account_id}/verify`,
                method: 'POST',
            }),
            invalidatesTags: (_result, _error, { account_id }) => [{ type: 'PayoutAccount', id: account_id }],
        }),
        withdrawFunds: builder.mutation<CustomResponse<any>, WithdrawRequest>({
            query: ({ wallet_id, ...data }) => ({
                url: `/wallets/${wallet_id}/withdraw`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (_result, _error, { wallet_id }) => [
                { type: 'Wallet', id: wallet_id },
                { type: 'Transaction', id: 'LIST' },
            ],
        }),
        // Fetch banks from our backend which uses the configured disbursement provider
        getNigerianBanks: builder.query<CustomResponse<PublicBank[]>, void>({
            query: () => `/wallets/banks`,
        }),
        resolveBankAccount: builder.query<CustomResponse<AccountResolution>, { account_number: string; bank_code: string; bvn?: string }>({
            query: ({ account_number, bank_code, bvn }) => ({
                url: `/wallets/resolve-account`,
                params: { account_number, bank_code, ...(bvn ? { bvn } : {}) },
            }),
        }),
    }),
});

export const {
    useGetWalletDetailsQuery,
    useGetPayoutAccountsQuery,
    useCreatePayoutAccountMutation,
    useVerifyPayoutAccountMutation,
    useWithdrawFundsMutation,
    useGetNigerianBanksQuery,
    useLazyResolveBankAccountQuery,
} = walletsApi;
