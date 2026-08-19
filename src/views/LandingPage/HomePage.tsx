import Link from "next/link";

import Hero from "../../sections/Hero";
import Apartments from "../../sections/Apartments";
import PageLayout from "../../components/pagelayout/index";
import { SHORTLET_CITIES } from "@/lib/seo/cities";

/**
 * Stays a server component: title/description/canonical now come from
 * app/page.tsx's `metadata`, and the Organization + WebSite JSON-LD is
 * emitted server-side by app/layout.tsx. The old client-side <Seo> here
 * would have pulled react-helmet-async (and its React context) into the
 * server bundle.
 *
 * `initialProperties` is server-fetched by app/page.tsx and seeds the
 * Apartments section so listings exist in the raw HTML for non-JS crawlers.
 */
const HomePage = ({
  initialProperties = [],
}: {
  initialProperties?: unknown[];
}) => {
  return (
    <PageLayout
      children={
        <>
          <Hero />
          <Apartments initialProperties={initialProperties} />

          {/* Server-rendered destination links: crawlable path from the
              homepage into the /shortlets city pages. */}
          <section
            aria-label="Popular destinations"
            className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 pb-12"
          >
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-ink mb-2">
              Popular destinations
            </h2>
            <p className="text-gray-600 mb-4">
              Verified luxury shortlets in Nigeria&apos;s most-booked cities.
            </p>
            <ul className="flex flex-wrap gap-2">
              {SHORTLET_CITIES.map((city) => (
                <li key={city.slug}>
                  <Link
                    href={`/shortlets/${city.slug}`}
                    className="inline-block px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Shortlets in {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      }
    />
  );
};

export default HomePage;
