import Link from "next/link";

import { formatNaira } from "@/lib/links/api";
import type { PublicProperty } from "@/lib/links/types";
import AttributionStrip from "./AttributionStrip";
import Gallery from "./Gallery";
import Stars from "./Stars";

/** Full property page body, shared by the plain and catalog-context routes.
 * Above the fold (spec §7.4): hero, name+city, rating, starting price, CTA.
 */
export default function PropertyView({
  property,
  bookHref,
}: {
  property: PublicProperty;
  bookHref: string;
}) {
  const prices = property.units
    .map((u) => u.price_per_night)
    .filter((p) => p > 0);
  const priceFrom = prices.length ? Math.min(...prices) : null;
  const welcome =
    typeof property.link_config?.welcome_message === "string"
      ? (property.link_config.welcome_message as string)
      : null;

  return (
    <article className="pb-24">
      {property.shared_by && <AttributionStrip sharedBy={property.shared_by} />}

      <Gallery media={property.media} alt={property.name} />

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-tight">{property.name}</h1>
          <p className="mt-1 text-neutral-500">
            {property.city}, {property.state}
          </p>
          <Stars
            rating={property.average_rating}
            count={property.total_reviews}
            className="mt-1"
          />
        </div>
        {priceFrom !== null && (
          <div className="rounded-xl bg-brand/5 px-4 py-2 text-right">
            <p className="text-lg font-bold text-brand">
              {formatNaira(priceFrom)}
            </p>
            <p className="text-xs text-neutral-500">from / night</p>
          </div>
        )}
      </div>

      {welcome && (
        <p className="mt-4 rounded-xl bg-accent/10 px-4 py-3 text-sm text-neutral-700">
          {welcome}
        </p>
      )}

      {property.description && (
        <section className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">About this place</h2>
          <p className="whitespace-pre-line text-neutral-700">
            {property.description}
          </p>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Units</h2>
        <div className="space-y-3">
          {property.units.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 p-4"
            >
              <div>
                <p className="font-medium">{u.name ?? "Unit"}</p>
                <p className="text-sm text-neutral-500">
                  {u.bedroom_count ?? 0} bed · {u.bathroom_count ?? 0} bath ·
                  up to {u.max_guests} guests
                  {u.caution_fee > 0 &&
                    ` · ${formatNaira(u.caution_fee)} refundable caution`}
                </p>
              </div>
              <p className="font-semibold text-brand">
                {formatNaira(u.price_per_night)}
                <span className="text-xs font-normal text-neutral-500"> / night</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {property.amenities.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">Amenities</h2>
          <ul className="flex flex-wrap gap-2">
            {property.amenities.map((a) => (
              <li
                key={a.id}
                className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700"
              >
                {a.name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {property.rules && (
        <section className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">House rules</h2>
          <p className="whitespace-pre-line text-sm text-neutral-700">
            {property.rules}
          </p>
        </section>
      )}

      {property.location_visibility === "APPROXIMATE" && (
        <p className="mt-6 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
          📍 Approximate location. The exact address is shared with you after
          your booking is confirmed.
        </p>
      )}

      {property.host && (
        <section className="mt-6 flex items-center gap-3 text-sm text-neutral-600">
          <span className="font-medium">Hosted by {property.host.display_name}</span>
          {property.host.joined_year && (
            <span className="text-neutral-400">
              · on Aparte since {property.host.joined_year}
            </span>
          )}
        </section>
      )}

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <div className="text-sm">
            {priceFrom !== null && (
              <>
                <span className="font-bold text-brand">
                  {formatNaira(priceFrom)}
                </span>{" "}
                <span className="text-neutral-500">/ night</span>
              </>
            )}
          </div>
          <Link
            href={bookHref}
            className="rounded-xl bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {property.booking_mode === "REQUEST_TO_BOOK"
              ? "Request to book"
              : "Check availability"}
          </Link>
        </div>
      </div>
    </article>
  );
}
