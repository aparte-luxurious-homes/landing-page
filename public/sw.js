/* Aparte service worker: installability + offline shell only.
 *
 * Deliberately NOT cached: HTML pages, API calls, availability, prices,
 * anything booking/payment related. A stale price or a "free" date served from
 * cache is worse than an honest offline screen. Navigations always go to the
 * network and only fall back to /offline when it fails.
 */
const VERSION = 'v1';
const STATIC_CACHE = `aparte-static-${VERSION}`;
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, '/icons/icon-192.png', '/icons/icon-512.png']))
      .then(() => self.skipWaiting())
  );
});
 
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('aparte-static-') && k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Third parties (payment gateways, maps, analytics) and our Mixpanel proxy
  // are never touched.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/mp/') || url.pathname.startsWith('/api/')) return;

  // Page loads: network first, offline screen if the network is gone.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r || Response.error()))
    );
    return;
  }

  // Fingerprinted build assets and icons never change for a given URL.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
  }
});
