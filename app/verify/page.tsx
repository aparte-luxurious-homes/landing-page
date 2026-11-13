import type { Metadata } from "next";

import VerifyAgent from "@/views/VerifyAgent";

export const metadata: Metadata = {
  title: "Verify an agent",
  alternates: { canonical: "/verify" },
};

export default function Page() {
  return <VerifyAgent />;
}
