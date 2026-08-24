import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PaymentScripts from "@/components/PaymentScripts";
import { getProperty } from "@/lib/links/api";
import BookingForm from "./BookingForm";

export const metadata: Metadata = {
  title: "Book your stay",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Guest checkout for an Aparte Link property — no account required.
 * Posts to the public booking endpoint and hands off to the gateway's
 * hosted checkout.
 */
export default async function BookPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getProperty(slug).catch(() => null);
  if (!property) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <PaymentScripts />
      <h1 className="text-2xl font-bold">{property.name}</h1>
      <p className="mt-1 text-neutral-500">
        {property.city}, {property.state}
      </p>
      <BookingForm property={property} />
    </div>
  );
}
