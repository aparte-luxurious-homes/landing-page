const PREFIX = 'aparte_payout_nudge_';

export function setPayoutNudgePendingForBooking(bookingId: string) {
  if (!bookingId) return;
  sessionStorage.setItem(`${PREFIX}pending_${bookingId}`, '1');
}

export function isPayoutNudgePendingForBooking(bookingId: string | null | undefined): boolean {
  if (!bookingId) return false;
  return sessionStorage.getItem(`${PREFIX}pending_${bookingId}`) == '1';
}

export function isPayoutNudgeModalDismissedForBooking(bookingId: string | null | undefined): boolean {
  if (!bookingId) return false;
  return sessionStorage.getItem(`${PREFIX}modal_dismissed_${bookingId}`) === '1';
}

export function setPayoutNudgeModalDismissedForBooking(bookingId: string) {
  if (!bookingId) return;
  sessionStorage.setItem(`${PREFIX}modal_dismissed_${bookingId}`, '1');
}

const PROFILE_BANNER_KEY = `${PREFIX}profile_banner_dismissed`;

export function isProfilePayoutBannerDismissed(): boolean {
  return sessionStorage.getItem(PROFILE_BANNER_KEY) === '1';
}

export function setProfilePayoutBannerDismissed() {
  sessionStorage.setItem(PROFILE_BANNER_KEY, '1');
}

export function readShouldShowPayoutNudgeFromCreateBooking(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false;
  const r = response as Record<string, unknown>;
  const data = r.data as Record<string, unknown> | undefined;
  return Boolean(r.should_show_payout_nudge ?? data?.should_show_payout_nudge);
}
