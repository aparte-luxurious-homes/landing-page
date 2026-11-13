import type { Metadata } from "next";

import AuthGate from "@/components/AuthGate";
import AgentKycPage from "@/views/agent/AgentKycPage";

export const metadata: Metadata = {
  title: "Agent KYC Verification",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthGate>
      <AgentKycPage />
    </AuthGate>
  );
}
