// sw.js
const AUTO_UPDATE = true;
const CACHE_NAME = "spa-cache-v6";

// 🔴 inclui os erros e offline direto no cache inicial
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/global.css",
  "./js/route.js",
  "./js/main.js",
  "./js/components.js",
  "./js/framework.js",
  "./js/optimize.js",
  "./js/pwa.js",
  "./js/sheet.js",
  "./js/localstorage.js",
  "./app/pages/error/404.html",
  "./app/pages/error/500.html",
];

// ------------------------------
// Instalação
// ------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// ------------------------------
// Ativação
// ------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
      )
  );
  self.clients.claim();
});

// ------------------------------
// Estratégia fetch com fallback
// ------------------------------
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        // ok, volta resposta da rede
        if (resp && resp.status === 404) {
          return caches.match("./app/pages/error/404.html");
        }
        return resp;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);

        // tenta o cache normal
        const cachedResp = await cache.match(event.request);
        if (cachedResp) return cachedResp;

        // fallback final → offline (500)
        return cache.match("./app/pages/error/500.html");
      })
  );
});
