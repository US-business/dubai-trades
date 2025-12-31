// Basic PWA service worker for cache-first assets and pages
const CACHE_NAME = 'ecommerce-cache-v1';
const ASSETS = [
  '/',
  '/ar',
  '/en',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Only handle GET requests and same-origin
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }
  // Skip API and auth routes
  if (request.url.includes('/api/') || request.url.includes('/dashboard/')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
