// Cambiá la versión cada vez que subas cambios, así los celulares bajan lo nuevo.
const VERSION = "v3";
const CACHE = "app-disney-" + VERSION;
const SHELL = ["./", "index.html", "styles.css", "app.js", "data.js", "config.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "vendor/leaflet/leaflet.js", "vendor/leaflet/leaflet.css"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Mapas: siempre de internet (no se guardan)
  if (url.hostname.endsWith("tile.openstreetmap.org")) return;
  // Archivos propios: primero internet, si no hay señal usa la copia guardada
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
    return;
  }
  // Fuentes y librería del mapa: copia guardada primero
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })));
});
