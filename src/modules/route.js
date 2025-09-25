// route.js
import { routes, childrenRoutes, config, gateway } from "../main.js";
import { applyGlobalMeta, injectGlobalMeta } from "./meta.js";
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
// Inicializa meta global
// ------------------------------
applyGlobalMeta();

// ------------------------------
// Atualiza título/descrição específico
// ------------------------------
function updateRouteMeta(route) {
  if (!route?.meta) return;
  updateMeta(route.meta);
}

// ------------------------------
// Carrega layout principal com pageLoad
// ------------------------------
async function loadLayout(page, routeMeta) {
  if (loadedLayouts.has(page)) return;

  try {
    const html = await fetchPage(
      page.endsWith(".html") ? page : `${page}.html`
    );
    content.innerHTML = html;

    injectGlobalMeta();

    updateRouteMeta(routeMeta);

    loadedLayouts.add(page);
  } catch (err) {
    show500();
  }
}

// ------------------------------
// Carrega child sem pageLoad
// ------------------------------
async function loadChild(path) {
  const wrapper = document.querySelector("#children-wrapper");
  if (!wrapper) return;

  const childRoute = childrenRoutes.find((r) => r.path.test(path));
  if (!childRoute) {
    show404();
    return;
  }

  try {
    const html = await fetchPage(
      childRoute.page.endsWith(".html")
        ? childRoute.page
        : `${childRoute.page}.html`
    );

    await applyFade(wrapper, async () => {
      await updateChildren(wrapper, html, childRoute.page);

      injectGlobalMeta();

      updateRouteMeta(childRoute);
    });
  } catch (err) {
    if (!navigator.onLine) showOffline();
    else show500();
  }
}

// ------------------------------
// Gerencia rotas SPA
// ------------------------------
export async function handleRoute(path) {
  if (!path.startsWith("/")) path = `/${path}`;
  const startTime = Date.now();
  const minLoadTime = gateway.load.loadTime || 1000;

  if (gateway.flows.some((f) => f.path.test(path))) {
    loadFlow(path);
    return;
  }

  const mainRoute = routes.find((r) => r.path.test(path));
  const childRoute = childrenRoutes.find((r) => r.path.test(path));

  try {
    if (mainRoute) {
      await showPageLoad();
      await loadLayout(mainRoute.page, mainRoute.meta);

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
      const layoutRoute =
        routes.find((r) => r.path.test(`/${config.dirsChild}`)) || routes[1];
      await loadLayout(layoutRoute.page, layoutRoute.meta);
      await loadChild(path);
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
// Intercepta links <a> para SPA
// ------------------------------
function navigate(event) {
  const link = event.target.closest("a[page]");
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
