import { store } from '../app/store';

/**
 * Send a signed-in OWNER/AGENT across to the admin dashboard.
 *
 * Returns FALSE when it could not navigate, so the caller can tell the user
 * something instead of leaving them where they were. This used to
 * `console.error` and return silently: if NEXT_PUBLIC_ADMIN_DASHBOARD_URL was
 * missing from a build — which has happened on a deploy that never passed the
 * variable — a freshly verified agent simply stayed on the consumer homepage
 * with an error only visible in devtools. The account was fine; the product
 * looked broken.
 */
export const redirectToAdminDashboard = (): boolean => {
  const state = store.getState();
  const token = state.root.auth.token;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL;

  if (!adminUrl) {
    console.error(
      '[adminRedirect] NEXT_PUBLIC_ADMIN_DASHBOARD_URL is not set for this build — ' +
      'cannot send this user to the dashboard.'
    );
    return false;
  }

  // Guard the token too. Without it the dashboard receives `?token=null`,
  // bounces the user to its own login, and the round trip looks like the
  // account was never created.
  if (!token) {
    console.error('[adminRedirect] No auth token in the store — refusing to redirect without one.');
    return false;
  }

  window.location.href = `${adminUrl}/auth/login?token=${token}`;
  return true;
};
