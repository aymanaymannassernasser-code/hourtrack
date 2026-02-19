// HourTrack Service Worker
// Caches the app shell for offline use

const CACHE_NAME = "hourtrack-v1";

// Files to cache for offline use
const SHELL_FILES = [
  "/",
  "/index.html",
  "/manifest.json"
];

// ── Install: cache the app shell ──
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

// ── Activate: remove old caches ──
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first, fall back to cache ──
self.addEventListener("fetch", event => {
  // Skip non-GET or cross-origin requests (CDN fonts, scripts)
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // For CDN resources (React, Tailwind, Recharts, fonts) — cache on first load
  const isCDN = url.hostname !== self.location.hostname;

  if (isCDN) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
      })
    );
    return;
  }

  // For local app files — network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
