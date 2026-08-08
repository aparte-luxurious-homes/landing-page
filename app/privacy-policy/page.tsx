import type { Metadata } from "next";

import PrivacyPage from "@/pages/legal/Privacy";

export const metadata: Metadata = {
  title: "Privacy policy",
  alternates: { canonical: "/privacy-policy" },
};

export default function Page() {
  return <PrivacyPage />;
}
