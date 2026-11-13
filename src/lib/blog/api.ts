import { BASE_API_URL } from "@/utils/url";

/**
 * Server-side reads for the blog pages (api-v1 services/blog, public routes).
 *
 * Raw fetch rather than RTK Query for the same reason as lib/seo/serverFetch:
 * these run in server components, where the client store does not exist, and
 * the whole point of the blog pages is that their text is in the HTML for
 * Google and for link previews.
 *
 * REVALIDATE is short so a publish, edit or unpublish in the dashboard shows
 * on the website within a minute, and a scheduled article appears within a
 * minute of its time.
 */

export const REVALIDATE = 60;

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  article_count?: number;
}

export interface BlogCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  featured_image_alt: string;
  category: BlogCategory | null;
  author_name: string | null;
  published_at: string | null;
  reading_minutes: number;
}

export interface BlogPropertyCard {
  id: string;
  slug: string | null;
  name: string;
  city: string;
  state: string;
  property_type: string;
  image_url: string | null;
  price_from: number | null;
  currency: string;
}

export interface BlogArticle extends BlogCard {
  content_html: string;
  tags: { name: string; slug: string }[];
  updated_at: string | null;
  seo_title: string;
  meta_description: string | null;
  canonical_url: string | null;
  related: BlogCard[];
  properties: {
    source: "PICKED" | "PLACE" | "NONE";
    place: string | null;
    items: BlogPropertyCard[];
  };
}

export interface BlogPage {
  items: BlogCard[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

export interface BlogHome {
  featured: BlogCard[];
  latest: BlogPage;
  popular: BlogCard[];
  categories: BlogCategory[];
}

export const EMPTY_PAGE: BlogPage = { items: [], total: 0, page: 1, page_size: 9, has_more: false };

async function getJson<T>(path: string): Promise<T> {
  if (!BASE_API_URL) throw new Error("BASE_API_URL not configured");
  const res = await fetch(`${BASE_API_URL}${path}`, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`API ${res.status} for ${path}`);
  const body = await res.json();
  return body?.data as T;
}

export function fetchBlogHome(): Promise<BlogHome> {
  return getJson<BlogHome>("/blog/home");
}

export interface BlogListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  search?: string;
  excludeFeatured?: boolean;
}

export function fetchBlogPosts(params: BlogListParams): Promise<BlogPage> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("page_size", String(params.pageSize ?? 9));
  if (params.category) qs.set("category", params.category);
  if (params.tag) qs.set("tag", params.tag);
  if (params.search) qs.set("search", params.search);
  if (params.excludeFeatured) qs.set("exclude_featured", "true");
  return getJson<BlogPage>(`/blog/posts?${qs.toString()}`);
}

export function fetchBlogCategories(): Promise<BlogCategory[]> {
  return getJson<BlogCategory[]>("/blog/categories");
}

export type ArticleResult =
  | { kind: "article"; article: BlogArticle }
  | { kind: "moved"; slug: string }
  | { kind: "missing" };

/**
 * "missing" only when the API says the article is not public (404). Network
 * and server errors throw, so a blip is never served as a 404 that a crawler
 * would then drop from its index.
 */
export async function fetchBlogArticle(slug: string): Promise<ArticleResult> {
  if (!BASE_API_URL) throw new Error("BASE_API_URL not configured");
  const res = await fetch(`${BASE_API_URL}/blog/posts/${encodeURIComponent(slug)}`, {
    next: { revalidate: REVALIDATE },
  });
  if (res.status === 404) return { kind: "missing" };
  if (!res.ok) throw new Error(`API ${res.status} for blog article ${slug}`);
  const data = (await res.json())?.data;
  if (data?.redirect_to) return { kind: "moved", slug: data.redirect_to };
  return { kind: "article", article: data as BlogArticle };
}

export async function fetchBlogSitemap(): Promise<{
  posts: { slug: string; updated_at: string | null }[];
  categories: string[];
}> {
  try {
    return await getJson("/blog/sitemap");
  } catch {
    return { posts: [], categories: [] };
  }
}

/** ?page= from the address bar: a whole number from 1 to 500, else 1. */
export function readPage(raw?: string): number {
  return Math.max(1, Math.min(500, Number.parseInt(raw ?? "1", 10) || 1));
}

export function formatBlogDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
