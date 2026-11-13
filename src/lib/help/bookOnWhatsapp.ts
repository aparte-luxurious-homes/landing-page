/**
 * Pre-filled message for the "Book on WhatsApp" CTAs, which open a chat with
 * the Aparte booking bot (NEXT_PUBLIC_WHATSAPP_BOT_NUMBER), not a human.
 *
 * The format is a contract with the bot (api-v1 services/whatsapp/slots.py):
 *
 *   Book APT-<slug>[ <dates>][, <n> guest(s)]
 *
 *   dates, same month:      "20-23 Dec"
 *   dates, across months:   "30 Dec-2 Jan"
 *
 * e.g. "Book APT-ikoyi-2-bed-4f2a 20-23 Dec, 4 guests". The bot recognises the
 * `APT-<slug>` code and jumps straight to that property, then reads the dates
 * and guest count as if the guest had typed them. Change the format here and
 * in the bot together.
 *
 * Without a slug the property name goes in as plain text (the bot then
 * searches for it); with neither the guest just opens a booking chat.
 */

import { format } from 'date-fns';
import { botWhatsappUrl, WHATSAPP_BOT_MESSAGE } from './support';

export interface BookOnWhatsappContext {
  slug?: string | null;
  propertyName?: string | null;
  checkIn?: Date | null;
  checkOut?: Date | null;
  guests?: number | null;
}

const isValidDate = (value: Date | null | undefined): value is Date =>
  !!value && !Number.isNaN(value.getTime());

/** "20-23 Dec" or "30 Dec-2 Jan"; null unless both dates are set. */
export function formatStayRange(
  checkIn?: Date | null,
  checkOut?: Date | null
): string | null {
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) return null;
  const sameMonth =
    checkIn.getMonth() === checkOut.getMonth() &&
    checkIn.getFullYear() === checkOut.getFullYear();
  return sameMonth
    ? `${format(checkIn, 'd')}-${format(checkOut, 'd MMM')}`
    : `${format(checkIn, 'd MMM')}-${format(checkOut, 'd MMM')}`;
}

export function bookOnWhatsappMessage(ctx: BookOnWhatsappContext = {}): string {
  const slug = ctx.slug?.trim();
  const name = ctx.propertyName?.trim();

  const head = slug
    ? `Book APT-${slug}`
    : name
      ? `Book ${name}`
      : WHATSAPP_BOT_MESSAGE;

  let message = head;
  const range = formatStayRange(ctx.checkIn, ctx.checkOut);
  if (range) message += ` ${range}`;
  if (ctx.guests && ctx.guests > 0) {
    message += `, ${ctx.guests} guest${ctx.guests === 1 ? '' : 's'}`;
  }
  return message;
}

/** Ready-to-open wa.me URL to the booking bot. */
export function bookOnWhatsappUrl(ctx: BookOnWhatsappContext = {}): string {
  return botWhatsappUrl(bookOnWhatsappMessage(ctx));
}
