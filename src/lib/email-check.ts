/**
 * Client-side "did you mean …?" for email addresses.
 *
 * Long addresses get mistyped, and a mistyped address fails silently: the
 * booking confirmation, the receipt and the password-reset code all bounce,
 * and the person never learns why nothing arrived. Real bounces seen in
 * production include `gnail.com` and misspelt company domains.
 *
 * This file catches the cheap, common case (a typo in a big provider's
 * domain) instantly, with no network call. The server check
 * (GET /utils/email-check, see src/api/utilsApi.ts) covers what the browser
 * cannot know: whether the domain accepts mail at all, and whether we have
 * already seen this exact address bounce.
 *
 * It is a HINT, never a gate. Nothing here may block a form submission —
 * plenty of real addresses look odd, and the person typing knows best.
 */

/** Big consumer providers, most common first (ties resolve to the earlier one). */
export const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'yahoo.co.uk',
  'ymail.com',
  'live.com',
  'me.com',
  'aol.com',
  'protonmail.com',
] as const;

/**
 * Real domains that sit one or two keystrokes from a common one. Without this
 * list `mail.com` and `email.com` would be "corrected" to gmail.com, which
 * would push someone with a perfectly good address onto the wrong one.
 */
const REAL_LOOKALIKES = new Set([
  'mail.com',
  'email.com',
  'gmx.com',
  'gmx.net',
  'aim.com',
  'mac.com',
  'msn.com',
  'yahoo.ca',
  'yahoo.cn',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.in',
  'yahoo.ie',
  'hotmail.ca',
  'hotmail.fr',
  'hotmail.it',
  'hotmail.de',
  'live.ca',
  'live.fr',
  'outlook.fr',
  'outlook.de',
  'proton.me',
  'pm.me',
]);

/**
 * Two-letter endings that are almost always a fat-fingered ".com" when they
 * follow a big provider's name (gmail.co, gmail.cm). Any OTHER two-letter
 * ending is treated as a real country domain and left alone.
 */
const COM_FAT_FINGERS = new Set(['co', 'cm', 'om']);

/** Endings that are never real and always meant ".com", on any domain. */
const BROKEN_COM_ENDINGS = new Set([
  'con', 'cmo', 'ocm', 'comm', 'coom', 'cpm', 'vom', 'xom', 'c0m', 'cim', 'cok', 'clm', 'conm',
]);

/** Same check every form here already uses; kept identical on purpose. */
export const BASIC_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isPlausibleEmail(value: string): boolean {
  return BASIC_EMAIL_RE.test(value.trim());
}

/**
 * Restricted Damerau-Levenshtein (optimal string alignment): insertions,
 * deletions, substitutions and swaps of two adjacent characters each cost 1.
 * The swap is what makes `gmial` and `gamil` distance 1 from `gmail`.
 */
export function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) d[i][0] = i;
  for (let j = 0; j < cols; j++) d[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/** `gmail.co.uk` → ["gmail", "co.uk"]; `gmail` → ["gmail", ""]. */
function splitDomain(domain: string): [string, string] {
  const dot = domain.indexOf('.');
  return dot === -1 ? [domain, ''] : [domain.slice(0, dot), domain.slice(dot + 1)];
}

/**
 * Best correction for a domain, or null when it looks fine (or when we are
 * not confident enough to say otherwise).
 */
export function suggestDomain(rawDomain: string): string | null {
  const domain = rawDomain.trim().toLowerCase().replace(/\.+$/, '');
  if (domain.length < 2) return null;
  if ((COMMON_EMAIL_DOMAINS as readonly string[]).includes(domain)) return null;
  if (REAL_LOOKALIKES.has(domain)) return null;

  const [name, ending] = splitDomain(domain);

  let best: string | null = null;
  let bestDistance = Infinity;

  for (const known of COMMON_EMAIL_DOMAINS) {
    const [knownName] = splitDomain(known);
    // Short names (me, aol, live) are one keystroke from countless real
    // domains, so for them only the ending may be corrected: "aol.con" yes,
    // "aoi.com" no.
    const shortName = knownName.length < 5;
    if (shortName && name !== knownName) continue;

    // "tolu@gmail" — the ending is missing entirely.
    const candidate = ending === '' ? name : domain;
    const target = ending === '' ? knownName : known;
    const distance = editDistance(candidate, target);
    const limit = shortName ? 1 : 2;
    if (ending !== '' && (distance === 0 || distance > limit)) continue;
    if (ending === '' && distance > (shortName ? 0 : 1)) continue;

    // Same provider name, different ending: only correct endings that are
    // plainly ".com" typos. yahoo.ca and hotmail.it are real.
    if (ending !== '' && name === knownName) {
      const twoLetters = /^[a-z]{2}$/.test(ending);
      if (twoLetters && !COM_FAT_FINGERS.has(ending)) continue;
    }

    if (distance < bestDistance) {
      best = known;
      bestDistance = distance;
    }
  }
  if (best) return best;

  // Any domain: an ending that is never real ("company.con" → "company.com",
  // "firm.con.ng" → "firm.com.ng").
  const parts = domain.split('.');
  const fixed = parts.map((p, i) => (i > 0 && BROKEN_COM_ENDINGS.has(p) ? 'com' : p));
  const fixedDomain = fixed.join('.');
  return fixedDomain !== domain ? fixedDomain : null;
}

/**
 * Full corrected address, or null. The part before the @ is kept exactly as
 * typed: case can matter there, and we have no business guessing at it.
 */
export function suggestEmail(raw: string): string | null {
  const value = raw.trim();
  const at = value.lastIndexOf('@');
  if (at <= 0 || at === value.length - 1) return null;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const fixed = suggestDomain(domain);
  if (!fixed) return null;
  const suggestion = `${local}@${fixed}`;
  return normaliseEmail(suggestion) === normaliseEmail(value) ? null : suggestion;
}

/** Comparison key for two spellings of an address. */
export function normaliseEmail(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

/**
 * `tolu@gnail.com` → `t***@gnail.com`. Enough for the owner to recognise it,
 * not enough to read over a shoulder.
 */
export function maskEmail(value: string | null | undefined): string {
  const email = (value ?? '').trim();
  const at = email.lastIndexOf('@');
  if (at <= 0) return email ? `${email[0]}***` : '';
  return `${email[0]}***${email.slice(at)}`;
}
