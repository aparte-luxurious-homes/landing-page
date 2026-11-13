'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * The installable app ships dark: unless NEXT_PUBLIC_PWA_ENABLED is "true" at
 * build time there is no service worker and no install banner. Switching it
 * off also unregisters a worker a visitor already has, so the flag is a real
 * kill switch and not just "stop offering it".
 */
const PWA_ENABLED = process.env.NEXT_PUBLIC_PWA_ENABLED === 'true';

const DISMISS_KEY = 'aparte:pwa-install-dismissed';
const DISMISS_DAYS = 5;
// Booking flow has its own fixed bottom bars; never stack an install banner on them.
const QUIET_PREFIXES = ['/property-details', '/confirm-booking', '/booking-validation', '/login', '/signup', '/otp'];

const recentlyDismissed = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return !!at && Date.now() - at < DISMISS_DAYS * 864e5;
  } catch {
    return false;
  }
};

/**
 * Registers the service worker (production only: it breaks HMR in dev) and
 * offers a dismissible "Install Aparte" banner — the native prompt on
 * Chrome/Android, an "Add to Home Screen" hint on iOS Safari.
 */
const PwaProvider: React.FC = () => {
  const pathname = usePathname() ?? '';
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (!PWA_ENABLED) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) =>
            regs
              .filter((r) => (r.active ?? r.waiting ?? r.installing)?.scriptURL.endsWith('/sw.js'))
              .forEach((r) => r.unregister())
          )
          .catch(() => {});
      }
      return;
    }
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone || recentlyDismissed()) return;

    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    if (isIos) setIosHint(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setIosHint(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage blocked: the banner just returns next visit */
    }
    setDeferred(null);
    setIosHint(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => undefined);
    setDeferred(null);
  };

  const quiet = QUIET_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!PWA_ENABLED || quiet || (!deferred && !iosHint)) return null;

  return (
    <div
      role="dialog"
      aria-label="Install Aparte"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        zIndex: 1300,
        maxWidth: 420,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 24,
        background: '#fff',
        boxShadow: '0 16px 40px -12px rgba(25,25,25,0.35)',
        border: '1px solid rgba(25,25,25,0.06)',
      }}
    >
      <img src="/icons/icon-192.png" alt="" width={44} height={44} style={{ borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.3 }}>
        <strong style={{ display: 'block', color: '#191919' }}>Install Aparte</strong>
        <span style={{ color: 'rgba(25,25,25,0.65)' }}>
          {deferred ? 'Faster access to your bookings.' : 'Tap Share, then “Add to Home Screen”.'}
        </span>
      </div>
      {deferred && (
        <button
          type="button"
          onClick={install}
          style={{ border: 0, cursor: 'pointer', borderRadius: 999, padding: '9px 16px', background: '#028090', color: '#fff', fontWeight: 700, fontSize: 14 }}
        >
          Install
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ border: 0, cursor: 'pointer', background: 'transparent', fontSize: 22, lineHeight: 1, color: 'rgba(25,25,25,0.5)', padding: 4 }}
      >
        ×
      </button>
    </div>
  );
};

export default PwaProvider;
