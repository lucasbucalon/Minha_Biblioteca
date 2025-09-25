//localStorage.js
export const persistedCache = {
  data: {},

  get(key, defaultValue = null) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  },

  set(key, value) {
    this.data[key] = value;
  },

  remove(key) {
    delete this.data[key];
  },

  clear() {
    this.data = {};
  },
};

// ------------------------------
// Salva a memória atual no localStorage
// ------------------------------
export function saveCache() {
  try {
    localStorage.setItem("spaCache", JSON.stringify(persistedCache.data));
  } catch (e) {
    console.warn("saveCache falhou:", e);
  }
}

// ------------------------------
// Carrega memória do localStorage
// ------------------------------
export function loadCache() {
  try {
    const raw = localStorage.getItem("spaCache");
    if (raw) persistedCache.data = JSON.parse(raw);
  } catch (e) {
    console.warn("loadCache falhou:", e);
  }
}

// ------------------------------
// Auto load/save
// ------------------------------
loadCache();
window.addEventListener("beforeunload", saveCache);

// ------------------------------
// Helpers prontos para SPA
// ------------------------------

export function savePageCache(page, html) {
  const pageCache = persistedCache.get("pageCache", {});
  pageCache[page] = html;
  persistedCache.set("pageCache", pageCache);
}

export function getPageCache(page) {
  const pageCache = persistedCache.get("pageCache", {});
  return pageCache[page] || null;
}

export function saveUserState(key, value) {
  const userState = persistedCache.get("userState", {});
  userState[key] = value;
  persistedCache.set("userState", userState);
}

export function getUserState(key, defaultValue = null) {
  const userState = persistedCache.get("userState", {});
  return userState[key] !== undefined ? userState[key] : defaultValue;
}
