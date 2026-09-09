'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { HiOutlineCloudUpload } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { useNavigate } from '@/lib/router';

import PageLayout from '../../components/pagelayout';
import { useAppSelector } from '../../hooks';
import {
  useGetMyKycDocumentsQuery,
  useGetProfileQuery,
  useUploadMyKycDocumentMutation,
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

const DOC_TYPE_OPTIONS: { value: KycDocumentType; label: string; group: string }[] = [
  { value: 'INTERNATIONAL_PASSPORT', label: 'International Passport', group: 'Identity' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License", group: 'Identity' },
  { value: 'NIN', label: 'National Identity Number', group: 'Identity' },
];

const STATUS_STYLES: Record<KycDocStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const ALLOWED_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

function StatusBadge({ status }: { status: KycDocStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

function DocTypeLabel({ type }: { type: KycDocumentType }) {
  const found = DOC_TYPE_OPTIONS.find((o) => o.value === type);
  return <>{found ? found.label : type}</>;
}

function DocCard({ doc }: { doc: KycDocument }) {
  const isPdf = doc.document_url.toLowerCase().includes('.pdf');
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-4 flex gap-4 items-start">
      <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden">
        {isPdf ? (
          <Icon icon="mdi:file-pdf-box" className="text-red-500" width="36" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={doc.document_url}
            alt="KYC document"
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-zinc-900 truncate">
            <DocTypeLabel type={doc.document_type} />
          </p>
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
        {doc.status === 'REJECTED' && doc.rejection_reason && (
          <p className="text-xs text-red-600 mt-2 bg-red-50 border border-red-100 rounded-md px-2 py-1.5">
            <span className="font-semibold">Reason:</span> {doc.rejection_reason}
          </p>
        )}
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

export default function AgentKycPage() {
  const navigate = useNavigate();
  const auth = useAppSelector((s) => s.root.auth);
  const { data: profileResp, isLoading: profileLoading } = useGetProfileQuery(undefined, {
    skip: !auth.token,
  });
  const { data: kycResp, isLoading: kycLoading } = useGetMyKycDocumentsQuery(undefined, {
    skip: !auth.token,
  });
  const [upload, { isLoading: uploading }] = useUploadMyKycDocumentMutation();

  const [docType, setDocType] = useState<KycDocumentType>('INTERNATIONAL_PASSPORT');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = profileResp?.data;
  const docs = kycResp?.data?.items ?? [];
  const profileStatus = kycResp?.data?.profile_kyc_status ?? profile?.profile?.kycStatus ?? null;

  const approvalStatus = useMemo(() => {
    if (!profile) return null;
    return getAgentApprovalStatus(
      {
        role: profile.role,
        profile: profile.profile,
        kycStatus: profile.profile?.kycStatus,
      },
      { hasKycDocuments: docs.length > 0 },
    );
  }, [profile, docs.length]);

  useEffect(() => {
    if (!auth.token) return;
    if (profileLoading) return;
    if (profile && profile.role !== 'AGENT') {
      navigate('/');
    }
  }, [auth.token, profile, profileLoading, navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error('Unsupported file type. Use JPG, PNG, WEBP, or PDF.');
      event.target.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Max 10MB.');
      event.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Pick a file first.');
      return;
    }
    try {
      await upload({ file: selectedFile, documentType: docType }).unwrap();
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setJustSubmitted(true);
      toast.success(
        'KYC Submitted Successfully. Your KYC has been submitted and is currently pending verification. Kindly contact sales@aparte.ng for further enquiries regarding your verification status.',
        { autoClose: 8000 },
      );
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Upload failed.'));
    }
  };

  const handleGoToDashboard = () => {
    if (!redirectToAdminDashboard()) {
      toast.error('Dashboard URL is not configured. Please try again later.');
    }
  };

  if (!auth.token) {
    return null;
  }

  const isLoading = profileLoading || kycLoading;
  const isActive = approvalStatus === AgentApprovalStatus.ACTIVE;
  const isPending =
    approvalStatus === AgentApprovalStatus.PENDING_APPROVAL || justSubmitted;
  const isRejected = approvalStatus === AgentApprovalStatus.REJECTED;
  const rejectedReason =
    docs.find((d) => d.status === 'REJECTED' && d.rejection_reason)?.rejection_reason ||
    null;

  if(isActive) {
    redirectToAdminDashboard();
    return;
  };
  
  return (
    <PageLayout>
      <div className="min-h-screen bg-[#F7F8F8] pt-24 md:pt-32 pb-16 px-4">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 mt-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
                KYC Verification
              </h1>
              <p className="text-sm text-zinc-500 mt-1 max-w-xl">
                Upload your identity documents. An admin will review your submission;
                once approved you can access your agent dashboard.
              </p>
            </div>
            {profileStatus && (
              <div className="flex-shrink-0">
                <StatusBadge status={profileStatus as KycDocStatus} />
              </div>
            )}
          </div>

          {isActive && (
            <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-emerald-900">
                Account approved
              </h2>
              <p className="text-sm text-emerald-800 mt-1">
                Your KYC has been approved. You can now access your agent dashboard.
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

          {isPending && !isActive && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-amber-900">
                KYC Submitted Successfully
              </h2>
              <p className="text-sm text-amber-800 mt-1">
                Your KYC has been submitted and is currently pending verification. Kindly
                contact{' '}
                <a href="mailto:sales@aparte.ng" className="underline font-semibold">
                  sales@aparte.ng
                </a>{' '}
                for further enquiries regarding your verification status.
              </p>
              <p className="text-sm text-amber-800 mt-3">
                You will gain access to your agent dashboard once your account has been
                approved.
              </p>
            </div>
          )}

          {isRejected && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
              <h2 className="text-base font-semibold text-red-900">
                KYC Verification Unsuccessful
              </h2>
              <p className="text-sm text-red-800 mt-1">
                Your KYC verification could not be approved at this time.
              </p>
              {rejectedReason && (
                <p className="text-sm text-red-800 mt-2">
                  <span className="font-semibold">Reason:</span> {rejectedReason}
                </p>
              )}
              <p className="text-sm text-red-800 mt-3">
                Please correct your information and resubmit your KYC below.
              </p>
            </div>
          )}

          {!isActive && (
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5 sm:p-6 mb-8">
              <h2 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                <Icon icon="material-symbols:upload-file-outline" className="text-[#028090]" />
                New submission
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as KycDocumentType)}
                    className="w-full h-11 px-3 border border-zinc-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#028090]/20 focus:border-[#028090] outline-none"
                    disabled={uploading}
                  >
                    {['Identity'].map((group) => (
                      <optgroup key={group} label={group}>
                        {DOC_TYPE_OPTIONS.filter((o) => o.group === group).map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                    File (JPG / PNG / WEBP / PDF, max 10MB)
                  </label>
                  <input
                    ref={fileInputRef}
                    id="agent-kyc-file-input"
                    type="file"
                    className="hidden"
                    accept={ALLOWED_MIME.join(',')}
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="agent-kyc-file-input"
                    className={`flex items-center justify-center gap-2 h-11 px-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-sm font-medium ${
                      uploading
                        ? 'border-zinc-200 text-zinc-400 cursor-not-allowed'
                        : selectedFile
                          ? 'border-[#028090]/60 bg-[#028090]/5 text-[#028090]'
                          : 'border-zinc-300 text-zinc-600 hover:border-[#028090] hover:text-[#028090]'
                    }`}
                  >
                    <HiOutlineCloudUpload className="text-lg" />
                    <span className="truncate max-w-[240px]">
                      {selectedFile ? selectedFile.name : 'Choose a file'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={uploading || !selectedFile}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#028090] text-white text-sm font-semibold hover:bg-[#026f7c] transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
                >
                  <Icon icon={uploading ? 'mdi:loading' : 'mdi:cloud-upload'} className={uploading ? 'animate-spin' : ''} />
                  {uploading ? 'Uploading...' : 'Submit for review'}
                </button>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-base font-semibold text-zinc-900 mb-3">
              Your submissions ({docs.length})
            </h2>

            {isLoading ? (
              <div className="flex justify-center py-10 text-sm text-zinc-500">
                Loading documents…
              </div>
            ) : docs.length === 0 ? (
              <div className="bg-white border border-dashed border-zinc-300 rounded-2xl p-10 text-center">
                <Icon
                  icon="solar:documents-broken"
                  className="mx-auto text-5xl text-zinc-300 mb-3"
                />
                <p className="text-sm text-zinc-500">
                  No documents uploaded yet. Start with an ID document above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docs.map((doc) => (
                  <DocCard key={doc.id} doc={doc} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
