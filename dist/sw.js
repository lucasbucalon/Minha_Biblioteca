// sw.js
const AUTO_UPDATE = true; // 🔴 true = network-first, false = cache-first
const CACHE_NAME = "nexo-cache-v2";
const DYNAMIC_CACHE = "nexo-dynamic-cache";

const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles/global.css",
  "/src/main.js",
  "/app/pages/error/404.html",
  "/app/pages/error/500.html",
  "/app/pages/error/offline.html",
];

// ------------------------------
// Instalação
// ------------------------------
self.addEventListener("install", (event) => {
  if (!AUTO_UPDATE) {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE))
    );
  }
  self.skipWaiting();
});

// ------------------------------
// Ativação
// ------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE)
            return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// ------------------------------
// Fetch handler
// ------------------------------
self.addEventListener("fetch", (event) => {
  const requestURL = new URL(event.request.url);

  // Ignora requests externas
  if (requestURL.origin !== location.origin) return;

  event.respondWith(
    (async () => {
      const dynamicCache = await caches.open(DYNAMIC_CACHE);

      if (AUTO_UPDATE) {
        // network-first: tenta rede, depois cache
        try {
          const networkResponse = await fetch(event.request);
          if (
            requestURL.pathname.startsWith("/components/") ||
            requestURL.pathname.endsWith(".js") ||
            requestURL.pathname.endsWith(".html")
          ) {
            dynamicCache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;

          if (event.request.mode === "navigate") {
            const offlinePage = await caches.match(
              "/app/pages/error/offline.html"
            );
            return offlinePage || new Response("Offline", { status: 503 });
          }

          const errorPage = await caches.match("/app/pages/error/500.html");
          return errorPage || new Response("Erro interno", { status: 500 });
        }
      } else {
        // cache-first: tenta cache, depois rede
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(event.request);
          if (
            requestURL.pathname.startsWith("/components/") ||
            requestURL.pathname.endsWith(".js") ||
            requestURL.pathname.endsWith(".html")
          ) {
            dynamicCache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          if (event.request.mode === "navigate") {
            const offlinePage = await caches.match(
              "/app/pages/error/offline.html"
            );
            return offlinePage || new Response("Offline", { status: 503 });
          }
          const errorPage = await caches.match("/app/pages/error/500.html");
          return errorPage || new Response("Erro interno", { status: 500 });
        }
      }
    })()
  );
});
