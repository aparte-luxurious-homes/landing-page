import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import ArticleStays from "@/components/blog/ArticleStays";
import { ArticleGrid, Byline } from "@/components/blog/BlogCards";
import { BlogBreadcrumb, BlogShell } from "@/components/blog/BlogShell";
import { JsonLdScripts } from "@/components/blog/JsonLd";
import ShareButtons from "@/components/blog/ShareButtons";
import ViewTracker from "@/components/blog/ViewTracker";
import styles from "@/components/blog/article.module.css";
import { fetchBlogArticle, formatBlogDate, type BlogArticle } from "@/lib/blog/api";
import { SITE_NAME, absoluteUrl } from "@/lib/seo/config";
import { breadcrumbSchema } from "@/lib/seo/schema";

/**
 * aparte.ng/blog/{slug}
 *
 * Everything a crawler or a link preview needs is rendered on the server:
 * the article, its Open Graph card and BlogPosting structured data. An old
 * address (the slug was changed after publishing) forwards permanently to the
 * current one; an unpublished or deleted article is a real 404.
 */

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function load(slug: string): Promise<BlogArticle> {
  const result = await fetchBlogArticle(slug);
  if (result.kind === "moved") permanentRedirect(`/blog/${result.slug}`);
  if (result.kind === "missing") notFound();
  return result.article;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let result: Awaited<ReturnType<typeof fetchBlogArticle>>;
  try {
    result = await fetchBlogArticle(slug);
  } catch {
    // API blip: let the page render (or fail) on its own; never 404 here.
    return { title: "Blog" };
  }
  // Redirect / 404 HERE, not only in the page. Metadata resolves before the
  // response starts streaming; by the time the page body throws, the status
  // is already 200 and Next can only fall back to a meta refresh, so an old
  // address would not be a real permanent redirect and a removed article
  // would not be a real 404 (both matter to search engines).
  if (result.kind === "moved") permanentRedirect(`/blog/${result.slug}`);
  if (result.kind === "missing") notFound();
  const article = result.article;

  const path = `/blog/${article.slug}`;
  const description = article.meta_description || article.excerpt || undefined;
  const image = article.featured_image_url;
  return {
    // seo_title is the full title the writer chose; skip the "| Aparte" suffix
    // only when they already included the brand.
    title: article.seo_title.includes(SITE_NAME) ? { absolute: article.seo_title } : article.seo_title,
    description,
    alternates: { canonical: article.canonical_url || path },
    authors: article.author_name ? [{ name: article.author_name }] : undefined,
    openGraph: {
      type: "article",
      title: article.seo_title,
      description,
      url: path,
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at ?? undefined,
      authors: article.author_name ? [article.author_name] : undefined,
      section: article.category?.name,
      tags: article.tags.map((t) => t.name),
      images: image ? [{ url: image, width: 1200, height: 675, alt: article.featured_image_alt }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seo_title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await load(slug);
  const url = absoluteUrl(`/blog/${article.slug}`);

  const posting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.meta_description || article.excerpt || undefined,
    image: article.featured_image_url ? [article.featured_image_url] : undefined,
    datePublished: article.published_at ?? undefined,
    dateModified: article.updated_at ?? article.published_at ?? undefined,
    author: article.author_name
      ? { "@type": "Person", name: article.author_name }
      : { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    publisher: { "@id": `${absoluteUrl("/")}#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: article.category?.name,
    keywords: article.tags.map((t) => t.name).join(", ") || undefined,
    timeRequired: `PT${article.reading_minutes}M`,
  };

  const trail = article.category
    ? [{ name: article.category.name, href: `/blog/category/${article.category.slug}` }]
    : [];

  return (
    <BlogShell>
      <JsonLdScripts
        blocks={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            ...(article.category
              ? [{ name: article.category.name, path: `/blog/category/${article.category.slug}` }]
              : []),
            { name: article.title, path: `/blog/${article.slug}` },
          ]),
          posting,
        ]}
      />
      <ViewTracker slug={article.slug} />

      <article>
        <BlogBreadcrumb trail={trail} />

        <header>
          {article.category && (
            <Link
              href={`/blog/category/${article.category.slug}`}
              className="text-xs font-bold uppercase tracking-wider text-teal hover:underline"
            >
              {article.category.name}
            </Link>
          )}
          <h1 className="mt-2 font-serif text-3xl md:text-[2.6rem] font-semibold text-ink leading-tight">
            {article.title}
          </h1>
          {article.excerpt && <p className="mt-4 text-lg text-gray-700 leading-relaxed">{article.excerpt}</p>}
          <div className="mt-4">
            <Byline post={article} />
          </div>
        </header>

        {article.featured_image_url && (
          <figure className="mt-6 -mx-4 sm:mx-0">
            <img
              src={article.featured_image_url}
              alt={article.featured_image_alt}
              loading="eager"
              className="w-full aspect-[16/9] object-cover sm:rounded-2xl"
            />
          </figure>
        )}

        <div
          className={`mt-8 ${styles.body}`}
          // Cleaned on the server when it was saved (api-v1
          // services/blog/content.py::sanitize_html): an allow-list of tags,
          // https images only, YouTube-only embeds, no scripts or handlers.
          dangerouslySetInnerHTML={{ __html: article.content_html }}
        />

        <footer className="mt-10 space-y-5 border-t border-gray-100 pt-6">
          {article.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Tags">
              {article.tags.map((tag) => (
                <li key={tag.slug}>
                  <Link
                    href={`/blog/tag/${tag.slug}`}
                    className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    #{tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <ShareButtons url={url} title={article.title} />
          {article.updated_at &&
            article.published_at &&
            formatBlogDate(article.updated_at) !== formatBlogDate(article.published_at) && (
              <p className="text-xs text-gray-500">Last updated {formatBlogDate(article.updated_at)}</p>
            )}
        </footer>
      </article>

      <ArticleStays properties={article.properties} />

      {article.related.length > 0 && (
        <section className="mt-14" aria-label="Related articles">
          <h2 className="font-serif text-2xl font-semibold text-ink mb-4">Related articles</h2>
          <ArticleGrid posts={article.related} />
        </section>
      )}

      <p className="mt-10">
        <Link href="/blog" className="text-teal font-semibold hover:underline">
          ← All articles
        </Link>
      </p>
    </BlogShell>
  );
}
