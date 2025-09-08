const CACHE_NAME = "spa-cache-v2"; // nova versão = limpa caches antigos
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/offline.html", // fallback offline
  "/css/global.css",
  "/js/route.js",
  "/js/main.js",
  "/js/components.js",
  "/js/framework.js",
  "/js/optimize.js",
  "/js/pwa.js",
];

// ------------------------------
// Instalação: cache inicial
// ------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        URLS_TO_CACHE.map((url) =>
          fetch(url)
            .then((response) => {
              if (response.ok) {
                return cache.put(url, response.clone());
              }
            })
            .catch(() => {
              console.warn(`Falhou ao cachear: ${url}`);
            })
        )
      );
    })
  );
  self.skipWaiting();
});

// ------------------------------
// Ativação: limpa caches antigos
// ------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Cache antigo removido:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ------------------------------
// Estratégia de cache para fetch
// ------------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Navegação SPA: sempre serve index.html no offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () => caches.match("/index.html") || caches.match("/offline.html")
      )
    );
    return;
  }

  // Para outros requests: cache-first com fallback network
  event.respondWith(
    caches.match(request).then((resp) => {
      if (resp) return resp;

      return fetch(request)
        .then((networkResp) => {
          // Cacheia dinamicamente recursos novos
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResp.clone());
            return networkResp;
          });
        })
        .catch(() => {
          // Se for um recurso crítico, devolve offline.html
          if (request.destination === "document") {
            return caches.match("/offline.html");
          }
        });
    })
  );
});
