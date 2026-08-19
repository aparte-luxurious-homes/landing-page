import type { Metadata } from "next";

import { API_BASE } from "@/lib/links/api";
import HomePage from "@/views/LandingPage/HomePage";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// The homepage listings previously only existed after hydration — RTK Query
// fetched them client-side, so GPTBot/ClaudeBot/PerplexityBot saw loading
// skeletons on the single most-linked URL of the site. Fetching the first
// page here and seeding the client section puts real property names, cities
// and prices in the raw HTML. Revalidates every 10 minutes.
export const revalidate = 600;

async function fetchInitialProperties(): Promise<unknown[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/properties?limit=12&is_verified=true`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return [];
    const body = await res.json();
    const rows = body?.data?.data?.data ?? body?.data?.data ?? [];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const initialProperties = await fetchInitialProperties();
  return <HomePage initialProperties={initialProperties} />;
}
