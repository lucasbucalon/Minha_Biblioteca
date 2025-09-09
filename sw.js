// sw.js
const AUTO_UPDATE = true; // 🔴 coloque "true" quando quiser ativar atualização automática
const CACHE_NAME = "spa-cache-v4";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./pages/off/offline.html",
  "./css/global.css",
  "./js/route.js",
  "./js/main.js",
  "./js/components.js",
  "./js/framework.js",
  "./js/optimize.js",
  "./js/pwa.js",
  "./js/sheet.js",
  "./js/localstorage.js",
];

// ------------------------------
// Instalação
// ------------------------------
self.addEventListener("install", (event) => {
  if (!AUTO_UPDATE) {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
    );
  }
  self.skipWaiting();
});

// ------------------------------
// Ativação
// ------------------------------
self.addEventListener("activate", (event) => {
  if (AUTO_UPDATE) {
    // se auto-update ativo, limpa todos os caches velhos
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    );
  } else {
    // modo cache normal: remove apenas caches antigos
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys.map((key) => key !== CACHE_NAME && caches.delete(key))
          )
        )
    );
  }
  self.clients.claim();
});

// ------------------------------
// Estratégia fetch
// ------------------------------
self.addEventListener("fetch", (event) => {
  if (AUTO_UPDATE) {
    // 🔄 sempre tenta rede, só usa cache se offline
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  } else {
    // 📦 cache-first
    event.respondWith(
      caches.match(event.request).then((resp) => {
        return (
          resp ||
          fetch(event.request).then((networkResp) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResp.clone());
              return networkResp;
            });
          })
        );
      })
    );
  }
});
