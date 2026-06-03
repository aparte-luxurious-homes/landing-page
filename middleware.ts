/**
 * Vercel Edge Middleware — dynamic rendering for crawlers (Prerender.io).
 *
 * JS-blind crawlers (Googlebot's first wave, and especially AI/social bots like
 * GPTBot, ClaudeBot, PerplexityBot, Twitterbot, Slackbot, WhatsApp) cannot run
 * this SPA, so they would otherwise see an empty <div id="root">. For those
 * user-agents we fetch a fully-rendered HTML snapshot from Prerender.io and
 * return it. Real users get the normal SPA, untouched.
 *
 * SETUP (one-time):
 *   1. Create an account at https://prerender.io and copy your token.
 *   2. Vercel dashboard → the landing-page Project → Settings →
 *      Environment Variables → Add:  PRERENDER_TOKEN = <your token>
 *      (tick Production and Preview), then Save.
 *   3. Redeploy. Until PRERENDER_TOKEN is set, this middleware is a no-op and
 *      changes nothing.
 *
 * VERIFY (after deploy):
 *   curl -A "Googlebot"  https://aparte.ng/property-details/<id>   # rendered HTML
 *   curl -A "ClaudeBot"  https://aparte.ng/property-details/<id>   # rendered HTML
 *   curl -A "Mozilla/5.0" https://aparte.ng/property-details/<id>  # SPA shell
 */
import { next } from '@vercel/edge';

export const config = {
  // Only page routes reach the middleware body. Skip the asset folder and any
  // path containing a dot (robots.txt, sitemap.xml, *.js, images, etc.).
  matcher: ['/((?!assets/|.*\\.).*)'],
};

const CRAWLER_UA =
  /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|bot\b|crawler|spider|GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-SearchBot|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|Amazonbot|Applebot|facebookexternalhit|facebot|Twitterbot|LinkedInBot|Slackbot|WhatsApp|TelegramBot|Discordbot|Pinterest|redditbot/i;

export default async function middleware(request: Request) {
  const token = process.env.PRERENDER_TOKEN;
  if (!token) return next(); // not configured → serve the SPA unchanged

  const ua = request.headers.get('user-agent') || '';
  if (!CRAWLER_UA.test(ua)) return next(); // real user → SPA
  if (request.headers.get('X-Prerender') === '1') return next(); // loop guard

  const { href } = new URL(request.url);
  try {
    const rendered = await fetch(`https://service.prerender.io/${href}`, {
      headers: {
        'X-Prerender-Token': token,
        'X-Prerender-Int-Type': 'vercel',
        'User-Agent': ua,
      },
    });
    // fetch() transparently decodes content-encoding when we read .text().
    const html = await rendered.text();
    return new Response(html, {
      status: rendered.status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control':
          rendered.headers.get('cache-control') ||
          'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
        'X-Prerender': '1',
      },
    });
  } catch {
    return next(); // any failure → fall back to the SPA
  }
}
