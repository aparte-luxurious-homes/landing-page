import { NextResponse } from "next/server";

import { SITE_URL } from "@/config/env";
import { resolveShortLink } from "@/lib/links/api";

export const dynamic = "force-dynamic";

/**
 * Short-link redirect — aparte.ng/s/{code} (spec §6.1.5).
 *
 * The API resolves the target and atomically counts the click; we 302 with
 * the link's baked-in attribution as URL params so the landing page's beacon
 * picks them up.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const target = await resolveShortLink(code).catch(() => null);

  const base = SITE_URL || "https://aparte.ng";
  if (!target) {
    return NextResponse.redirect(new URL("/", base), 302);
  }

  const dest =
    target.target_type === "PROPERTY" && target.property_slug
      ? `/${target.property_slug}`
      : target.catalog_handle
        ? `/@${target.catalog_handle}`
        : "/";

  const url = new URL(dest, base);
  if (target.referrer_source) url.searchParams.set("rs", target.referrer_source);
  if (target.utm_source) url.searchParams.set("utm_source", target.utm_source);
  if (target.utm_medium) url.searchParams.set("utm_medium", target.utm_medium);
  if (target.utm_campaign)
    url.searchParams.set("utm_campaign", target.utm_campaign);
  url.searchParams.set("_sl", target.code);

  return NextResponse.redirect(url, 302);
}
