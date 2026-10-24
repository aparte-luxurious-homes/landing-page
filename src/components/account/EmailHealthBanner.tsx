'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from '@/lib/router';
import { useGetProfileQuery, usePatchProfileMutation } from '../../api/profileApi';
import { useAppSelector } from '../../hooks';
import {
  dismissEmailHealth,
  emailChangeErrorMessage,
  isEmailFailing,
  isEmailHealthDismissed,
  readEmailHealth,
} from '../../lib/email-health';
import { maskEmail } from '../../lib/email-check';
import { SKIP_PATHS } from '../RequireCompleteProfile';
import ConfirmEmailChangeDialog from './ConfirmEmailChangeDialog';

const UPDATE_EMAIL_PATH = '/account?tab=profile&focus=email';

interface EmailHealthBannerProps {
  /**
   * "banner" — full-width, inside the account page.
   * "notice" — the slim floating card shown on every other page.
   */
  variant: 'banner' | 'notice';
}

/**
 * Tells a signed-in person that the email on their account isn't receiving
 * mail, and gets them to fix it.
 *
 * Without this they never find out: bounced booking confirmations and
 * receipts fail silently, and the first sign of trouble is a guest at the
 * door with nothing in their inbox. The API sets email_status from Postmark
 * bounce events; this reads it off GET /profile (already fetched for every
 * signed-in visitor by RequireCompleteProfile, so this costs no request).
 *
 * Dismissible for the browser session. When the API has a likely correction
 * (email_suggestion), it is offered as a one-tap fix behind the same
 * confirmation step the profile form uses.
 */
export default function EmailHealthBanner({ variant }: EmailHealthBannerProps) {
  const auth = useAppSelector((state) => state.root.auth);
  const isAuthenticated = !!(auth?.isAuthenticated && auth?.token);
  const { data } = useGetProfileQuery(undefined, { skip: !isAuthenticated });
  const [patchProfile, { isLoading: saving }] = usePatchProfileMutation();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const email = data?.data?.email ?? null;
  const health = readEmailHealth(data?.data);

  // Read storage after mount only, so server and first client render agree.
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(isEmailHealthDismissed(email));
  }, [email]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!isAuthenticated || !email || !isEmailFailing(health) || dismissed) return null;

  if (variant === 'notice') {
    // Not on sign-in / sign-up / profile-completion screens, and not on the
    // account page, which shows the full banner instead. Property and host
    // pages pin their own bottom bars, which this would sit on top of.
    const onAccount = pathname.startsWith('/account');
    const onSkipped = SKIP_PATHS.some((p) => pathname.startsWith(p));
    const hasBottomBar =
      pathname.startsWith('/property-details') ||
      pathname.startsWith('/@') ||
      pathname.startsWith('/catalog/');
    if (onAccount || onSkipped || hasBottomBar) return null;
  }

  const masked = maskEmail(email);
  const suggestion =
    health.suggestion && health.suggestion.trim().toLowerCase() !== email.trim().toLowerCase()
      ? health.suggestion
      : null;
  const headline =
    health.status === 'UNDELIVERABLE'
      ? `Emails to ${masked} aren't reaching you.`
      : `Some emails to ${masked} haven't reached you.`;

  const dismiss = () => {
    dismissEmailHealth(email);
    setDismissed(true);
  };

  const goToProfile = () => navigate(UPDATE_EMAIL_PATH);

  const applySuggestion = async () => {
    if (!suggestion) return;
    setSaveError(null);
    try {
      // invalidates 'Profile' → GET /profile refetches and this banner clears.
      await patchProfile({ email: suggestion }).unwrap();
      setConfirmOpen(false);
      toast.success(`Your email is now ${suggestion}.`);
    } catch (err) {
      setSaveError(emailChangeErrorMessage(err));
    }
  };

  const dialog = suggestion ? (
    <ConfirmEmailChangeDialog
      open={confirmOpen}
      email={suggestion}
      saving={saving}
      error={saveError}
      onCancel={() => {
        setConfirmOpen(false);
        setSaveError(null);
      }}
      onConfirm={applySuggestion}
    />
  ) : null;

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {suggestion && (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-lg bg-[#028090] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#026d7a]"
        >
          Use {suggestion}
        </button>
      )}
      <button
        type="button"
        onClick={goToProfile}
        className={
          suggestion
            ? 'rounded-lg px-3 py-1.5 text-sm font-semibold text-[#028090] ring-1 ring-[#028090]/40 hover:bg-[#028090]/5'
            : 'rounded-lg bg-[#028090] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#026d7a]'
        }
      >
        Update email
      </button>
      <button
        type="button"
        onClick={dismiss}
        className="rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
      >
        Not now
      </button>
    </div>
  );

  if (variant === 'notice') {
    return (
      <>
        <div
          role="status"
          className="fixed bottom-20 left-4 right-20 z-40 rounded-xl border border-amber-200 bg-[#fdf3e4] p-3 shadow-lg sm:bottom-4 sm:right-auto sm:max-w-sm"
        >
          <p className="mb-2 text-sm leading-snug text-[#13272b]">
            <span className="font-semibold">{headline}</span> Update your email so you get booking
            confirmations and receipts.
          </p>
          {actions}
        </div>
        {dialog}
      </>
    );
  }

  return (
    <>
      <div
        role="status"
        className="mb-4 rounded-2xl border border-amber-200 bg-[#fdf3e4] p-4 sm:flex sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="mb-3 sm:mb-0">
          <p className="text-sm font-semibold text-[#13272b]">{headline}</p>
          <p className="mt-0.5 text-sm text-[#5b6f72]">
            {health.reason ? `${health.reason} ` : ''}
            Update your email so you get booking confirmations and receipts.
          </p>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      {dialog}
    </>
  );
}
