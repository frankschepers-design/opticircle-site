const V = 'hq-20261102180350';
const SHELL = ['./', 'index.html', 'app.css', 'app.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'fonts/jost-var.woff2', 'fonts/cormorant-latin.woff2', 'fonts/cormorant-italic-latin.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.endsWith('data.json')) { // network first: always fresh numbers, cached copy offline
    e.respondWith(fetch(e.request, {cache: 'no-store'}).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('data.json', c)); return r; }).catch(() => caches.match('data.json')));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
