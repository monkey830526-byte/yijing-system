const CACHE = 'yijing-v1';
const ASSETS = [
  '/',
  '/css/style.css',
  '/js/hexagrams.js',
  '/js/calendar.js',
  '/js/i18n.js',
  '/js/app.js',
  '/images/splash.jpg',
  '/images/splash2.png',
  '/images/splash3.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // AI API 請求不走快取
  if (e.request.url.includes('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
