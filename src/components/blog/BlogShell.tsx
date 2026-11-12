import Link from "next/link";

import Footer from "@/sections/Footer";
import Header from "@/sections/Header";

/**
 * Header + page body + footer for every blog page. Server component: the blog
 * pages exist to put their text in the HTML, so nothing here may pull in
 * client state.
 */
export function BlogShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <>
      <Header />
      {/* pb must stay >= the Footer's -mt-28 / lg:-mt-40 pull, or its
          angled wedge paints over the last block of content. */}
      <main className="bg-white pt-24 md:pt-28 pb-32 lg:pb-48 min-h-screen">
        <div className={`${wide ? "max-w-6xl" : "max-w-3xl"} mx-auto px-4 sm:px-6`}>{children}</div>
      </main>
      <Footer />
    </>
  );
}

/** Home > Blog > ... */
export function BlogBreadcrumb({ trail = [] }: { trail?: { name: string; href?: string }[] }) {
  return (
    <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
      <Link href="/" className="hover:text-teal">
        Home
      </Link>{" "}
      <span aria-hidden>›</span>{" "}
      {trail.length ? (
        <Link href="/blog" className="hover:text-teal">
          Blog
        </Link>
      ) : (
        <span>Blog</span>
      )}
      {trail.map((crumb) => (
        <span key={crumb.name}>
          {" "}
          <span aria-hidden>›</span>{" "}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-teal">
              {crumb.name}
            </Link>
          ) : (
            <span className="text-gray-700">{crumb.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
