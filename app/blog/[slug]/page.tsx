import { permanentRedirect } from "next/navigation";

import { blogArticlePath } from "@/lib/blog/paths";

/**
 * aparte.ng/blog/{slug} — the old article address. Articles now live at
 * aparte.ng/{slug} (app/[slug]/page.tsx); this forwards permanently so links
 * already shared, indexed or emailed keep working and search engines
 * consolidate onto the new URL.
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function OldBlogArticleRedirect({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(blogArticlePath(slug));
}
