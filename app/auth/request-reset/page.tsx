import type { Metadata } from "next";

import RequestPasswordReset from "@/views/auth/RequestPasswordReset";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <RequestPasswordReset />;
}
