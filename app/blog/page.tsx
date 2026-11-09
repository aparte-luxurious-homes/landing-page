import type { Metadata } from "next";
import Link from "next/link";

import {
  ArticleCard,
  ArticleGrid,
  BlogSearch,
  CategoryChips,
  FeaturedCard,
  Pager,
  PopularList,
} from "@/components/blog/BlogCards";
import { BlogBreadcrumb, BlogShell } from "@/components/blog/BlogShell";
import { JsonLdScripts } from "@/components/blog/JsonLd";
import {
  EMPTY_PAGE,
  fetchBlogCategories,
  fetchBlogHome,
  fetchBlogPosts,
  readPage,
  type BlogHome,
  type BlogPage,
} from "@/lib/blog/api";
import { absoluteUrl } from "@/lib/seo/config";
import { breadcrumbSchema } from "@/lib/seo/schema";

/**
 * aparte.ng/blog
 *
 *   /blog            featured, latest, popular, categories
 *   /blog?page=2     older articles (crawlable "Older articles" links)
 *   /blog?q=lekki    search results (not indexed)
 *
 * Server-rendered and refreshed every minute (lib/blog/api REVALIDATE), so a
 * publish in the dashboard reaches readers without a website rebuild.
 */

export const revalidate = 60;

const PAGE_SIZE = 9;

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

function readParams(sp: { q?: string; page?: string }) {
  return { q: (sp.q ?? "").trim().slice(0, 100), page: readPage(sp.page) };
}

const DESCRIPTION =
  "Guides and news from Aparte: finding and booking verified short-lets, travel around Nigeria, and listing your property.";

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q, page } = readParams(await searchParams);
  if (q) {
    return {
      title: `Search results for "${q}" | Blog`,
      robots: { index: false, follow: true },
      alternates: { canonical: "/blog" },
    };
  }
  const canonical = page > 1 ? `/blog?page=${page}` : "/blog";
  return {
    title: page > 1 ? `Blog, page ${page}` : "Blog: Short-let guides, travel tips and Aparte news",
    description: DESCRIPTION,
    alternates: { canonical },
    openGraph: { type: "website", title: "The Aparte Blog", description: DESCRIPTION, url: canonical },
  };
}

export default async function BlogIndexPage({ searchParams }: PageProps) {
  const { q, page } = readParams(await searchParams);
  if (q) return <SearchView q={q} page={page} />;

  let home: BlogHome | null = null;
  let latest: BlogPage = EMPTY_PAGE;
  try {
    home = await fetchBlogHome();
    latest =
      page === 1
        ? home.latest
        : await fetchBlogPosts({ page, pageSize: PAGE_SIZE, excludeFeatured: true });
  } catch {
    home = null;
  }

  if (!home) {
    return (
      <BlogShell wide>
        <BlogBreadcrumb />
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink">The Aparte Blog</h1>
        <p className="mt-4 text-gray-600">
          The blog could not be loaded just now. Please try again in a moment.
        </p>
      </BlogShell>
    );
  }

  const nothingYet = home.featured.length === 0 && latest.total === 0;

  return (
    <BlogShell wide>
      <JsonLdScripts
        blocks={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "The Aparte Blog",
            description: DESCRIPTION,
            url: absoluteUrl("/blog"),
          },
        ]}
      />
      <BlogBreadcrumb />

      <header className="mb-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-end">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink leading-tight">
            The Aparte Blog
          </h1>
          <p className="mt-3 text-gray-700 leading-relaxed max-w-2xl">{DESCRIPTION}</p>
        </div>
        <BlogSearch />
      </header>

      <div className="mb-8">
        <CategoryChips categories={home.categories} />
      </div>

      {nothingYet ? (
        <p className="text-gray-600">
          Our first articles are on their way. In the meantime,{" "}
          <Link href="/search-results" className="text-teal font-semibold hover:underline">
            browse verified stays
          </Link>
          .
        </p>
      ) : (
        <>
          {page === 1 && home.featured.length > 0 && (
            <section className="mb-12 space-y-5" aria-label="Featured">
              <FeaturedCard post={home.featured[0]} />
              {home.featured.length > 1 && <ArticleGrid posts={home.featured.slice(1)} />}
            </section>
          )}

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section aria-label="Latest articles">
              <h2 className="font-serif text-2xl font-semibold text-ink mb-4">
                {page === 1 ? "Latest articles" : "Older articles"}
              </h2>
              {latest.items.length > 0 ? (
                // Two columns, not ArticleGrid's three: this sits beside the
                // Popular sidebar.
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {latest.items.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  {page === 1 ? "More articles are on their way." : "No more articles."}{" "}
                  {page > 1 && (
                    <Link href="/blog" className="text-teal font-semibold hover:underline">
                      Back to the latest
                    </Link>
                  )}
                </p>
              )}
              <Pager
                page={page}
                hasMore={latest.has_more}
                hrefFor={(p) => (p <= 1 ? "/blog" : `/blog?page=${p}`)}
              />
            </section>

            {home.popular.length > 0 && (
              <aside aria-label="Popular articles" className="lg:border-l lg:border-gray-100 lg:pl-8">
                <h2 className="font-serif text-xl font-semibold text-ink mb-4">Popular articles</h2>
                <PopularList posts={home.popular} />
              </aside>
            )}
          </div>
        </>
      )}
    </BlogShell>
  );
}

async function SearchView({ q, page }: { q: string; page: number }) {
  let results: BlogPage = EMPTY_PAGE;
  let categories: Awaited<ReturnType<typeof fetchBlogCategories>> = [];
  let failed = false;
  try {
    [results, categories] = await Promise.all([
      fetchBlogPosts({ search: q, page, pageSize: PAGE_SIZE }),
      fetchBlogCategories(),
    ]);
  } catch {
    failed = true;
  }

  return (
    <BlogShell wide>
      <BlogBreadcrumb trail={[{ name: "Search" }]} />
      <header className="mb-8 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-end">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink leading-tight">
            Search results for &ldquo;{q}&rdquo;
          </h1>
          {!failed && (
            <p className="mt-2 text-gray-600">
              {results.total === 1 ? "1 article" : `${results.total} articles`}
            </p>
          )}
        </div>
        <BlogSearch defaultValue={q} />
      </header>

      {failed ? (
        <p className="text-gray-600">Search is unavailable just now. Please try again in a moment.</p>
      ) : results.items.length ? (
        <>
          <ArticleGrid posts={results.items} />
          <Pager
            page={page}
            hasMore={results.has_more}
            hrefFor={(p) => `/blog?q=${encodeURIComponent(q)}${p > 1 ? `&page=${p}` : ""}`}
          />
        </>
      ) : (
        <div className="space-y-6">
          <p className="text-gray-600">
            No articles match. Try a different word, or browse a topic:
          </p>
          <CategoryChips categories={categories} />
        </div>
      )}
    </BlogShell>
  );
}
