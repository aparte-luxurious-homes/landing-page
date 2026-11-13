import { fetchCityStock, fetchTypeStock } from "@/lib/seo/cityStock";

/**
 * GET /stock.json — verified listing counts per city page and per property-type
 * page, for client components that link to them (the footer).
 *
 * `null` means the count could not be read; clients treat it as live, like the
 * server does (lib/seo/cityStock). Cached for an hour, the same upstream
 * entries the city pages and the homepage rail already use.
 */
export const revalidate = 3600;

export async function GET() {
  const [cities, types] = await Promise.all([fetchCityStock(), fetchTypeStock()]);
  return Response.json(
    { cities, types },
    { headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" } }
  );
}
