import type { Metadata } from "next";

import PaymentScripts from "@/components/PaymentScripts";
import ContributionPayPage from "@/views/ContributionPayPage";

/**
 * A contributor's payment link (Invite Friends to Pay).
 *
 * Public on purpose: the person paying a share may not have an account. The
 * token in the path is the credential, so the page is kept out of search
 * indexes and sends no Referer — otherwise the token would travel to every
 * third party this page loads, the payment gateways included.
 */
export const metadata: Metadata = {
  title: "Pay your share",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <>
      <PaymentScripts />
      <ContributionPayPage token={token} />
    </>
  );
}
