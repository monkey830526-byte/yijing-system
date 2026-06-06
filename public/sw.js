const CACHE = 'yijing-v2';
const ASSETS = [
  '/',
  '/css/style.css',
  '/js/hexagrams.js',
  '/js/calendar.js',
  '/js/i18n.js',
  '/js/app.js',
  '/images/splash.jpg',
  '/images/splash2.jpg',
  '/images/splash3.jpg',
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
  const url = e.request.url;
  // AI API 請求不走快取
  if (url.includes('/api/')) return;

  // HTML / JS / CSS：網路優先（確保拿到最新版），失敗才用快取（離線）
  if (e.request.mode === 'navigate' || /\.(js|css|json)$/.test(url)) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return resp;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // 圖片等靜態資源：快取優先（速度快）
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
