'use client';

import { useEffect } from 'react';
import mixpanel from 'mixpanel-browser';
import {
  MIXPANEL_TOKEN as MIXPANEL_TOKEN_FALLBACK,
  MIXPANEL_TOKEN_DEVELOPMENT,
  MIXPANEL_TOKEN_PRODUCTION,
} from '@/config/env';

const IS_PROD = process.env.NODE_ENV === 'production';

const MIXPANEL_TOKEN =
  (IS_PROD ? MIXPANEL_TOKEN_PRODUCTION : MIXPANEL_TOKEN_DEVELOPMENT) ||
  MIXPANEL_TOKEN_DEVELOPMENT ||
  MIXPANEL_TOKEN_PRODUCTION ||
  MIXPANEL_TOKEN_FALLBACK;

let initialized = false;

function ensureInit() {
  if (initialized || typeof window === 'undefined' || !MIXPANEL_TOKEN) return;
  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: false,
    track_pageview: false,
    record_sessions_percent: 0,
    debug: !IS_PROD,
    persistence: 'localStorage',
  });
  initialized = true;
}

/** Inits Mixpanel once. Only events you call via trackEvent are sent. */
export default function MixpanelInit() {
  useEffect(() => {
    if (!MIXPANEL_TOKEN && !IS_PROD) {
      console.warn(
        '[mixpanel] No token. Set NEXT_PUBLIC_MIXPANEL_TOKEN_DEVELOPMENT in .env and restart next dev.'
      );
      return;
    }
    ensureInit();
  }, []);
  return null;
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined' || !MIXPANEL_TOKEN) return;
  ensureInit();
  mixpanel.track(eventName, properties, { send_immediately: true });
}

export function identifyUser(
  userId: string | number,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined' || !MIXPANEL_TOKEN || userId == null) return;
  ensureInit();
  mixpanel.identify(String(userId));
  if (properties) mixpanel.people.set(properties);
}

export function resetUser() {
  if (typeof window === 'undefined') return;
  try {
    mixpanel.reset();
  } catch {
    /* ignore */
  }
}
