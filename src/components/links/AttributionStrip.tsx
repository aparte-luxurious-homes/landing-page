"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { API_BASE } from "@/lib/links/api";
import type { CatalogCardInfo } from "@/lib/links/types";

/** Same shape as HANDLE_REGEX in api-v1 services/links/reserved.py. */
const HANDLE = /^[a-z0-9][a-z0-9_-]{1,38}[a-z0-9]$/;

/**
 * "Shared by {host}" above a property that a guest reached from a host's
 * page (`?rs=@handle`), so the person who sent the link stays visible
 * through the funnel and there is a way back to the rest of their listings.
 *
 * A client island on purpose. The property route is the hottest page a
 * shared link lands on; reading searchParams in its server component would
 * make every visit dynamic, and the view below is client-fetched anyway.
 * Only catalog-origin visits carry `rs`, so organic traffic never fetches.
 * Renders nothing on any failure — the strip is never worth a broken page.
 */
export default function AttributionStrip() {
  const [host, setHost] = useState<CatalogCardInfo | null>(null);

  useEffect(() => {
    const rs = new URLSearchParams(window.location.search).get("rs") ?? "";
    if (!rs.startsWith("@")) return;
    const handle = rs.slice(1).toLowerCase();
    if (!HANDLE.test(handle)) return;

    const controller = new AbortController();
    fetch(`${API_BASE}/api/v1/public/catalogs/${encodeURIComponent(handle)}/card`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => body?.data && setHost(body.data as CatalogCardInfo))
      .catch(() => {
        /* best effort */
      });
    return () => controller.abort();
  }, []);

  if (!host) return null;

  const count = host.properties_listed;
  return (
    <Link
      href={`/@${host.handle}`}
      className="mb-4 flex min-h-[44px] items-center gap-3 rounded-xl border border-teal-soft bg-teal-soft/60 px-3 py-2 text-sm text-ink hover:bg-teal-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white">
        {host.profile_image ? (
          <img src={host.profile_image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-serif text-sm font-semibold text-teal">
            {host.display_name.charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">
        Shared by <strong className="font-semibold">{host.display_name}</strong>
        {host.is_verified && (
          <span className="ml-1 text-teal" title="Aparte has confirmed this host's identity" aria-label="verified host">
            ✓
          </span>
        )}
      </span>
      <span className="shrink-0 font-semibold text-teal">
        {count > 1 ? `All ${count} listings` : "Their page"}
      </span>
    </Link>
  );
}
