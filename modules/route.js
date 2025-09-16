// route.js
import { routes, childrenRoutes, config, gateway } from "../src/main.js";
import { fetchPage, updateChildren } from "./children.js";
import { applyFade } from "./sheet.js";
import {
  showPageLoad,
  hidePageLoad,
  show404,
  show500,
  showOffline,
  loadFlow,
} from "./gateways.js";

const content = document.getElementById("route");

// ------------------------------
// Carrega children
// ------------------------------
async function loadChild(path) {
  const wrapper = document.querySelector("#children-wrapper");
  if (!wrapper) return;

  const route = childrenRoutes.find((r) => r.path.test(path));
  if (!route) {
    show404();
    return;
  }

  try {
    const html = await fetchPage(
      route.page.endsWith(".html") ? route.page : `${route.page}.html`
    );
    await applyFade(wrapper, async () => {
      await updateChildren(wrapper, html, route.page);
    });
  } catch (err) {
    if (!navigator.onLine) showOffline();
    else show500();
  }
}

// ------------------------------
// Carrega layout principal
// ------------------------------
const loadedLayouts = new Set();

async function loadLayout(page) {
  if (loadedLayouts.has(page)) return;

  try {
    const html = await fetchPage(
      page.endsWith(".html") ? page : `${page}.html`
    );
    content.innerHTML = html;
    loadedLayouts.add(page);
  } catch (err) {
    show500();
  }
}

// ------------------------------
// Gerencia rotas SPA (somente main + children)
// ------------------------------
export async function handleRoute(path) {
  if (!path.startsWith("/")) path = `/${path}`;

  const startTime = Date.now();
  const minLoadTime = gateway.load.loadTime || 1000;

  // flows → usamos loadFlow (refresh completo)
  if (gateway.flows.some((f) => f.path.test(path))) {
    loadFlow(path);
    return;
  }

  const mainRoute = routes.find((r) => r.path.test(path));
  const childRoute = childrenRoutes.find((r) => r.path.test(path));

  try {
    if (mainRoute) {
      await showPageLoad();
      await loadLayout(mainRoute.page);

      if (config.useChildren) {
        const hash = location.hash.slice(1);
        const childPath =
          hash && childrenRoutes.some((r) => r.path.test(hash))
            ? hash
            : config.defaultChild;
        await loadChild(childPath);
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadTime)
        await new Promise((r) => setTimeout(r, minLoadTime - elapsed));
      hidePageLoad();
      return;
    }

    if (childRoute) {
      const layoutRoute =
        routes.find((r) => r.path.test(`/${config.dirsChild}`)) || routes[1];
      await loadLayout(layoutRoute.page);
      await loadChild(path);
      return;
    }

    show404();
  } catch (err) {
    hidePageLoad();
    if (!navigator.onLine) showOffline();
    else show500();
  }
}

// ------------------------------
// Intercepta links <a>
// ------------------------------
function navigate(event) {
  const link = event.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href || href.startsWith("http")) return;

  if (
    link.target === "_blank" ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("#")
  ) {
    return; // deixa o navegador abrir normalmente
  }

  event.preventDefault();
  const path = href.startsWith("/") ? href : `/${href}`;

  // flows → refresh
  if (gateway.flows.some((f) => f.path.test(path))) {
    loadFlow(path);
    return;
  }

  // SPA normal
  if (location.hash !== `#${path}`) location.hash = `#${path}`;
  else handleRoute(path);
}

// ------------------------------
// Inicialização SPA
// ------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  document.body.addEventListener("click", navigate);

  window.addEventListener("hashchange", () =>
    handleRoute(location.hash.slice(1) || "/")
  );

  await showPageLoad();
  await handleRoute(location.hash.slice(1) || "/");
  hidePageLoad();
});
