/**
 * Public path of a blog article. Articles live at the site root
 * (aparte.ng/{slug}), sharing that address space with Aparte Link property
 * slugs — see app/[slug]/page.tsx for how the two are told apart.
 * /blog/{slug} permanently redirects here.
 *
 * Build every article link with this, never by hand.
 */
export function blogArticlePath(slug: string): string {
  return `/${slug}`;
}
