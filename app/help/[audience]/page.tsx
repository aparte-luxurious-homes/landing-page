import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { guidesForAudience } from "@/lib/help/data";
import type { Audience } from "@/lib/help/types";
import { toJsonLd } from "@/lib/seo/jsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";
import HelpCategoryPage from "@/views/help/Category";

/**
 * Audience hub (/help/owners, /help/agents, /help/guests).
 *
 * Title/description/canonical + BreadcrumbList now render server-side — they
 * previously came from the client <Seo> helmet, so non-JS crawlers saw the
 * site-default head on every hub. Help content is local JSON, so these pages
 * prerender statically.
 */

const PLURAL_TO_AUDIENCE: Record<string, Audience> = {
  owners: "owner",
  agents: "agent",
  guests: "guest",
};

const AUDIENCE_LABELS: Record<Audience, string> = {
  owner: "Property owners",
  agent: "Agents",
  guest: "Guests",
};

interface PageProps {
  params: Promise<{ audience: string }>;
}

export function generateStaticParams() {
  return Object.keys(PLURAL_TO_AUDIENCE).map((audience) => ({ audience }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { audience: param } = await params;
  const audience = PLURAL_TO_AUDIENCE[param];
  if (!audience) return { title: "Help Center" };

  const label = AUDIENCE_LABELS[audience];
  return {
    title: `${label} Help`,
    description: `Help articles and how-to guides for ${label.toLowerCase()} on the Aparte platform.`,
    alternates: { canonical: `/help/${param}` },
  };
}

export default async function Page({ params }: PageProps) {
  const { audience: param } = await params;
  const audience = PLURAL_TO_AUDIENCE[param];
  // Server-side redirect mirrors the view's old client <Navigate> — crawlers
  // get a real redirect instead of a 200 that swaps content after hydration.
  if (!audience) redirect("/help");

  const label = AUDIENCE_LABELS[audience];
  const crumbs = breadcrumbSchema([
    { name: "Help Center", path: "/help" },
    { name: label, path: `/help/${param}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(crumbs) }}
      />
      <HelpCategoryPage />
    </>
  );
}
