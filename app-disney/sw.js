// Service worker viejo de la app (cuando el cotizador estaba en la raíz).
// Este archivo lo reemplaza: borra las copias guardadas, se desinstala solo y recarga la página.
// El cotizador nuevo tiene su propio service worker en /cotizador/sw.js.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    try { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } catch (err) {}
    try { await self.registration.unregister(); } catch (err) {}
    try { const cs = await self.clients.matchAll({ type: "window" }); cs.forEach(c => { try { c.navigate(c.url); } catch (err) {} }); } catch (err) {}
  })());
});
// Mientras tanto no intercepta nada: todo va a internet.
self.addEventListener("fetch", () => {});
