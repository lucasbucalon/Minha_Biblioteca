const CACHE_NAME = "spa-cache-v1";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/offline.html", // fallback offline
  "/css/global.css",
  "/js/route.js",
];

// ------------------------------
// Instalação: cache inicial
// ------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Tenta adicionar cada arquivo individualmente para evitar falha total
      return Promise.all(
        URLS_TO_CACHE.map((url) =>
          fetch(url)
            .then((response) => {
              if (!response.ok) throw new Error(`Falha ao buscar ${url}`);
              return cache.put(url, response);
            })
            .catch((err) =>
              console.warn(`Não foi possível adicionar ao cache: ${url}`, err)
            )
        )
      );
    })
  );
  self.skipWaiting(); // ativa imediatamente
});

// ------------------------------
// Ativação: limpa caches antigos
// ------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

// ------------------------------
// Intercepta requisições
// ------------------------------
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => {
      if (resp) return resp;

      return fetch(event.request)
        .then((networkResp) => {
          // opcional: podemos cachear dinamicamente aqui
          return networkResp;
        })
        .catch(() => {
          // fallback offline apenas para navegação
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }
        });
    })
  );
});
