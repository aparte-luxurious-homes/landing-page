import type { Metadata } from "next";

import HelpFaqPage from "@/views/help/Faq";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  alternates: { canonical: "/help/faq" },
};

export default function Page() {
  return <HelpFaqPage />;
}
