'use client';

import React from 'react';
import { useSearchParams } from '@/lib/router';
import { useVerifyCredentialQuery } from '../api/verifyApi';

/** Format an ISO date (YYYY-MM-DD) as "09 Oct 2026" without timezone drift. */
const formatValidThrough = (iso: string): string => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return iso;
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`;
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-5 py-10">
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <span className="text-2xl font-bold tracking-tight text-gray-900">Aparte</span>
        <span className="ml-2 text-sm font-medium text-gray-400">Verify</span>
      </div>
      {children}
      <p className="mt-8 text-center text-xs text-gray-400">
        Authorisation is confirmed live by Aparte. A card alone is not proof.
      </p>
    </div>
  </div>
);

const Badge: React.FC<{ valid: boolean }> = ({ valid }) => (
  <div
    className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${
      valid ? 'bg-teal-100' : 'bg-red-100'
    }`}
  >
    {valid ? (
      <svg className="h-9 w-9 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="h-9 w-9 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    )}
  </div>
);

const VerifyAgent: React.FC = () => {
  const [params] = useSearchParams();
  const rawId = (params.get('id') || '').trim();

  const { data, error, isLoading, isFetching } = useVerifyCredentialQuery(rawId, {
    skip: !rawId,
  });

  // No code supplied at all.
  if (!rawId) {
    return (
      <Shell>
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <Badge valid={false} />
          <h1 className="text-lg font-semibold text-gray-900">No credential code</h1>
          <p className="mt-2 text-sm text-gray-500">
            Scan the QR code on an Aparte agent card to verify it.
          </p>
        </div>
      </Shell>
    );
  }

  if (isLoading || isFetching) {
    return (
      <Shell>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />
          <p className="text-sm text-gray-500">Verifying {rawId}…</p>
        </div>
      </Shell>
    );
  }

  // Unknown code (404) or any network error → single red verdict.
  if (error || !data) {
    return (
      <Shell>
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <Badge valid={false} />
          <h1 className="text-xl font-bold text-red-700">Credential not found</h1>
          <p className="mt-2 text-sm text-gray-500">
            No agent is registered under{' '}
            <span className="font-mono text-gray-700">{rawId}</span>.
          </p>
        </div>
      </Shell>
    );
  }

  // Found but NOT authorised (SUSPENDED / REVOKED / EXPIRED / PENDING).
  // Deliberately NOT an ID card: a rejection must never resemble a valid pass.
  // The holder name + code are shown small and muted, framed as *claimed*, so
  // the scanner can report the card without it reading as an endorsement.
  if (!data.is_valid) {
    return (
      <Shell>
        <div className="rounded-2xl border-2 border-red-300 bg-white p-8 text-center shadow-sm">
          <Badge valid={false} />
          <h1 className="text-2xl font-bold text-red-700">{data.message}</h1>
          <p className="mt-3 text-sm text-gray-600">
            This card is <span className="font-semibold">not valid</span>. Do not
            treat this person as an authorised Aparte agent, and do not make any
            payment to them.
          </p>
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-left">
            <p className="text-xs uppercase tracking-wide text-red-400">
              Card presented as
            </p>
            <p className="text-sm font-medium text-gray-700">{data.holder_name}</p>
            <p className="font-mono text-xs text-gray-500">{data.agent_code}</p>
          </div>
        </div>
      </Shell>
    );
  }

  // Authorised — the only screen that presents the full ID.
  return (
    <Shell>
      <div className="rounded-2xl border border-teal-200 bg-white p-8 text-center shadow-sm">
        <Badge valid={true} />
        <h1 className="text-xl font-bold text-teal-700">Authorised agent</h1>

        <div className="mt-6 space-y-3 text-left">
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs uppercase tracking-wide text-gray-400">Name</p>
            <p className="text-base font-medium text-gray-900">{data.holder_name}</p>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs uppercase tracking-wide text-gray-400">Zone</p>
            <p className="text-base font-medium text-gray-900">{data.zone}</p>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs uppercase tracking-wide text-gray-400">Credential</p>
            <p className="font-mono text-base font-medium text-gray-900">{data.agent_code}</p>
          </div>
          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs uppercase tracking-wide text-gray-400">Validity</p>
            <p className="text-base font-medium text-gray-900">
              Valid through {formatValidThrough(data.valid_through)}
            </p>
          </div>
        </div>
      </div>
    </Shell>
  );
};

export default VerifyAgent;
