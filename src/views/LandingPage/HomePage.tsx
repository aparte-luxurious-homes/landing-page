/* eslint-disable @typescript-eslint/no-explicit-any */
import Apartments from "../../sections/Apartments";
import PageLayout from "../../components/pagelayout/index";
import DestinationsRail from "@/components/home/DestinationsRail";
import HomeSearchBar from "@/components/home/HomeSearchBar";
import HomeSearchProvider from "@/components/home/HomeSearchProvider";
import type { DestinationTile } from "@/lib/home/fetchDestinations";
import { absoluteUrl } from "@/lib/seo/config";
import { toJsonLd } from "@/lib/seo/jsonLd";

/**
 * Stays a server component: title/description/canonical come from
 * app/page.tsx's `metadata`, and the Organization + WebSite JSON-LD is
 * emitted server-side by app/layout.tsx.
 *
 * There is no hero. The stack is header → search → destinations →
 * categories → listings, so a guest lands on inventory rather than on a
 * stock photograph of a building nobody can book. `initialProperties` and
 * `destinations` are both server-fetched by app/page.tsx, so all of it is in
 * the raw HTML for non-JS crawlers and AI answer engines.
 */
const HomePage = ({
  initialProperties = [],
  destinations = [],
}: {
  initialProperties?: any[];
  destinations?: DestinationTile[];
}) => {
  // Matches the ItemList the city pages emit, so the homepage grid is
  // machine-readable as a list of real, linkable listings.
  const listed = initialProperties.filter((p: any) => p?.id && p?.name);
  const itemList = listed.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Verified short-lets in Nigeria",
        numberOfItems: listed.length,
        itemListElement: listed.map((p: any, i: number) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.name,
          url: absoluteUrl(`/property-details/${p.id}`),
        })),
      }
    : null;

  return (
    <HomeSearchProvider>
      <PageLayout
        children={
          <>
            {itemList && (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: toJsonLd(itemList) }}
              />
            )}

            {/* The header is fixed and every other route offsets itself with
                its own padding; the homepage had no offset at all, which is
                why the header floated over the hero. */}
            <div aria-hidden className="h-16 md:h-20" />

            <HomeSearchBar />
            <DestinationsRail tiles={destinations} />
            <Apartments initialProperties={initialProperties} />
          </>
        }
      />
    </HomeSearchProvider>
  );
};

export default HomePage;
