const CACHE_VERSION = 'browser-cache-v1';

const CACHE_FILES = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/browser.js',
  '/scripts/tabs.js',
  '/scripts/settings.js',
  '/scripts/bookmarks.js',
  '/scripts/chat.js',
  '/scripts/websocket.js',
  '/scripts/main.js'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Install');

  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => {
        console.log('[Service Worker] Caching files');
        return cache.addAll(CACHE_FILES);
      })
      .then(() => self.skipWaiting()) 
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_VERSION) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim(); 
    })
  );
});

self.addEventListener('fetch', event => {

  if (event.request.url.includes('/api/') ||
      event.request.url.startsWith('wss://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {

        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(response => {

            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_VERSION)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('[Service Worker] Fetch failed:', error);
          });
      })
  );
});