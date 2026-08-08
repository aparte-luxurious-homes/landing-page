import type { Metadata } from "next";

import AuthGate from "@/components/AuthGate";
import BookingDetailsPage from "@/views/BookingDetailsPage";
import MyAccountPage from "@/views/MyAccountPage";

export const metadata: Metadata = {
  title: "Booking details",
  robots: { index: false, follow: false },
};

/**
 * Under react-router this was a nested <Route> and MyAccountPage pulled the
 * child from useOutlet(). The App Router has no conditional outlet, so the
 * child view is passed in explicitly and `isBookingDetail` replaces the old
 * useMatch() check that drove the tab/breadcrumb switch.
 */
export default function Page() {
  return (
    <AuthGate>
      <MyAccountPage isBookingDetail>
        <BookingDetailsPage />
      </MyAccountPage>
    </AuthGate>
  );
}
