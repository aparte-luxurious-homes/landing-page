"use client";

/** Fire-and-forget pageview beacon (spec §6.1.4).
 *
 * Mounted once per public page. Captures URL attribution into sessionStorage
 * (first-touch), optionally seeds a catalog sharer's referral code, then
 * POSTs the view. Errors are swallowed — analytics must never break a page.
 */

import { useEffect } from "react";

import { API_BASE } from "@/lib/links/api";
import { captureAttribution, seedReferralCode } from "@/lib/links/attribution";

interface BeaconProps {
  page: "property" | "catalog";
  /** Property slug or catalog handle. */
  target: string;
  /** Referral code of the catalog sharer, when viewing in catalog context. */
  sharerCode?: string | null;
}

export default function Beacon({ page, target, sharerCode }: BeaconProps) {
  useEffect(() => {
    const attribution = captureAttribution(
      new URLSearchParams(window.location.search)
    );
    seedReferralCode(sharerCode);

    const path =
      page === "property"
        ? `properties/${encodeURIComponent(target)}`
        : `catalogs/${encodeURIComponent(target)}`;

    fetch(`${API_BASE}/api/v1/public/${path}/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        referrer_source: attribution.referrer_source,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        short_link_code: attribution.short_link_code,
        ref: attribution.ref ?? sharerCode ?? undefined,
        referrer_url: document.referrer || undefined,
      }),
    }).catch(() => {
      /* beacon is best-effort */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, target]);

  return null;
}
