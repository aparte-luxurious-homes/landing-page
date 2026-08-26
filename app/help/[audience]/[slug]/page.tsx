import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { allGuides, getGuideBySlug, slugOf } from "@/lib/help/data";
import type { Audience } from "@/lib/help/types";
import { toJsonLd } from "@/lib/seo/jsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";
import HelpArticlePage from "@/views/help/Article";

/**
 * Individual help guide (/help/owners/list-property etc.).
 *
 * Title/description/canonical + BreadcrumbList render server-side from the
 * local guides manifest; every guide prerenders statically at build.
 */

const PLURAL_TO_AUDIENCE: Record<string, Audience> = {
  owners: "owner",
  agents: "agent",
  guests: "guest",
};

interface PageProps {
  params: Promise<{ audience: string; slug: string }>;
}

export function generateStaticParams() {
  return allGuides.map((guide) => ({
    audience: `${guide.audience}s`,
    slug: slugOf(guide),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { audience: param, slug } = await params;
  const audience = PLURAL_TO_AUDIENCE[param];
  const guide = audience ? getGuideBySlug(audience, slug) : undefined;
  if (!guide) return { title: "Help Center" };

  return {
    title: guide.title,
    description: guide.summary,
    alternates: { canonical: `/help/${param}/${slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.summary,
      url: `/help/${param}/${slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { audience: param, slug } = await params;
  const audience = PLURAL_TO_AUDIENCE[param];
  const guide = audience ? getGuideBySlug(audience, slug) : undefined;
  // Mirrors the view's old client <Navigate to="/help"> for unknown guides.
  if (!audience || !guide) redirect("/help");

  const audienceLabel = `${audience[0].toUpperCase()}${audience.slice(1)}s`;
  const crumbs = breadcrumbSchema([
    { name: "Help Center", path: "/help" },
    { name: audienceLabel, path: `/help/${param}` },
    { name: guide.title, path: `/help/${param}/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(crumbs) }}
      />
      <HelpArticlePage />
    </>
  );
}
