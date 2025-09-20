// sw.js
import { config } from "../src/main.js";

const AUTO_UPDATE = true; // 🔴 true ativa atualização automática
const CACHE_NAME = "spa-cache-v6";

// Arquivos essenciais para cache
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
  "./app/pages/error/offline.html",
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
    // limpa todos os caches antigos
    event.waitUntil(
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    );
  } else {
    // remove apenas caches antigos que não correspondem ao atual
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
  event.respondWith(
    (async () => {
      try {
        // 🔄 Auto-update: sempre tenta rede primeiro
        const networkResponse = await fetch(event.request);
        if (!AUTO_UPDATE) {
          // atualiza cache para cache-first se não estiver em auto-update
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // rede falhou → tenta cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        // fallback offline
        if (event.request.mode === "navigate") {
          // se for navegação (rota do SPA), retorna página offline
          const offlinePage = await caches.match(
            `${config.gateway.errorOffline}.html`
          );
          return offlinePage || new Response("Offline", { status: 503 });
        }

        // fallback geral: retorna resposta 500
        const errorPage = await caches.match(`${config.gateway.error500}.html`);
        return errorPage || new Response("Erro interno", { status: 500 });
      }
    })()
  );
});
