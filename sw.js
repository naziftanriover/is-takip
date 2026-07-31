/* Security PWA service worker
   - Sadece AYNI ORIGIN (kendi site) isteklerini yonetir.
   - Firebase / gstatic gibi DIS istekler HIC dokunulmadan gecer.
   - Gezinme (sayfa acma): once agdan (guncel surum), internet yoksa cache'ten.
*/
const CACHE = 'security-v4';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // sadece GET
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.origin !== self.location.origin) return;  // dis istekler (Firebase vb.) bypass

  if (req.mode === 'navigate') {
    // network-first: guncel index.html'i getir, yoksa cache
    e.respondWith(
      fetch(req)
        .then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', cp)); return r; })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }
  // diger ayni-origin varliklar: cache-first, yoksa agdan
  e.respondWith(caches.match(req).then((r) => r || fetch(req)));
});
