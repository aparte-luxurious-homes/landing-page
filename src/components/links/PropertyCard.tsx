import Link from "next/link";

import { formatNaira } from "@/lib/links/api";
import type { CatalogCard } from "@/lib/links/types";
import { discountBadge } from "@/utils/discounts";

import SmartImage from "./catalog/SmartImage";
import Stars from "./Stars";

interface PropertyCardProps {
  card: CatalogCard;
  handle: string;
  /** The host's referral code — travels on the link so a booking made on
   * the property page still credits them. */
  referralCode: string | null;
  size?: "default" | "featured";
  /** Above the fold on first paint — the first card or two on a phone. */
  priority?: boolean;
}

/** "2 bed, 2 bath, sleeps 4" — or "up to 200 guests" for a venue. */
function specLine(card: CatalogCard): string {
  if (card.property_type === "EVENT_CENTRE") return `Up to ${card.max_guests} guests`;
  const parts: string[] = [];
  if (card.bedroom_count > 0) parts.push(`${card.bedroom_count} bed`);
  if (card.bathroom_count > 0) parts.push(`${card.bathroom_count} bath`);
  if (card.max_guests > 0) parts.push(`sleeps ${card.max_guests}`);
  return parts.join(", ");
}

/**
 * Card on a host's page.
 *
 * Links straight at the real property page rather than an Aparte Link copy
 * of it — one property UI, not two. The sharer travels as `rs` and their
 * referral code as `ref`; the main site's ScrollToTop captures `ref` on
 * every navigation, which is how the code reaches the booking form.
 *
 * The second photo is rendered only from `md:` up and revealed on hover —
 * `hidden` (display:none) keeps a phone from ever fetching it.
 */
export default function PropertyCard({
  card,
  handle,
  referralCode,
  size = "default",
  priority = false,
}: PropertyCardProps) {
  const params = new URLSearchParams({ rs: `@${handle}` });
  if (referralCode) params.set("ref", referralCode);
  const href = `/property-details/${card.id}?${params.toString()}`;

  const [first, second] = card.media.length ? card.media : card.hero_image ? [card.hero_image] : [];
  const offer = discountBadge(card.discount_summary?.long_stay);
  const spec = specLine(card);
  const isEvent = card.property_type === "EVENT_CENTRE";
  const featured = size === "featured";

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      <div className={`relative bg-neutral-100 ${featured ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        {first ? (
          <>
            <SmartImage
              src={first}
              alt={card.name}
              priority={priority}
              sizes={
                featured
                  ? "(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 512px"
                  : "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 340px"
              }
            />
            {second && (
              <div className="absolute inset-0 hidden opacity-0 transition-opacity duration-200 group-hover:opacity-100 md:block">
                <SmartImage src={second} alt="" sizes="(max-width: 1200px) 50vw, 340px" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            Photos coming soon
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {offer && (
            <span className="rounded-full bg-teal px-2.5 py-1 text-xs font-semibold text-white">
              {offer}
            </span>
          )}
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink">
            {card.booking_mode === "REQUEST_TO_BOOK" ? "Request to book" : "Instant book"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className={`line-clamp-2 font-semibold leading-snug text-ink ${featured ? "text-lg" : ""}`}>
          {card.name}
        </h3>
        <p className="mt-1 text-sm text-neutral-500">
          {[card.city, card.state].filter(Boolean).join(", ")}
        </p>
        {spec && <p className="mt-1 text-sm text-neutral-500">{spec}</p>}
        <div className="mt-3 flex items-end justify-between gap-3">
          {card.price_from ? (
            <p className="text-sm text-neutral-500">
              from{" "}
              <span className="text-base font-semibold text-teal">{formatNaira(card.price_from)}</span>
              {isEvent ? " a day" : " a night"}
            </p>
          ) : (
            <span />
          )}
          <Stars rating={card.average_rating} count={card.review_count} />
        </div>
      </div>
    </Link>
  );
}
