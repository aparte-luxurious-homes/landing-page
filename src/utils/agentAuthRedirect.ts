import { toast } from "react-toastify";
import { redirectToAdminDashboard } from "./adminRedirect";
import {
  AgentApprovalUserLike,
  isAgentDashboardAllowed,
} from "./agentApproval";

export const AGENT_KYC_PATH = "/agent/kyc";

type NavigateFn = (path: string) => void;

/**
 * Route an AGENT after login / OTP. Dashboard only when KYC is approved;
 * everyone else stays on the landing KYC page.
 */
export function routeAgentAfterAuth(
  user: AgentApprovalUserLike,
  navigate: NavigateFn,
  opts?: { toastOnKyc?: boolean },
): void {
  if (isAgentDashboardAllowed(user)) {
    if (redirectToAdminDashboard()) {
      toast.success("Welcome back! Redirecting to your dashboard...");
    } else {
      toast.success("Account ready. Sign in on the dashboard when available.");
      navigate("/login/agent");
    }
    return;
  }

  if (opts?.toastOnKyc !== false) {
    toast.success(
      "Complete KYC verification to activate your agent account.",
    );
  }
  navigate(AGENT_KYC_PATH);
}
