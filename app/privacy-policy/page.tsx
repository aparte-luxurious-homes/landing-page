import type { Metadata } from "next";

import PrivacyPage from "@/views/legal/Privacy";

export const metadata: Metadata = {
  title: "Privacy policy",
  alternates: { canonical: "/privacy-policy" },
};

export default function Page() {
  return <PrivacyPage />;
}
