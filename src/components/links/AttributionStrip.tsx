import Image from "next/image";
import Link from "next/link";

import type { SharedBy } from "@/lib/links/types";

/** "Shared by" strip on a property viewed in catalog context (spec §2.3). */
export default function AttributionStrip({ sharedBy }: { sharedBy: SharedBy }) {
  return (
    <Link
      href={`/@${sharedBy.handle}`}
      className="mb-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm hover:bg-neutral-100"
    >
      <span className="relative h-8 w-8 overflow-hidden rounded-full bg-neutral-200">
        {sharedBy.profile_image && (
          <Image
            src={sharedBy.profile_image}
            alt=""
            fill
            sizes="32px"
            className="object-cover"
          />
        )}
      </span>
      <span className="text-neutral-700">
        Shared by <span className="font-semibold">{sharedBy.display_name}</span>
        {sharedBy.is_verified && (
          <span className="ml-1 text-brand" title="Identity verified">
            ✓
          </span>
        )}
      </span>
      <span className="ml-auto text-brand underline-offset-2 hover:underline">
        View all listings
      </span>
    </Link>
  );
}
