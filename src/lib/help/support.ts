// Support contact configuration.
//
// The number is read from VITE_SUPPORT_WHATSAPP_NUMBER so staging can point at
// a test line while production uses the real business number — without a code
// change. The constant below is only a fallback.
//
// Format: country code + national number, NO leading + or 00.
// Nigeria example: "2348012345678" (i.e. +234 801 234 5678).
//
// When neither is set, hasWhatsappSupport() returns false and every WhatsApp
// affordance hides itself rather than deep-linking to a dead number.
const FALLBACK_WHATSAPP_NUMBER = ""; // ← set VITE_SUPPORT_WHATSAPP_NUMBER instead

export const SUPPORT_WHATSAPP_NUMBER = (
  (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER as string | undefined) ?? ""
).trim() || FALLBACK_WHATSAPP_NUMBER;

export const SUPPORT_WHATSAPP_MESSAGE =
  "Hi! I'd like some help with Aparte.";

export const SUPPORT_EMAIL = "support@aparte.ng";

/** True when a WhatsApp number is configured. */
export function hasWhatsappSupport(): boolean {
  return SUPPORT_WHATSAPP_NUMBER.trim().length >= 10;
}

/** Build a wa.me deep-link with a pre-filled message. */
export function whatsappUrl(message: string = SUPPORT_WHATSAPP_MESSAGE): string {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
