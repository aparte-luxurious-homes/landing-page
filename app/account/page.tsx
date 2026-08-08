import type { Metadata } from "next";

import AuthGate from "@/components/AuthGate";
import PaymentScripts from "@/components/PaymentScripts";
import MyAccountPage from "@/views/MyAccountPage";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthGate>
      {/* ExtendStayModal opens a Paystack checkout from the bookings tab. */}
      <PaymentScripts />
      <MyAccountPage />
    </AuthGate>
  );
}
