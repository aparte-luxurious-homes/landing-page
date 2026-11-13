import type { Metadata } from "next";

import AboutUs from "@/views/AboutUs";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Aparte connects travellers with verified short-stay apartments, homes and hotels across Nigeria. Every listing is checked before it goes live.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutUs />;
}
