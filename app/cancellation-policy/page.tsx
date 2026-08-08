import type { Metadata } from "next";

import CancellationPage from "@/pages/legal/Cancellation";

export const metadata: Metadata = {
  title: "Cancellation policy",
  alternates: { canonical: "/cancellation-policy" },
};

export default function Page() {
  return <CancellationPage />;
}
