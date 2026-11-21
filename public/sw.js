// Service worker Saqia — volontairement minimal.
// Seule la page /hors-ligne est mise en cache : les autres pages viennent
// toujours du réseau, donc jamais de contenu périmé après un déploiement.
const CACHE = "saqia-hors-ligne-v1";
const OFFLINE_URL = "/hors-ligne";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  // Navigations seulement (pages HTML) : réseau d'abord, page hors ligne en repli.
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL).then((response) => response || Response.error())),
  );
});
