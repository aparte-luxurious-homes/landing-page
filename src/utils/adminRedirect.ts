import { store } from '../app/store';
import { BASE_API_URL } from './url';

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

  // The JWT never goes in the URL, where it would sit in browser history,
  // proxy logs and Referer headers. The API swaps it for a single-use code
  // that expires in a minute, and the dashboard redeems that for its own
  // HttpOnly session cookie.
  void handOffToDashboard(adminUrl, token);
  return true;
};

const handOffToDashboard = async (adminUrl: string, token: string) => {
  const login = `${adminUrl}/auth/login`;
  try {
    const res = await fetch(`${BASE_API_URL}/auth/handoff`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`handoff answered ${res.status}`);
    const body = await res.json();
    const code = body?.data?.code;
    if (!code) throw new Error('handoff response carried no code');
    window.location.href = `${login}?code=${encodeURIComponent(code)}`;
  } catch (err) {
    // Still navigate: the dashboard's own login form is a working fallback,
    // where staying put would look like the account never got created.
    console.error('[adminRedirect] Could not create a dashboard sign-in code:', err);
    window.location.href = login;
  }
};
