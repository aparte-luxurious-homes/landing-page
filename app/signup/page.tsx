import type { Metadata } from "next";

import SignUpPage from "@/views/auth/SignUpPage";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SignUpPage />;
}
