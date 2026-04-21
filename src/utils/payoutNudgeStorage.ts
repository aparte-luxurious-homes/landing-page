const SESSION_KEY = 'aparte_payout_bank_nudge_dismissed';

export const WALLET_BANK_DETAILS_PATH = '/account?tab=wallet&focus=bank';

export function isPayoutBankNudgeDismissedThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function setPayoutBankNudgeDismissedThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** Clears session dismissal so the nudge can appear again (new login or checkout entry). */
export function clearPayoutBankNudgeSessionDismissed(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function bookingShowsPayoutNudge(booking: unknown): boolean {
  if (!booking || typeof booking !== 'object') return false;
  return (booking as { should_show_payout_nudge?: boolean }).should_show_payout_nudge === true;
}
