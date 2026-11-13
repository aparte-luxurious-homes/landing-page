import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ArticleListPage from "@/components/blog/ArticleListPage";
import { fetchBlogCategories, fetchBlogPosts, readPage } from "@/lib/blog/api";

/**
 * aparte.ng/blog/category/{slug}. A category with no published articles is a
 * 404: the public category list only holds categories that have some, and an
 * empty topic page is thin content.
 */

export const revalidate = 60;

const PAGE_SIZE = 12;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function findCategory(slug: string) {
  const categories = await fetchBlogCategories();
  return { categories, category: categories.find((c) => c.slug === slug) };
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = readPage((await searchParams).page);
  let found: Awaited<ReturnType<typeof findCategory>>;
  try {
    found = await findCategory(slug);
  } catch {
    return { title: "Blog" };
  }
  // 404 from metadata, which resolves before streaming starts: thrown only in
  // the page, the response would already be a 200.
  const { category } = found;
  if (!category) notFound();
  const path = `/blog/category/${slug}`;
  const description =
    category.description || `Articles about ${category.name.toLowerCase()} from the Aparte blog.`;
  return {
    title: page > 1 ? `${category.name}, page ${page} | Blog` : `${category.name} | Blog`,
    description,
    alternates: { canonical: page > 1 ? `${path}?page=${page}` : path },
    openGraph: { type: "website", title: `${category.name} | The Aparte Blog`, description, url: path },
  };
}

export default async function BlogCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const page = readPage((await searchParams).page);
  const { categories, category } = await findCategory(slug);
  if (!category) notFound();
  const results = await fetchBlogPosts({ category: slug, page, pageSize: PAGE_SIZE });

  return (
    <ArticleListPage
      kicker="Category"
      title={category.name}
      description={category.description}
      basePath={`/blog/category/${slug}`}
      page={page}
      results={results}
      categories={categories}
      activeCategory={slug}
    />
  );
}
