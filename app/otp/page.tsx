import type { Metadata } from "next";

import OTPVerification from "@/views/auth/OTPVerification";

export const metadata: Metadata = {
  title: "Verify your account",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OTPVerification email={''} phone={''} />;
}
