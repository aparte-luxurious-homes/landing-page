import type { Metadata } from "next";

import AboutUs from "@/pages/AboutUs";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Aparte connects discerning travellers with handpicked luxury short-stay apartments, homes and hotels across Nigeria.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return <AboutUs />;
}
