import Link from "next/link";

import { ArticleGrid, CategoryChips, Pager } from "@/components/blog/BlogCards";
import { BlogBreadcrumb, BlogShell } from "@/components/blog/BlogShell";
import { JsonLdScripts } from "@/components/blog/JsonLd";
import type { BlogCategory, BlogPage } from "@/lib/blog/api";
import { absoluteUrl } from "@/lib/seo/config";
import { breadcrumbSchema } from "@/lib/seo/schema";

/** One topic's articles: a category page or a tag page. */
export default function ArticleListPage({
  kicker,
  title,
  description,
  basePath,
  page,
  results,
  categories,
  activeCategory,
}: {
  kicker: string;
  title: string;
  description?: string | null;
  basePath: string;
  page: number;
  results: BlogPage;
  categories: BlogCategory[];
  activeCategory?: string;
}) {
  return (
    <BlogShell wide>
      <JsonLdScripts
        blocks={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: title, path: basePath },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${title} | The Aparte Blog`,
            url: absoluteUrl(basePath),
            ...(description ? { description } : {}),
          },
        ]}
      />
      <BlogBreadcrumb trail={[{ name: title }]} />

      <header className="mb-6 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-wider text-teal mb-2">{kicker}</p>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">{title}</h1>
        {description && <p className="mt-3 text-gray-700 leading-relaxed">{description}</p>}
      </header>

      <div className="mb-8">
        <CategoryChips categories={categories} active={activeCategory} />
      </div>

      {results.items.length ? (
        <>
          <ArticleGrid posts={results.items} />
          <Pager
            page={page}
            hasMore={results.has_more}
            hrefFor={(p) => (p <= 1 ? basePath : `${basePath}?page=${p}`)}
          />
        </>
      ) : (
        <p className="text-gray-600">
          No articles here yet.{" "}
          <Link href="/blog" className="text-teal font-semibold hover:underline">
            See all articles
          </Link>
        </p>
      )}
    </BlogShell>
  );
}
