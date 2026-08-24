// Help-center event tracking. Forwards to GA4 via the shared analytics layer
// (no-op in dev / until the visitor grants consent).

import { trackEvent } from "@/analytics";

type EventName =
  | "help_opened"
  | "help_searched"
  | "help_article_viewed"
  | "help_helpful_voted"
  | "help_contact_clicked"
  | "help_dismissed";

interface EventProps {
  [key: string]: string | number | boolean | undefined;
}

export function trackHelpEvent(name: EventName, props: EventProps = {}): void {
  if (typeof window === "undefined") return;
  if ((process.env.NODE_ENV !== 'production')) {
    console.log(`[help-analytics] ${name}`, props);
  }
  trackEvent(name, props);
}
