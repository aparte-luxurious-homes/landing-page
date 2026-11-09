/**
 * Pass-through. It exists so app/blog/not-found.tsx is the boundary for
 * notFound() anywhere under /blog (articles, categories, tags) rather than the
 * site-wide 404, which points at property search instead of the blog.
 */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
