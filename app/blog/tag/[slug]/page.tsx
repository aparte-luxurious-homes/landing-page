import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleListPage from "@/components/blog/ArticleListPage";
import { fetchBlogCategories, fetchBlogPosts, readPage } from "@/lib/blog/api";

/**
 * aparte.ng/blog/tag/{slug}. Tags are free-form and plentiful, so tag pages
 * are browsable but not indexed: they would mostly repeat category pages.
 */

export const revalidate = 60;

const PAGE_SIZE = 12;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

function tagName(slug: string): string {
  return slug.replace(/-/g, " ");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // 404 from metadata (resolved before streaming), so the status is a real 404.
  const probe = await fetchBlogPosts({ tag: slug, page: 1, pageSize: 1 }).catch(() => null);
  if (probe && probe.total === 0) notFound();
  return {
    title: `#${tagName(slug)} | Blog`,
    robots: { index: false, follow: true },
  };
}

export default async function BlogTagPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const page = readPage((await searchParams).page);
  const [results, categories] = await Promise.all([
    fetchBlogPosts({ tag: slug, page, pageSize: PAGE_SIZE }),
    fetchBlogCategories(),
  ]);
  if (results.total === 0) notFound();

  return (
    <ArticleListPage
      kicker="Tag"
      title={`#${tagName(slug)}`}
      basePath={`/blog/tag/${slug}`}
      page={page}
      results={results}
      categories={categories}
    />
  );
}
