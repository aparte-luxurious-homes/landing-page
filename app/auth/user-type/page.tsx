import type { Metadata } from "next";

import UserTypeSelection from "@/components/UserTypeSelection";

export const metadata: Metadata = {
  title: "Choose your account type",
  robots: { index: false, follow: false },
};

/**
 * /signup with no user type redirects here (see AuthPage). Previously this
 * route was defined inline in App.tsx as a wrapper around UserTypeSection.
 */
export default function Page() {
  return <UserTypeSelection />;
}
