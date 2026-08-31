'use client';

import { useEffect } from 'react';
import mixpanel from 'mixpanel-browser';
import {
  MIXPANEL_TOKEN as MIXPANEL_TOKEN_FALLBACK,
  MIXPANEL_TOKEN_DEVELOPMENT,
  MIXPANEL_TOKEN_PRODUCTION,
} from '@/config/env';
import { isConsentGranted, onConsentChange } from '@/analytics/consent';

const IS_PROD = process.env.NODE_ENV === 'production';

const MIXPANEL_TOKEN =
  (IS_PROD ? MIXPANEL_TOKEN_PRODUCTION : MIXPANEL_TOKEN_DEVELOPMENT) ||
  MIXPANEL_TOKEN_DEVELOPMENT ||
  MIXPANEL_TOKEN_PRODUCTION ||
  MIXPANEL_TOKEN_FALLBACK;

let initialized = false;

/** True when a token is present, in any environment. */
export function isMixpanelConfigured(): boolean {
  return Boolean(MIXPANEL_TOKEN);
}

/**
 * Every public entry point funnels through here, so this is the one place the
 * consent gate has to live.
 *
 * Mixpanel used to initialise unconditionally from app/providers.tsx while GA4
 * and Clarity waited for consent. With `persistence: 'localStorage'` that meant
 * an identifier was written for every visitor before they answered the banner —
 * contradicting the policy stated in analytics/consent.ts and defeating the
 * point of having a banner at all.
 *
 * The gate is unconditional rather than production-only on purpose. Privacy
 * behaviour that varies by environment is exactly how the wrong variant ships;
 * the cost is that a developer accepts the banner once per browser, and then
 * sees the same flow a visitor sees.
 */
function ensureInit() {
  if (initialized || typeof window === 'undefined' || !MIXPANEL_TOKEN) return;
  if (!isConsentGranted()) return;
  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: false,
    track_pageview: false,
    record_sessions_percent: 0,
    debug: !IS_PROD,
    persistence: 'localStorage',
  });
  initialized = true;
}

/** Public entry point for the consent banner's Accept handler. */
export function initMixpanel() {
  ensureInit();
}

/**
 * Inits Mixpanel once consent allows it. Only events you call via trackEvent
 * are sent.
 *
 * Subscribing to consent matters: on a first visit this effect runs while the
 * banner is still unanswered, so a mount-only init would silently skip every
 * visitor who accepts — they would be tracked from their *second* visit onward.
 */
export default function MixpanelInit() {
  useEffect(() => {
    if (!MIXPANEL_TOKEN && !IS_PROD) {
      console.warn(
        '[mixpanel] No token. Set NEXT_PUBLIC_MIXPANEL_TOKEN_DEVELOPMENT in .env and restart next dev.'
      );
      return;
    }
    ensureInit();
    return onConsentChange((value) => {
      if (value === 'granted') ensureInit();
    });
  }, []);
  return null;
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined' || !MIXPANEL_TOKEN) return;
  ensureInit();
  if (!initialized) return; // consent not granted — drop it, don't buffer it
  mixpanel.track(eventName, properties, { send_immediately: true });
}

export function identifyUser(
  userId: string | number,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined' || !MIXPANEL_TOKEN || userId == null) return;
  ensureInit();
  if (!initialized) return; // consent not granted — never bind an identity
  mixpanel.identify(String(userId));
  if (properties) mixpanel.people.set(properties);
}

export function resetUser() {
  if (typeof window === 'undefined' || !initialized) return;
  try {
    mixpanel.reset();
  } catch {
    /* ignore */
  }
}
