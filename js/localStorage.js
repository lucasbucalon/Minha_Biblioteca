// localstorage.js
// salva pageCache no localStorage para persistência entre visitas

export const persistedCache = {
  data: {},
};

export function saveCache() {
  try {
    localStorage.setItem("spaCache", JSON.stringify(persistedCache.data));
  } catch (e) {
    // localStorage pode falhar em private mode
    console.warn("saveCache falhou:", e);
  }
}

export function loadCache() {
  try {
    const raw = localStorage.getItem("spaCache");
    if (raw) persistedCache.data = JSON.parse(raw);
  } catch (e) {
    console.warn("loadCache falhou:", e);
  }
}

// auto load/save
loadCache();
window.addEventListener("beforeunload", saveCache);
