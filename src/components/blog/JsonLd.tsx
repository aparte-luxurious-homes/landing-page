import { toJsonLd } from "@/lib/seo/jsonLd";

/**
 * Structured data blocks for Google. Escaped by toJsonLd: article titles and
 * summaries are staff-written free text that ends up inside a <script>.
 */
export function JsonLdScripts({ blocks }: { blocks: (Record<string, unknown> | null)[] }) {
  return (
    <>
      {blocks
        .filter((b): b is Record<string, unknown> => Boolean(b))
        .map((block, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLd(block) }} />
        ))}
    </>
  );
}
