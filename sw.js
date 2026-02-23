// A unique name for our cache
const CACHE_NAME = 'obsidian-app-cache-v1';

// List of assets to cache on installation for the app shell
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  'https://cdn.tailwindcss.com',
  'https://i.imgur.com/tBHG8XG.gif',  // Avatar
  'https://i.imgur.com/LI9LEbK.png'   // Background overlay
];

// Install event: opens the cache and adds the core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache initial assets:', error);
      })
  );
});

// Fetch event: serves assets from cache if available, otherwise fetches from network and caches the result
self.addEventListener('fetch', event => {
  // We only want to cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response.
            // We don't cache opaque responses (from no-cors requests) as we can't check their status.
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // If it's a request to the Gemini API, don't cache it.
            if (networkResponse.url.includes('generativelanguage.googleapis.com')) {
              return networkResponse;
            }

            // Clone the response because it's a stream that can only be consumed once.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );
      })
  );
});


// Activate event: cleans up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});