/**
 * Agent onboarding / dashboard-access status.
 * Prefer explicit agent_approval_status when the API adds it; otherwise derive
 * from profile KYC status + whether identity docs have been submitted.
 */

export enum AgentApprovalStatus {
  KYC_PENDING = "KYC_PENDING",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
}

export type AgentApprovalUserLike = {
  role?: string | null;
  agentApprovalStatus?: string | null;
  agent_approval_status?: string | null;
  kycStatus?: string | null;
  kyc_status?: string | null;
  // Auth payloads use a loose profile shape; only KYC fields are read.
  profile?: Record<string, unknown> | null;
  kycDocuments?: unknown[] | null;
  kyc_documents?: unknown[] | null;
};

export function getAgentApprovalStatus(
  user: AgentApprovalUserLike | null | undefined,
  opts?: { hasKycDocuments?: boolean },
): AgentApprovalStatus | null {
  if (!user || user.role !== "AGENT") return null;

  const explicit =
    user.agentApprovalStatus || user.agent_approval_status || undefined;
  if (
    explicit &&
    Object.values(AgentApprovalStatus).includes(explicit as AgentApprovalStatus)
  ) {
    return explicit as AgentApprovalStatus;
  }

  const profile = user.profile || {};
  const kyc =
    (typeof profile.kycStatus === "string" ? profile.kycStatus : undefined) ||
    (typeof profile.kyc_status === "string" ? profile.kyc_status : undefined) ||
    user.kycStatus ||
    user.kyc_status ||
    "PENDING";

  if (kyc === "VERIFIED") return AgentApprovalStatus.ACTIVE;
  if (kyc === "REJECTED") return AgentApprovalStatus.REJECTED;

  const hasDocs =
    opts?.hasKycDocuments ??
    ((Array.isArray(user.kycDocuments) && user.kycDocuments.length > 0) ||
      (Array.isArray(user.kyc_documents) && user.kyc_documents.length > 0));

  if (hasDocs) return AgentApprovalStatus.PENDING_APPROVAL;
  return AgentApprovalStatus.KYC_PENDING;
}

/** Agents may enter the admin dashboard only after KYC approval. */
export function isAgentDashboardAllowed(
  user: AgentApprovalUserLike | null | undefined,
  opts?: { hasKycDocuments?: boolean },
): boolean {
  return getAgentApprovalStatus(user, opts) === AgentApprovalStatus.ACTIVE;
}
