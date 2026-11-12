import Link from "next/link";

import { BRAND_LOGO_URL } from "@/config/brand";
import { formatBlogDate, type BlogCard, type BlogCategory } from "@/lib/blog/api";

/** "5 March 2026 · 4 min read" */
export function Byline({ post, withAuthor = true }: { post: BlogCard; withAuthor?: boolean }) {
  const dot = <span aria-hidden> · </span>;
  const author = withAuthor && post.author_name;
  return (
    <p className="text-xs text-gray-500">
      {author && <>By {post.author_name}{dot}</>}
      {post.published_at && (
        <>
          <time dateTime={post.published_at}>{formatBlogDate(post.published_at)}</time>
          {dot}
        </>
      )}
      {post.reading_minutes} min read
    </p>
  );
}

function CardImage({ post, eager = false }: { post: BlogCard; eager?: boolean }) {
  return (
    <span className="block aspect-[16/9] bg-teal-soft overflow-hidden">
      {post.featured_image_url ? (
        // Plain <img>: same reason as the shortlets ListingGrid, an
        // unconfigured next/image host throws at runtime.
        <img
          src={post.featured_image_url}
          alt={post.featured_image_alt}
          loading={eager ? "eager" : "lazy"}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300"
        />
      ) : (
        // No featured image: the header logo (mark + "Aparte"), centred.
        <span className="flex w-full h-full items-center justify-center">
          <img src={BRAND_LOGO_URL} alt="" loading="lazy" className="w-2/5 max-w-[180px] object-contain opacity-90" />
        </span>
      )}
    </span>
  );
}

/** The standard article preview: image, category, title, summary, byline. */
export function ArticleCard({ post, eager = false }: { post: BlogCard; eager?: boolean }) {
  return (
    <article className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition">
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden>
        <CardImage post={post} eager={eager} />
      </Link>
      <div className="flex flex-col flex-1 p-4">
        {post.category && (
          <Link
            href={`/blog/category/${post.category.slug}`}
            className="text-xs font-bold uppercase tracking-wider text-teal hover:underline"
          >
            {post.category.name}
          </Link>
        )}
        <h3 className="mt-1 font-serif text-lg font-semibold text-ink leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-teal">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>}
        <div className="mt-auto pt-3">
          <Byline post={post} />
          <Link href={`/blog/${post.slug}`} className="mt-2 inline-block text-sm font-semibold text-teal hover:underline">
            Read article <span className="sr-only">: {post.title}</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/** The large lead story on the blog homepage. */
export function FeaturedCard({ post }: { post: BlogCard }) {
  return (
    <article className="group grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition">
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden>
        <CardImage post={post} eager />
      </Link>
      <div className="flex flex-col justify-center p-5 md:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-teal">
          Featured{post.category ? ` · ${post.category.name}` : ""}
        </p>
        <h2 className="mt-2 font-serif text-2xl md:text-3xl font-semibold text-ink leading-tight">
          <Link href={`/blog/${post.slug}`} className="hover:text-teal">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="mt-3 text-gray-700 leading-relaxed">{post.excerpt}</p>}
        <div className="mt-4">
          <Byline post={post} />
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 inline-block self-start rounded-lg bg-teal px-4 py-2 text-white text-sm font-semibold hover:opacity-90"
        >
          Read article <span className="sr-only">: {post.title}</span>
        </Link>
      </div>
    </article>
  );
}

/** Compact numbered list for "Popular articles". */
export function PopularList({ posts }: { posts: BlogCard[] }) {
  return (
    <ol className="space-y-4">
      {posts.map((post, i) => (
        <li key={post.id} className="flex gap-3">
          <span className="font-serif text-2xl font-semibold text-teal/50 tabular-nums leading-none w-6 shrink-0">
            {i + 1}
          </span>
          <div className="min-w-0">
            <Link href={`/blog/${post.slug}`} className="font-semibold text-ink leading-snug hover:text-teal">
              {post.title}
            </Link>
            <Byline post={post} withAuthor={false} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export function CategoryChips({
  categories,
  active,
}: {
  categories: BlogCategory[];
  active?: string;
}) {
  if (!categories.length) return null;
  const chip = "inline-block px-3 py-1.5 rounded-full text-sm font-semibold transition";
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Categories">
      <li>
        <Link
          href="/blog"
          className={`${chip} ${!active ? "bg-teal text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          All
        </Link>
      </li>
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            href={`/blog/category/${c.slug}`}
            aria-current={active === c.slug ? "page" : undefined}
            className={`${chip} ${
              active === c.slug ? "bg-teal text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {c.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Search box. A plain GET form, so it works before the page's JavaScript loads. */
export function BlogSearch({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/blog" method="get" role="search" className="flex gap-2">
      <label htmlFor="blog-search" className="sr-only">
        Search articles
      </label>
      <input
        id="blog-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search articles"
        className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
      />
      <button type="submit" className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
        Search
      </button>
    </form>
  );
}

/** Newer / Older links. Real links, so every page of articles is crawlable. */
export function Pager({
  page,
  hasMore,
  hrefFor,
}: {
  page: number;
  hasMore: boolean;
  hrefFor: (page: number) => string;
}) {
  if (page <= 1 && !hasMore) return null;
  const btn = "rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50";
  return (
    <nav className="mt-8 flex items-center justify-between gap-3" aria-label="More articles">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={btn}>
          ← Newer articles
        </Link>
      ) : (
        <span />
      )}
      <span className="text-sm text-gray-500">Page {page}</span>
      {hasMore ? (
        <Link href={hrefFor(page + 1)} rel="next" className={btn}>
          Older articles →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function ArticleGrid({ posts }: { posts: BlogCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {posts.map((post) => (
        <ArticleCard key={post.id} post={post} />
      ))}
    </div>
  );
}
