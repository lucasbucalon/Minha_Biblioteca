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
const loadedLayouts = new Set();

// ------------------------------
// Carrega child
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
// Gerencia rotas SPA
// ------------------------------
export async function handleRoute(path) {
  if (!path.startsWith("/")) path = `/${path}`;
  const startTime = Date.now();
  const minLoadTime = gateway.load.loadTime || 1000;

  // Flows → refresh completo
  if (gateway.flows.some((f) => f.path.test(path))) {
    loadFlow(path);
    return;
  }

  const mainRoute = routes.find((r) => r.path.test(path));
  const childRoute = childrenRoutes.find((r) => r.path.test(path));

  try {
    await showPageLoad();

    if (mainRoute) {
      await loadLayout(mainRoute.page);

      if (config.useChildren) {
        const pathParts = path.split("/").filter(Boolean);
        const childPath = pathParts[1] || config.defaultChild;
        await loadChild(childPath);
      }

      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadTime)
        await new Promise((r) => setTimeout(r, minLoadTime - elapsed));
      hidePageLoad();
      return;
    }

    if (childRoute) {
      // Encontra layout principal correto para esse child
      const layoutRoute =
        routes.find((r) => r.path.test(`/${config.dirsChild}`)) || routes[1];
      await loadLayout(layoutRoute.page);
      await loadChild(path);
      hidePageLoad();
      return;
    }

    hidePageLoad();
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
  if (
    !href ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    link.target === "_blank"
  )
    return;

  event.preventDefault();
  const path = href.startsWith("/") ? href : `/${href}`;

  if (gateway.flows.some((f) => f.path.test(path))) {
    loadFlow(path);
    return;
  }

  if (location.pathname !== path) window.history.pushState({}, "", path);
  handleRoute(path);
}

// ------------------------------
// Inicialização SPA
// ------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  document.body.addEventListener("click", navigate);
  window.addEventListener("popstate", () => handleRoute(location.pathname));

  await showPageLoad();
  await handleRoute(location.pathname);
  hidePageLoad();
});
