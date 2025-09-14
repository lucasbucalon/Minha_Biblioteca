// route.js
import { routes, childrenRoutes, config } from "../src/main.js";
import { fetchPage, updateChildren } from "./children.js";
import { applyFade } from "./sheet.js";
import {
  showPageLoad,
  hidePageLoad,
  show404,
  show500,
  showOffline,
} from "./gateways.js";

const content = document.getElementById("route");

// ------------------------------
// Carrega Children dentro de #children-wrapper
// ------------------------------
async function loadChild(path) {
  if (!path.startsWith("/")) path = `/${path}`;
  const route = childrenRoutes.find((r) => r.path.test(path));
  const wrapper = document.querySelector("#children-wrapper");
  if (!wrapper) return;

  if (!route) {
    await show404();
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
    if (!navigator.onLine) {
      await showOffline();
    } else {
      await show500();
    }
  }
}

// ------------------------------
// Carrega Layout principal
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
    await show500();
  }
}

// ------------------------------
// Gerenciar rotas SPA com pageLoad
// ------------------------------
export async function handleRoute(path) {
  if (!path.startsWith("/")) path = `/${path}`;

  const mainRoute = routes.find((r) => r.path.test(path));
  const childRoute = childrenRoutes.find((r) => r.path.test(path));

  const minLoadTime = config.gateway.loadTime;
  const startTime = Date.now();

  try {
    if (mainRoute) {
      await showPageLoad(); // loader só para rota principal
      await loadLayout(mainRoute.page);

      if (config.useChildren) {
        const hash = location.hash.slice(1);
        const childPath =
          hash && childrenRoutes.some((r) => r.path.test(hash))
            ? hash
            : config.defaultChild;
        await loadChild(childPath); // troca de children sem loader
      }

      // garante tempo mínimo do loader
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadTime) {
        await new Promise((res) => setTimeout(res, minLoadTime - elapsed));
      }

      hidePageLoad();
      return;
    }

    if (childRoute) {
      const layoutRoute =
        routes.find((r) => r.path.test(`/${config.dirsChild}`)) || routes[1];
      await loadLayout(layoutRoute.page);
      await loadChild(path); // children sem loader
      return;
    }

    await show404();
    const elapsed = Date.now() - startTime;
    if (elapsed < minLoadTime) {
      await new Promise((res) => setTimeout(res, minLoadTime - elapsed));
    }
    hidePageLoad();
  } catch (err) {
    hidePageLoad();
    if (!navigator.onLine) await showOffline();
    else await show500();
  }
}
// ------------------------------
// Intercepta links <a data-link>
// ------------------------------
function navigate(event) {
  const link = event.target.closest("a[data-link]");
  if (!link) return;

  event.preventDefault();
  let href = link.getAttribute("href") || "/";
  if (!href.startsWith("#")) href = `#${href}`;
  const path = href.slice(1);

  if (location.hash !== href) {
    location.hash = href;
  } else {
    handleRoute(path);
  }
}

// ------------------------------
// Inicialização SPA
// ------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  document.body.addEventListener("click", navigate);
  window.addEventListener("hashchange", () =>
    handleRoute(location.hash.slice(1) || "/")
  );

  // inicializa rota atual com pageLoad
  await showPageLoad();
  await handleRoute(location.hash.slice(1) || "/");
  hidePageLoad();
});
