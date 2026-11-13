import type { Metadata } from "next";

import LoginPage from "@/views/auth/LoginPage";

export const metadata: Metadata = {
  title: "Agent log in",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <LoginPage />;
}
