'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useNavigate } from '@/lib/router';

import PageLayout from '../../components/pagelayout';
import { useAppSelector } from '../../hooks';
import {
  useGetMyKycDocumentsQuery,
  useGetProfileQuery,
  useSubmitAgentKycMutation,
  KycDocument,
  KycDocumentType,
  KycDocStatus,
} from '../../api/profileApi';
import {
  AgentApprovalStatus,
  getAgentApprovalStatus,
} from '../../utils/agentApproval';
import { redirectToAdminDashboard } from '../../utils/adminRedirect';
import { extractErrorMessage } from '../../utils/errorHandler';

const DOC_TYPE_OPTIONS: { value: KycDocumentType; label: string }[] = [
  { value: 'INTERNATIONAL_PASSPORT', label: 'International Passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
  { value: 'NIN', label: 'National Identity Number (NIN) slip' },
];

const STATUS_STYLES: Record<KycDocStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;
// Country is locked to Nigeria across listing and profile flows (CLAUDE.md note 23).
const COUNTRY = 'Nigeria';
const SUPPORT_EMAIL = 'sales@aparte.ng';

type FormState = {
  firstName: string;
  lastName: string;
  dob: string;
  documentType: KycDocumentType;
  address: string;
  city: string;
  state: string;
};
type FieldErrors = Partial<Record<keyof FormState | 'file', string>>;

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  dob: '',
  documentType: 'INTERNATIONAL_PASSPORT',
  address: '',
  city: '',
  state: '',
};

