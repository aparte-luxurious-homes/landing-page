import type { Metadata } from "next";

import PaymentScripts from "@/components/PaymentScripts";
import PaymentSuccess from "@/views/PaymentSuccess";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <PaymentScripts />
      <PaymentSuccess />
    </>
  );
}
