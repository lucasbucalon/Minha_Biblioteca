// mobileEnhancements.js
import { routes } from "./main.js";
import { updateContent } from "./fadeContent.js";

const content = document.getElementById("content");
const pageCache = {};
const loadedStyles = new Set();
const loadedScripts = new Set();

// ------------------------------
// LocalStorage Cache
// ------------------------------
function saveCache() {
  localStorage.setItem("spaCache", JSON.stringify(pageCache));
}

function loadCache() {
  const cache = localStorage.getItem("spaCache");
  if (cache) Object.assign(pageCache, JSON.parse(cache));
}

loadCache();
window.addEventListener("beforeunload", saveCache);

// ------------------------------
// Fetch + cache inteligente
// ------------------------------
async function fetchPage(url) {
  if (pageCache[url]) return pageCache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao carregar: ${url}`);
  const html = await res.text();
  pageCache[url] = html;
  return html;
}

// ------------------------------
// Load CSS
// ------------------------------
async function ensureStyles(root) {
  const promises = [];
  root.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = link.href;
    if (!href || loadedStyles.has(href)) return;
    loadedStyles.add(href);
    const newLink = link.cloneNode(true);
    document.head.appendChild(newLink);
    promises.push(
      new Promise((resolve) => {
        newLink.onload = newLink.onerror = resolve;
      })
    );
  });
  return Promise.all(promises);
}

// ------------------------------
// Load JS
// ------------------------------
function executeScripts(root) {
  root.querySelectorAll("script").forEach((old) => {
    if (old.src && loadedScripts.has(old.src)) return;
    if (old.src) loadedScripts.add(old.src);

    const script = document.createElement("script");
    if (old.src) {
      script.src = old.src;
      script.defer = true;
    } else {
      script.textContent = old.textContent;
    }
    document.body.appendChild(script);
    old.remove();
  });
}

// ------------------------------
// Loader visual
// ------------------------------
function showLoader() {
  content.innerHTML = "<div class='loader'></div>";
}

// ------------------------------
// Load page com loader
// ------------------------------
async function loadPage(page) {
  showLoader();
  try {
    const html = await fetchPage(`pages/${page}.html`);
    await updateContent({
      html,
      page,
      content,
      ensureStyles,
      executeScripts,
      loadConstants,
    });

    // Lazy load condicional
    if (page.toLowerCase().includes("buttons")) {
      import("./js/buttons.js").then((m) => m.initButtons?.());
    }
  } catch (err) {
    console.error(err);
    try {
      const html404 = await fetchPage("pages/404.html");
      await updateContent({
        html: html404,
        page: "Erro 404",
        content,
        ensureStyles,
        executeScripts,
        loadConstants,
      });
    } catch {
      content.innerHTML = "<p>Página não encontrada.</p>";
      document.title = "Erro";
    }
  }
}

// ------------------------------
// Navegação + hash
// ------------------------------
function navigate(event) {
  const link = event.target.closest("a[data-link]");
  if (!link) return;
  event.preventDefault();
  location.hash = link.getAttribute("href");
}

function handleRoute(path) {
  for (const route of routes) {
    if (route.path.test(path)) {
      loadPage(route.page);
      return;
    }
  }
  loadPage("404/404");
}

// ------------------------------
// Prefetch
// ------------------------------
function enablePrefetch() {
  document.querySelectorAll("a[data-link]").forEach((link) => {
    const url = link.getAttribute("href");
    link.addEventListener("mouseenter", () => fetchPage(`pages/${url}.html`));
    link.addEventListener("touchstart", () => fetchPage(`pages/${url}.html`));
  });
}

// ------------------------------
// Remove delay de toque 300ms
// ------------------------------
document.addEventListener("touchstart", function () {}, { passive: true });

// ------------------------------
// Swipe gestures mobile
// ------------------------------
let touchStartX = 0;
document.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});
document.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].screenX - touchStartX;
  if (dx > 80) location.hash = "#/"; // swipe direita → home
  if (dx < -80) location.hash = "#/Sobre"; // swipe esquerda → about
});

// ------------------------------
// Eventos
// ------------------------------
window.addEventListener("hashchange", () =>
  handleRoute(location.hash.slice(1) || "/")
);
document.body.addEventListener("click", navigate);

document.addEventListener("DOMContentLoaded", () => {
  handleRoute(location.hash.slice(1) || "/");
  enablePrefetch();
  document.addEventListener("spa:pageLoaded", enablePrefetch);
});

// ------------------------------
// Service Worker (opcional PWA)
// ------------------------------
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.log("Service Worker registrado"))
    .catch((err) => console.warn("SW falhou:", err));
}