/** Latest date of birth that is 18 today, as YYYY-MM-DD. */
function latestAdultDob(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

function validateAgentKyc(form: FormState, file: File | null): FieldErrors {
  const errors: FieldErrors = {};
  const required: [keyof FormState, string][] = [
    ['firstName', 'First name is required'],
    ['lastName', 'Last name is required'],
    ['dob', 'Date of birth is required'],
    ['address', 'Address is required'],
    ['city', 'City / town is required'],
    ['state', 'State is required'],
  ];
  for (const [key, message] of required) {
    if (!String(form[key] ?? '').trim()) errors[key] = message;
  }
  if (form.dob && form.dob > latestAdultDob()) {
    errors.dob = 'You must be at least 18 years old';
  }
  if (!file) errors.file = 'Upload your identification document';
  return errors;
}

function StatusBadge({ status }: { status: KycDocStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function DocCard({ doc }: { doc: KycDocument }) {
  const isPdf = doc.document_url.toLowerCase().includes('.pdf');
  const label = DOC_TYPE_OPTIONS.find((o) => o.value === doc.document_type)?.label ?? doc.document_type;
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 flex gap-4 items-start">
      <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden">
        {isPdf ? (
          <Icon icon="mdi:file-pdf-box" className="text-red-500" width="36" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.document_url} alt="KYC document" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-zinc-900 truncate">{label}</p>
          <StatusBadge status={doc.status} />
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">
          Uploaded{' '}
          {new Date(doc.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <a
          href={doc.document_url}
          target="_blank"
          rel="noreferrer"
          className="inline-block text-xs font-semibold text-[#028090] hover:underline mt-2"
        >
          View document →
        </a>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError?: string) =>
  `w-full h-11 px-3 border rounded-lg bg-white text-sm outline-none focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090] ${
    hasError ? 'border-red-400' : 'border-zinc-300'
  }`;

export default function AgentKycPage() {
  const navigate = useNavigate();
  const auth = useAppSelector((s) => s.root.auth);
  const { data: profileResp, isLoading: profileLoading } = useGetProfileQuery(undefined, {
    skip: !auth.token,
  });
  const { data: kycResp, isLoading: kycLoading } = useGetMyKycDocumentsQuery(undefined, {
    skip: !auth.token,
  });
  const [submitKyc, { isLoading: submitting }] = useSubmitAgentKycMutation();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [editingPending, setEditingPending] = useState(false);
  const prefilled = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = profileResp?.data;
  const docs = kycResp?.data?.items ?? [];

  const approvalStatus = useMemo(() => {
    if (!profile) return null;
    return getAgentApprovalStatus(
      {
        role: profile.role,
        agentApprovalStatus: profile.agentApprovalStatus,
        profile: profile.profile,
        kycStatus: profile.profile?.kycStatus,
      },
      { hasKycDocuments: docs.length > 0 },
    );
  }, [profile, docs.length]);

  useEffect(() => {
    if (!auth.token || profileLoading) return;
    if (profile && profile.role !== 'AGENT') navigate('/');
  }, [auth.token, profile, profileLoading, navigate]);

  // Prefill once from whatever the agent already told us at signup.
  useEffect(() => {
    if (!profile || prefilled.current) return;
    prefilled.current = true;
    const p = profile.profile;
    setForm((f) => ({
      ...f,
      firstName: p?.firstName ?? '',
      lastName: p?.lastName ?? '',
      dob: p?.dob ?? '',
      address: p?.address ?? '',
      city: p?.city ?? '',
      state: p?.state ?? '',
    }));
  }, [profile]);

  const setField = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    if (!picked) return;
    if (!ALLOWED_MIME.includes(picked.type)) {
      setErrors((errs) => ({ ...errs, file: 'Unsupported file type. Use JPG, PNG, WEBP, or PDF.' }));
      event.target.value = '';
      return;
    }
    if (picked.size > MAX_FILE_BYTES) {
      setErrors((errs) => ({ ...errs, file: 'File too large. Max 10MB.' }));
      event.target.value = '';
      return;
    }
    setFile(picked);
    setErrors((errs) => ({ ...errs, file: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateAgentKyc(form, file);
    setErrors(found);
    if (Object.keys(found).length > 0 || !file) {
      toast.error('Please complete all required fields.');
      return;
    }
    try {
      await submitKyc({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dob: form.dob,
        documentType: form.documentType,
        file,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: COUNTRY,
      }).unwrap();
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setEditingPending(false);
      toast.success('KYC Submitted Successfully', { autoClose: 5000 });
    } catch (err) {
      const detail = (err as { data?: { detail?: { message?: string; missing_fields?: string[] } } })
        ?.data?.detail;
      toast.error(
        (typeof detail === 'object' && detail?.message) ||
          extractErrorMessage(err, 'Submission failed. Please try again.'),
      );
    }
  };

  const handleGoToDashboard = () => {
    if (!redirectToAdminDashboard()) {
      toast.error('Dashboard URL is not configured. Please try again later.');
    }
  };

  if (!auth.token) return null;

  const isLoading = profileLoading || kycLoading;
  const isActive = approvalStatus === AgentApprovalStatus.ACTIVE;
  const isPending = approvalStatus === AgentApprovalStatus.PENDING_APPROVAL;
  const isRejected = approvalStatus === AgentApprovalStatus.REJECTED;
  const rejectionReason =
    profile?.agentApprovalRejectionReason ||
    docs.find((d) => d.status === 'REJECTED' && d.rejection_reason)?.rejection_reason ||
    null;
  const showForm = !isLoading && !isActive && (!isPending || editingPending);

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#F7F8F8] pt-24 md:pt-32 pb-16 px-4">
        <div className="w-full max-w-5xl mx-auto">
          <div className="mt-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Agent KYC Verification</h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
              Your agent dashboard is activated once our admin team has reviewed your details and
              identification document.
            </p>
          </div>

          {isActive && (
            <div
              data-testid="kyc-approved"
              className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6"
            >
              <h2 className="text-base font-semibold text-emerald-900">Account approved</h2>
              <p className="text-sm text-emerald-800 mt-1">
                Your KYC has been approved. You now have full access to your agent dashboard.
              </p>
              <button
                type="button"
                onClick={handleGoToDashboard}
                className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#028090] text-white text-sm font-semibold hover:bg-[#026f7c] transition-colors"
              >
                Go to dashboard
              </button>
            </div>
          )}

          {isPending && (
            <div
              data-testid="kyc-pending"
              className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
            >
              <h2 className="text-base font-semibold text-amber-900">KYC Submitted Successfully</h2>
              <p className="text-sm text-amber-800 mt-1">
                Your KYC has been submitted and is currently pending verification. Kindly contact{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="underline font-semibold">
                  {SUPPORT_EMAIL}
                </a>{' '}
                for further enquiries regarding your verification status.
              </p>
              <p className="text-sm text-amber-800 mt-3">
                You will gain access to your agent dashboard once your account has been approved.
              </p>
              {!editingPending && (
                <button
                  type="button"
                  onClick={() => setEditingPending(true)}
                  className="mt-4 text-sm font-semibold text-amber-900 underline"
                >
                  Made a mistake? Update your submission
                </button>
              )}
            </div>
          )}

          {isRejected && (
            <div
              data-testid="kyc-rejected"
              className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6"
            >
              <h2 className="text-base font-semibold text-red-900">KYC Verification Unsuccessful</h2>
              <p className="text-sm text-red-800 mt-1">
                Your KYC verification could not be approved at this time.
              </p>
              {rejectionReason && (
                <p className="text-sm text-red-800 mt-2">
                  <span className="font-semibold">Reason:</span> {rejectionReason}
                </p>
              )}
              <p className="text-sm text-red-800 mt-3">
                Correct your information and resubmit your KYC below. For further enquiries, contact{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="underline font-semibold">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center py-10 text-sm text-zinc-500">Loading…</div>
          )}

          {showForm && (
            <form
              data-testid="agent-kyc-form"
              onSubmit={handleSubmit}
              noValidate
              className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 sm:p-6 mb-8 space-y-8"
            >
              <fieldset disabled={submitting} className="space-y-4">
                <legend className="text-base font-semibold text-zinc-900 mb-4">
                  Personal information
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="First name" htmlFor="kyc-first-name" error={errors.firstName}>
                    <input
                      id="kyc-first-name"
                      className={inputClass(errors.firstName)}
                      value={form.firstName}
                      onChange={setField('firstName')}
                      autoComplete="given-name"
                    />
                  </Field>
                  <Field label="Last name" htmlFor="kyc-last-name" error={errors.lastName}>
                    <input
                      id="kyc-last-name"
                      className={inputClass(errors.lastName)}
                      value={form.lastName}
                      onChange={setField('lastName')}
                      autoComplete="family-name"
                    />
                  </Field>
                  <Field label="Date of birth" htmlFor="kyc-dob" error={errors.dob}>
                    <input
                      id="kyc-dob"
                      type="date"
                      max={latestAdultDob()}
                      className={inputClass(errors.dob)}
                      value={form.dob}
                      onChange={setField('dob')}
                    />
                  </Field>
                </div>
              </fieldset>

              <fieldset disabled={submitting} className="space-y-4">
                <legend className="text-base font-semibold text-zinc-900 mb-4">Identification</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Document type" htmlFor="kyc-doc-type">
                    <select
                      id="kyc-doc-type"
                      className={inputClass()}
                      value={form.documentType}
                      onChange={setField('documentType')}
                    >
                      {DOC_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="Document (JPG / PNG / WEBP / PDF, max 10MB)"
                    htmlFor="agent-kyc-file-input"
                    error={errors.file}
                  >
                    <input
                      ref={fileInputRef}
                      id="agent-kyc-file-input"
                      type="file"
                      className="sr-only"
                      accept={ALLOWED_MIME.join(',')}
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="agent-kyc-file-input"
                      className={`flex items-center justify-center gap-2 h-11 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-sm font-medium ${
                        file
                          ? 'border-[#028090]/60 bg-[#028090]/5 text-[#028090]'
                          : errors.file
                            ? 'border-red-400 text-red-600'
                            : 'border-zinc-300 text-zinc-600 hover:border-[#028090] hover:text-[#028090]'
                      }`}
                    >
                      <HiOutlineCloudUpload className="text-lg" />
                      <span className="truncate max-w-[240px]">{file ? file.name : 'Choose a file'}</span>
                    </label>
                  </Field>
                </div>
              </fieldset>

              <fieldset disabled={submitting} className="space-y-4">
                <legend className="text-base font-semibold text-zinc-900 mb-4">Address</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Field label="Address" htmlFor="kyc-address" error={errors.address}>
                      <input
                        id="kyc-address"
                        className={inputClass(errors.address)}
                        value={form.address}
                        onChange={setField('address')}
                        autoComplete="street-address"
                      />
                    </Field>
                  </div>
                  <Field label="City / Town" htmlFor="kyc-city" error={errors.city}>
                    <input
                      id="kyc-city"
                      className={inputClass(errors.city)}
                      value={form.city}
                      onChange={setField('city')}
                      autoComplete="address-level2"
                    />
                  </Field>
                  <Field label="State / Region" htmlFor="kyc-state" error={errors.state}>
                    <input
                      id="kyc-state"
                      className={inputClass(errors.state)}
                      value={form.state}
                      onChange={setField('state')}
                      autoComplete="address-level1"
                    />
                  </Field>
                  <Field label="Country" htmlFor="kyc-country">
                    <input
                      id="kyc-country"
                      className={`${inputClass()} bg-zinc-50 text-zinc-500`}
                      value={COUNTRY}
                      readOnly
                    />
                  </Field>
                </div>
              </fieldset>

              <div className="flex flex-wrap justify-end gap-3">
                {editingPending && (
                  <button
                    type="button"
                    onClick={() => setEditingPending(false)}
                    className="h-10 px-5 rounded-lg border border-zinc-300 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#028090] text-white text-sm font-semibold hover:bg-[#026f7c] transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
                >
                  <Icon
                    icon={submitting ? 'mdi:loading' : 'mdi:send'}
                    className={submitting ? 'animate-spin' : ''}
                  />
                  {submitting ? 'Submitting…' : 'Submit KYC for review'}
                </button>
              </div>
            </form>
          )}

          {!isLoading && docs.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-zinc-900 mb-3">
                Your submissions ({docs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docs.map((doc) => (
                  <DocCard key={doc.id} doc={doc} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
