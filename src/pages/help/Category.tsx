import { Navigate, useParams } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { breadcrumbSchema } from "@/lib/seo/schema";
import Header from "@/sections/Header";
import Footer from "@/sections/Footer";
import { ArticleCard } from "@/components/help/ArticleCard";
import { guidesForAudience } from "@/lib/help/data";
import type { Audience } from "@/lib/help/types";

const AUDIENCE_LABELS: Record<Audience, string> = {
  owner: "Property owners",
  agent: "Agents",
  guest: "Guests",
};

const PLURAL_TO_AUDIENCE: Record<string, Audience> = {
  owners: "owner",
  agents: "agent",
  guests: "guest",
};

export default function HelpCategoryPage() {
  const { audience: param } = useParams<{ audience: string }>();
  const audience = param ? PLURAL_TO_AUDIENCE[param] : undefined;

  if (!audience) return <Navigate to="/help" replace />;

  const guides = guidesForAudience(audience);
  const label = AUDIENCE_LABELS[audience];

  return (
    <>
      <Seo
        title={`${label} Help`}
        description={`Help articles and how-to guides for ${label.toLowerCase()} on the Aparte platform.`}
        canonicalPath={`/help/${param}`}
        type="article"
        jsonLd={breadcrumbSchema([
          { name: "Help Center", path: "/help" },
          { name: label, path: `/help/${param}` },
        ])}
      />
      <Header />
      <main className="bg-white pt-24 pb-32 lg:pb-44 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <header className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-teal mb-2">
              Help Center
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
              {label}
            </h1>
            <p className="mt-2 text-gray-600">
              {guides.length} {guides.length === 1 ? "guide" : "guides"} for{" "}
              {label.toLowerCase()}.
            </p>
          </header>
          <div className="space-y-3">
            {guides.map((guide) => (
              <ArticleCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
