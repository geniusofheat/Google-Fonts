const CACHE_NAME = 'google-fonts-browser-v1';

const ASSETS = [
  '/Google-Fonts/',
  '/Google-Fonts/index.html',
  '/Google-Fonts/google_fonts.css',
  '/Google-Fonts/google_fonts_data.js',
  '/Google-Fonts/manifest.json',
  '/Google-Fonts/icons/icon_192.png',
  '/Google-Fonts/icons/icon_512.png'
];

// Install — cache all core assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(response) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(e.request, copy);
      });
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
