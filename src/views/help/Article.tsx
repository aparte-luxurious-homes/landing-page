'use client';

import { Link, Navigate, useParams } from '@/lib/router';
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { ArticleView } from "@/components/help/ArticleView";
import { getGuideBySlug } from "@/lib/help/data";
import type { Audience } from "@/lib/help/types";

const PLURAL_TO_AUDIENCE: Record<string, Audience> = {
  owners: "owner",
  agents: "agent",
  guests: "guest",
};

export default function HelpArticlePage() {
  const { audience: param, slug } = useParams<{ audience: string; slug: string }>();
  const audience = param ? PLURAL_TO_AUDIENCE[param] : undefined;

  if (!audience || !slug) return <Navigate to="/help" replace />;

  const guide = getGuideBySlug(audience, slug);
  if (!guide) return <Navigate to="/help" replace />;

  return (
    <>
      {/* Head tags + BreadcrumbList now come from the server page
          (app/help/[audience]/[slug]/page.tsx) — no client helmet needed. */}
      <Header />
      <main className="bg-white pt-24 pb-32 lg:pb-44 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
            <Link to="/help" className="hover:text-teal">Help Center</Link>{" "}
            <span aria-hidden>›</span>{" "}
            <Link to={`/help/${param}`} className="hover:text-teal">
              {audience[0].toUpperCase() + audience.slice(1)}s
            </Link>
          </nav>
          <ArticleView guide={guide} surface="page" />
        </div>
      </main>
      <Footer />
    </>
  );
}
