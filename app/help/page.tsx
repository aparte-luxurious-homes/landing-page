import type { Metadata } from "next";

import HelpHomePage from "@/views/help/Home";

export const metadata: Metadata = {
  title: "Help centre",
  description:
    "Find answers about listing your property, booking a stay, managing payments and getting support on Aparte.",
  alternates: { canonical: "/help" },
};

export default function Page() {
  return <HelpHomePage />;
}
