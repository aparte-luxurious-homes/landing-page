import type { Metadata } from "next";

import ResetPassword from "@/views/auth/ResetPassword";

export const metadata: Metadata = {
  title: "Set a new password",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ResetPassword />;
}
