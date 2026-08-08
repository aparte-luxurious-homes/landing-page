/**
 * Pre-filled WhatsApp message for the "Speak with a human" CTA.
 *
 * The point is that whoever picks up the chat already knows which stay is
 * being asked about — property, unit, dates, guests and price — instead of
 * opening with "which property?".
 *
 * Every line is optional: a guest who hasn't picked dates yet still gets a
 * coherent message rather than "Dates: undefined".
 */

import { format } from 'date-fns';
import { whatsappUrl } from './support';

export interface BookingEnquiryContext {
  propertyName?: string | null;
  propertyId?: string | null;
  unitName?: string | null;
  checkInDate?: Date | null;
  checkOutDate?: Date | null;
  nights?: number | null;
  guests?: number | null;
  units?: number | null;
  /** Total the guest is being shown, in naira. */
  total?: number | string | null;
  city?: string | null;
}

/** WhatsApp truncates very long prefills; keep well inside that. */
const MAX_MESSAGE_CHARS = 900;

const formatNaira = (value: number | string | null | undefined): string | null => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return `₦${Math.round(numeric).toLocaleString('en-NG')}`;
};

const formatDate = (value: Date | null | undefined): string | null => {
  if (!value || Number.isNaN(value.getTime())) return null;
  return format(value, 'd MMM yyyy');
};

const propertyUrl = (propertyId?: string | null): string | null => {
  if (!propertyId) return null;
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://aparte.ng';
  return `${origin}/property-details/${propertyId}`;
};

export function buildBookingEnquiryMessage(ctx: BookingEnquiryContext): string {
  const lines: string[] = ["Hi Aparte — I'd like help with this stay:", ''];

  const propertyLabel = [ctx.propertyName, ctx.city].filter(Boolean).join(', ');
  if (propertyLabel) lines.push(`• Property: ${propertyLabel}`);
  if (ctx.unitName) lines.push(`• Unit: ${ctx.unitName}`);

  const checkIn = formatDate(ctx.checkInDate);
  const checkOut = formatDate(ctx.checkOutDate);
  if (checkIn && checkOut) {
    const nights = ctx.nights && ctx.nights > 0
      ? ` (${ctx.nights} night${ctx.nights === 1 ? '' : 's'})`
      : '';
    lines.push(`• Dates: ${checkIn} – ${checkOut}${nights}`);
  }

  const occupancy: string[] = [];
  if (ctx.guests && ctx.guests > 0) {
    occupancy.push(`${ctx.guests} guest${ctx.guests === 1 ? '' : 's'}`);
  }
  if (ctx.units && ctx.units > 1) occupancy.push(`${ctx.units} units`);
  if (occupancy.length) lines.push(`• ${occupancy.join('  •  ')}`);

  const total = formatNaira(ctx.total);
  if (total) lines.push(`• Total: ${total}`);

  const link = propertyUrl(ctx.propertyId);
  if (link) lines.push(`• Link: ${link}`);

  lines.push('', 'Could someone assist me?');

  const message = lines.join('\n');
  return message.length > MAX_MESSAGE_CHARS
    ? `${message.slice(0, MAX_MESSAGE_CHARS - 1)}…`
    : message;
}

/** Ready-to-open wa.me URL for a booking enquiry. */
export function bookingEnquiryUrl(ctx: BookingEnquiryContext): string {
  return whatsappUrl(buildBookingEnquiryMessage(ctx));
}
