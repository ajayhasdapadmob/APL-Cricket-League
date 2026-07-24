const CACHE_NAME = "apl-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./registration.html",
  "./player.html",
  "./admin.html",
  "./registration.css",
  "./admin.css",
  "./banner.jpg",
  "./upi-qr.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});