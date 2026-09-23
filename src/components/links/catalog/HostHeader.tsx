import type { PublicCatalog } from "@/lib/links/types";

import ExpandableText from "./ExpandableText";
import ShareButton from "./ShareButton";
import WhatsAppLink from "./WhatsAppLink";

interface HostHeaderProps {
  catalog: PublicCatalog;
  /** Absolute URL of this page, for the share sheet. */
  pageUrl: string;
}

/** "Lekki, Ikoyi and Abuja" — and "+2 more" past three. */
function placesLine(cities: { name: string }[]): string | null {
  const names = cities.map((c) => c.name).filter(Boolean);
  if (!names.length) return null;
  const shown = names.slice(0, 3);
  const rest = names.length - shown.length;
  const joined =
    shown.length === 1
      ? shown[0]
      : `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
  return rest > 0 ? `${joined}, +${rest} more` : joined;
}

/**
 * Who this is and why to trust them, in that order.
 *
 * The facts row is deliberately not four cards: it is a hairline and four
 * figures set in the display face, with plain sentence-case labels. Every
 * slot always has something positive to say — a host with no reviews yet
 * gets "Refundable caution fee" there, not "No reviews".
 */
export default function HostHeader({ catalog, pageUrl }: HostHeaderProps) {
  const places = placesLine(catalog.cities);
  const { stats } = catalog;
  const bio = catalog.bio?.trim();

  // The pill above the headline already says "Verified", so the fourth
  // fact carries the other promise instead of repeating it.
  const facts: { value: string; label: string }[] = [
    {
      value: String(stats.properties_listed),
      label: stats.properties_listed === 1 ? "place to stay" : "places to stay",
    },
    {
      value: String(stats.cities_count),
      label: stats.cities_count === 1 ? "city" : "cities",
    },
    stats.review_count > 0
      ? {
          value: `${stats.average_rating.toFixed(1)} of 5`,
          label: `from ${stats.review_count} guest review${stats.review_count === 1 ? "" : "s"}`,
        }
      : { value: "Refundable", label: "caution fee on every stay" },
    { value: "Held", label: "payment held by Aparte until you check in" },
  ];

  // A host who wrote a headline has said where they let; the line under it
  // then only adds tenure. Without one, it says the places for them.
  const subline = [
    catalog.headline ? null : places ? `Short-lets in ${places}` : "Short-lets on Aparte",
    catalog.member_since ? `hosting on Aparte since ${catalog.member_since}` : null,
  ].filter(Boolean);

  return (
    <header className="mt-4 sm:pl-8">
      <div className="md:flex md:items-start md:justify-between md:gap-8">
        <div className="min-w-0">
          {/* Badges sit OUTSIDE the h1. Inside it, a screen reader announced
              the page heading as "Ada Obi ✓ Verified". */}
          <h1 className="font-serif text-3xl font-semibold leading-tight text-ink md:text-4xl">
            {catalog.display_name}
          </h1>

          {/* Only the positive is stated. This is the page a host sends to
              win business; "identity verification pending" on it published an
              accusation about them to their own prospects. Absence says the
              same thing without the sentence. */}
          {catalog.is_verified && (
            <span
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal"
              title="Aparte has confirmed this host's identity"
            >
              <span aria-hidden>✓</span> Verified host
            </span>
          )}

          {catalog.headline && (
            <p className="mt-3 text-lg leading-snug text-neutral-700">{catalog.headline}</p>
          )}

          {subline.length > 0 && (
            <p className="mt-2 text-sm text-neutral-500">
              {subline.join(", ").replace(/^hosting/, "Hosting")}
            </p>
          )}
        </div>

        {/* Desktop actions; on a phone the same two live in the bottom bar. */}
        <div className="mt-5 hidden shrink-0 gap-3 md:mt-1 md:flex">
          {catalog.whatsapp_url && <WhatsAppLink href={catalog.whatsapp_url} />}
          <ShareButton title={`${catalog.display_name} on Aparte`} url={pageUrl} />
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-neutral-200 pt-5 sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col-reverse justify-end">
            <dt className="mt-0.5 text-sm text-neutral-500">{fact.label}</dt>
            <dd className="font-serif text-2xl font-semibold leading-none text-ink">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      {bio &&
        (bio.length > 280 ? (
          <ExpandableText text={bio} className="mt-6 max-w-3xl text-neutral-700" />
        ) : (
          <p className="mt-6 max-w-3xl whitespace-pre-line text-neutral-700">{bio}</p>
        ))}
    </header>
  );
}
