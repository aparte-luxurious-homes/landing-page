// Support contact configuration.
//
// REPLACE WITH THE REAL APARTE SUPPORT NUMBER BEFORE LAUNCH.
// Format: country code + national number, NO leading + or 00.
// Nigeria example: "2348012345678" (i.e. +234 801 234 5678).
// Set to an empty string to hide the WhatsApp action and fall back to the
// drawer-only FAB behavior.
export const SUPPORT_WHATSAPP_NUMBER = "2348012345678"; // ← TODO: replace

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
