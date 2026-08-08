import type { Metadata } from "next";

import PaymentScripts from "@/components/PaymentScripts";
import ConfirmBookingPage from "@/views/ConfirmBooking";

export const metadata: Metadata = {
  title: "Confirm your booking",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <PaymentScripts />
      <ConfirmBookingPage />
    </>
  );
}
