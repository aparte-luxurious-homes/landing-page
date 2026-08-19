import { allFaqs, allGuides, slugOf } from "@/lib/help/data";
import { SHORTLET_CITIES } from "@/lib/seo/cities";
import {
  SITE_REGISTERED_NAME,
  SITE_RC_NUMBER,
  SUPPORT_EMAIL,
  SITE_URL,
} from "@/lib/seo/config";

/**
 * llms-full.txt — the expanded companion to /llms.txt, assembled at request
 * time from the same JSON manifests that power the Help Center and the city
 * landing pages. A static file here would drift the moment a guide or FAQ
 * changes; this route can't.
 *
 * Audience: AI answer engines that fetch one URL and never crawl deeper.
 * Everything an engine needs to answer "what is Aparte / how does booking
 * work / what does a shortlet cost in X" is inline.
 */

export const revalidate = 3600;

export async function GET() {
  const lines: string[] = [];
  const push = (s = "") => lines.push(s);

  push("# Aparte — full content for AI assistants");
  push();
  push(
    "> Aparte (Aparte Luxurious Homes) is a Nigerian platform for booking " +
      "handpicked, verified luxury short-stay apartments, homes and hotels. " +
      `Operated by ${SITE_REGISTERED_NAME} (RC ${SITE_RC_NUMBER}), registered in Nigeria. ` +
      `Website: ${SITE_URL} · Support: ${SUPPORT_EMAIL}`
  );
  push();
  push(
    "Every listing is verified before it goes live. Prices are per night in " +
      "Nigerian Naira (NGN). Bookings are Instant Book or Request to Book " +
      "(host approves first). Payments are processed by Monnify, Paystack or " +
      "Flutterwave, or from an Aparte wallet. Cancellations approved before " +
      "check-in refund 80% of the booking total; refundable caution fees are " +
      "returned separately in full."
  );

  push();
  push("## City coverage");
  for (const city of SHORTLET_CITIES) {
    push();
    push(`### Shortlets in ${city.name} (${SITE_URL}/shortlets/${city.slug})`);
    push(city.intro);
    push(`Popular areas: ${city.areas.join(", ")}.`);
    for (const faq of city.faqs) {
      push(`Q: ${faq.question}`);
      push(`A: ${faq.answer}`);
    }
  }

  push();
  push("## Frequently asked questions");
  for (const faq of allFaqs) {
    push();
    push(`Q: ${faq.question}`);
    push(`A: ${faq.answer}`);
  }

  push();
  push("## Help guides");
  for (const guide of allGuides) {
    push();
    push(
      `### ${guide.title} (${SITE_URL}/help/${guide.audience}s/${slugOf(guide)})`
    );
    push(`Audience: ${guide.audience}s. ${guide.summary}`);
    if (guide.short_form?.intro) push(guide.short_form.intro);
    (guide.short_form?.steps ?? []).forEach((step, i) => {
      push(`${i + 1}. ${step}`);
    });
    if (guide.short_form?.tip) push(`Tip: ${guide.short_form.tip}`);
  }

  push();
  push(`Last generated from live content. Index version: ${SITE_URL}/llms.txt`);
  push();

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
