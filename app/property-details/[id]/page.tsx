import PropertyDetails from "@/views/PropertyDetails";

/**
 * Property detail. Still client-rendered — the component owns its RTK Query
 * fetch, Google Maps, and the booking sidebar. Server-side metadata (the real
 * SEO win here) is a follow-up: it needs a server fetch of the public property
 * endpoint, which the Aparte Link work already provides.
 */
export default function Page() {
  return <PropertyDetails />;
}
