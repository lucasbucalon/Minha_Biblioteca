import { fetchPage, pageCache, loadPage } from "./route.js";

// Prefetch links (hover ou toque)
function enablePrefetch() {
  document.querySelectorAll("a[data-link]").forEach((link) => {
    const url = link.getAttribute("href").replace(/^#/, "");

    link.addEventListener("mouseenter", () => fetchPage(`pages/${url}.html`), {
      passive: true,
    });

    link.addEventListener("touchstart", () => fetchPage(`pages/${url}.html`), {
      passive: true,
    });
  });
}

// Lazy load condicional
function lazyLoadScripts(hash) {
  hash = hash.replace(/^#/, "");
  if (hash.includes("Botoes")) {
    import("./js/buttons.js").then((m) => m.initButtons?.());
  }
  // outras rotas podem ter lazy load
}

document.addEventListener("DOMContentLoaded", enablePrefetch);
document.addEventListener("spa:pageLoaded", () => {
  enablePrefetch();
  lazyLoadScripts(location.hash);
});
