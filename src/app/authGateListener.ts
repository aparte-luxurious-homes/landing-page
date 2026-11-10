import { createListenerMiddleware, isRejectedWithValue } from '@reduxjs/toolkit';

import { logout } from '../features/auth/authSlice';
import { IS_SERVER } from '../config/env';
import { PHONE_REAUTH_REASON, isPhoneReauthError } from '../utils/phoneVerification';

/**
 * Forced sign-out for the phone-verification gate.
 *
 * Once the platform switch is on, ANY authenticated endpoint may answer
 * 401 `{detail: {code: "PHONE_VERIFICATION_REQUIRED", reauth: true}}`: this
 * session belongs to an account that has not confirmed its phone. The only
 * way forward is to sign in again, which returns the challenge the phone step
 * needs. So: drop every copy of the token and go to /login with a reason the
 * page explains.
 *
 * Keyed on `reauth === true` on purpose. The sign-in endpoints (login,
 * google, otp/verify, phone/*) answer the same code WITH a challenge and
 * without `reauth`; those are handled on the auth screens and must never sign
 * anyone out.
 *
 * One listener covers all 13 RTK Query APIs because every rejected endpoint
 * dispatches through the same store.
 */
export const authGateListener = createListenerMiddleware();

let flushPersistedState: () => Promise<unknown> = () => Promise.resolve();

/** store.ts hands over redux-persist's flush so the cleared session hits disk before we leave. */
export function registerAuthGateFlush(flush: () => Promise<unknown>): void {
  flushPersistedState = flush;
}

// Auth screens: never use one as the place to come back to.
const AUTH_PATH_PREFIXES = ['/login', '/signup', '/auth', '/otp', '/complete-profile'];

let signingOut = false;

authGateListener.startListening({
  predicate: (action) => isRejectedWithValue(action) && isPhoneReauthError(action.payload),
  effect: async (_action, listenerApi) => {
    if (IS_SERVER || signingOut) return;
    // Several in-flight queries usually fail together; sign out once.
    signingOut = true;

    listenerApi.dispatch(logout());
    try {
      // authApi keeps a plain copy of the token here for legacy readers.
      localStorage.removeItem('aparte-auth');
    } catch {
      /* storage unavailable: nothing to clear */
    }
    try {
      await flushPersistedState();
    } catch {
      /* best effort: the full page load below resets memory anyway */
    }

    const { pathname, search } = window.location;
    const params = new URLSearchParams({ reason: PHONE_REAUTH_REASON });
    const onAuthPage = AUTH_PATH_PREFIXES.some((p) => pathname.startsWith(p));
    if (!onAuthPage && pathname !== '/') {
      params.set('redirect', `${pathname}${search}`);
    }
    // A full load, not an SPA push: it also drops every RTK Query cache
    // still holding this account's data.
    window.location.assign(`/login?${params.toString()}`);
  },
});
