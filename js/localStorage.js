// localstorage.js

const pageCache = {}; // cache em memória

function saveCache() {
  localStorage.setItem("spaCache", JSON.stringify(pageCache));
}

function loadCache() {
  const cache = localStorage.getItem("spaCache");
  if (cache) Object.assign(pageCache, JSON.parse(cache));
}

// Carrega cache ao iniciar
loadCache();

// Salva cache antes de sair
window.addEventListener("beforeunload", saveCache);
