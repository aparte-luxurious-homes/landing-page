import Image from "next/image";
import Link from "next/link";

import { formatNaira } from "@/lib/links/api";
import type { CatalogCard } from "@/lib/links/types";
import Stars from "./Stars";

/** Card on a catalog page. Links into /@{handle}/{slug} so the sharer's
 * referral context follows the guest (spec §2.3). */
export default function PropertyCard({
  card,
  handle,
}: {
  card: CatalogCard;
  handle: string;
}) {
  return (
    <Link
      href={`/@${handle}/${card.slug}`}
      className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-neutral-100">
        {card.hero_image ? (
          <Image
            src={card.hero_image}
            alt={card.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            No photo
          </div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug text-neutral-900">
            {card.name}
          </h3>
          <Stars rating={card.average_rating} count={card.review_count} />
        </div>
        <p className="text-sm text-neutral-500">
          {card.city}, {card.state} · {card.bedroom_count} bed ·{" "}
          {card.max_guests} guests
        </p>
        {card.price_from && (
          <p className="pt-1 text-sm">
            <span className="font-semibold text-brand">
              {formatNaira(card.price_from)}
            </span>{" "}
            <span className="text-neutral-500">/ night</span>
          </p>
        )}
      </div>
    </Link>
  );
}
