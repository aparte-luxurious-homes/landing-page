import { WHATSAPP_BOT_NUMBER as RAW_WHATSAPP_BOT_NUMBER } from "@/config/env";

// Support contact configuration.
//
// The number is read from NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER so staging can point at
// a test line while production uses the real business number — without a code
// change. The constant below is only a fallback.
//
// Format: country code + national number, NO leading + or 00.
// Nigeria example: "2348012345678" (i.e. +234 801 234 5678).
//
// When neither is set, hasWhatsappSupport() returns false and every WhatsApp
// affordance hides itself rather than deep-linking to a dead number.
const FALLBACK_WHATSAPP_NUMBER = ""; // ← set NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER instead

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

// ---------------------------------------------------------------------------
// Booking bot ("Aparte on WhatsApp").
//
// A separate WhatsApp Cloud API number from the human support line above: the
// bot takes a guest from "I'd like to book" to a payment link without a person
// in the loop. Read from NEXT_PUBLIC_WHATSAPP_BOT_NUMBER, same format as the
// support number (country code + national number, no leading + or 00). When
// it is unset, hasWhatsappBot() returns false and every "Book on WhatsApp"
// affordance hides itself.
// ---------------------------------------------------------------------------

export const WHATSAPP_BOT_NUMBER = RAW_WHATSAPP_BOT_NUMBER.replace(/\D/g, "");

export const WHATSAPP_BOT_MESSAGE = "Hi Aparte, I'd like to book a stay";

/** True when a booking-bot WhatsApp number is configured. */
export function hasWhatsappBot(): boolean {
  return WHATSAPP_BOT_NUMBER.length >= 10;
}

/** Build a wa.me deep-link to the booking bot, optionally pre-filled. */
export function botWhatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_BOT_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
