import type { Metadata } from "next";

import TermsPage from "@/views/legal/Terms";

export const metadata: Metadata = {
  title: "Terms of service",
  alternates: { canonical: "/terms" },
};

export default function Page() {
  return <TermsPage />;
}
