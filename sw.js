const CACHE = 'routine-planner-v3';
const ASSETS = ['./', './index.html', './manifest.json', './css/style.css', './js/app.js', './js/i18n.js',
  ...['ko','en','ja','zh','es','pt','id','tr','de','fr','hi','ru'].map((lang) => `./js/locales/${lang}.json`),
  './icon-192.svg', './icon-512.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names
    .filter((name) => name.startsWith('routine-planner') && name !== CACHE)
    .map((name) => caches.delete(name)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith('/routine-planner/')) return;
  event.respondWith(fetch(event.request).then((response) => {
    if (!response.ok || response.type !== 'basic') return response;
    const copy = response.clone();
    event.waitUntil(caches.open(CACHE).then((cache) => cache.put(event.request, copy)));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));
});
