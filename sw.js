/* ============================================================
   ПУТЬ 16 · СОТВОРЦОМ
   sw.js — Service Worker (офлайн-кэш)
   ============================================================ */

'use strict';

const CACHE_VERSION = 'put16-v1.0.0';
const CACHE_STATIC = CACHE_VERSION + '-static';
const CACHE_RUNTIME = CACHE_VERSION + '-runtime';

/* Список файлов для предварительного кэша */
const STATIC_ASSETS = [
e  './',
  './index.html',
  './styles).css',
  './app-part1-data {}

.js',
  './app-part2-core.js',
  './app-part3-game.js',
  './app-part4-develop.js',
  './app-part5-track.js',
  './app-part6-esoteric.js',
  './app-part7-nature.js',
  './app-part8-knowledge.js',
  './app-part9-more.js',
  './app-part10-init.js',
  './manifest.json'
];

/* ---------- INSTALL ---------- */
self.addEventListener('install', (event) => {
  console.log('[SW] Install', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => {
      return Promise.all(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Не удалось закэшировать:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

/* ---------- ACTIVATE ---------- */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate', CACHE_VERSION);

  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('put16-') && key !== CACHE_STATIC && key !== CACHE_RUNTIME)
          .map((key) => {
            console.log('[SW] Удаляю старый кэш:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/* ---------- FETCH ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  /* только GET */
  if (req.method !== 'GET') return;

  /* только http(s) */
  const url = new URL(req.url);
  if (!url.protocol.startsWith('http')) return;

  /* пропускаем аналитику и сторонние домены */
  if (url.origin !== self.location.origin) return;

  /* HTML — сеть, при падении — кэш */
  if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
    event.respondWith(networkFirstHTML(req));
    return;
  }

  /* Остальное (CSS, JS, JSON, картинки) — stale-while-revalidate */
  event.respondWith(staleWhileRevalidate(req));
});

/* ---------- СТРАТЕГИИ ---------- */

/* Network first для HTML: свежий контент, при отсутствии сети — кэш */
async function networkFirstHTML(req) {
  try {
    const response = await fetch(req);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_STATIC);
      cache.put(req, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;

    /* fallback на index.html */
    const fallback = await caches.match('./index.html');
    if (fallback) return fallback;

    return new Response('Офлайн', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

/* Stale-while-revalidate: отдаём из кэша, параллельно обновляем */
async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_RUNTIME);
  const cached = await cache.match(req);

  const fetchPromise = fetch(req).then((response) => {
    if (response && response.status === 200 && response.type === 'basic') {
      cache.put(req, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || (await fetchPromise) || new Response('Офлайн', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

/* ---------- СООБЩЕНИЯ ОТ КЛИЕНТА ---------- */
self.addEventListener('message', (event) => {
  const data = event.data || {};

  /* принудительное обновление */
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  /* очистка всех кэшей */
  if (data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith('put16-')).map((k) => caches.delete(k)))
    ).then(() => {
      event.source.postMessage({ type: 'CACHE_CLEARED' });
    });
  }
});

/* ---------- PUSH (заглушка на будущее) ---------- */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = { title: 'Путь 16', body: 'Не забудь про практику!' };
  try { payload = event.data.json(); } catch (  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'put16-reminder'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const c of clients) {
        if (c.url.includes(self.location.origin)) return c.focus();
      }
      return self.clients.openWindow('./index.html');
    })
  );
});

/* ---------- КОНЕЦ ---------- */
console.log('[SW] Путь 16 · Service Worker загружен', CACHE_VERSION);
