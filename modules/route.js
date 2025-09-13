// route.js
import { routes, childrenRoutes, config } from "../src/main.js";
import { fetchPage, updateChildren } from "./children.js";
import { applyFade } from "./sheet.js"; // fade universal

const content = document.getElementById("route");

// ------------------------------
// Cache de layouts já carregados
// ------------------------------
const loadedLayouts = new Set();

async function loadLayout(page) {
  try {
    if (!loadedLayouts.has(page)) {
      const html = await fetchPage(
        page.endsWith(".html") ? page : `${page}.html`
      );
      content.innerHTML = html;
      loadedLayouts.add(page);
    }
  } catch (err) {
    console.error(err);
    content.innerHTML = "<p>Página não encontrada.</p>";
    document.title = "Erro";
  }
}

// ------------------------------
// Carregar child dentro de #children-wrapper (com fade)
// ------------------------------
async function loadChild(path) {
  if (!path.startsWith("/")) path = `/${path}`;

  const route = childrenRoutes.find((r) => r.path.test(path));
  const wrapper = document.querySelector("#children-wrapper");

  if (!wrapper) return;

  if (route) {
    try {
      const html = await fetchPage(
        route.page.endsWith(".html") ? route.page : `${route.page}.html`
      );

      // fade controlado pelo sheet.js
      await applyFade(wrapper, async () => {
        await updateChildren(wrapper, html, route.page);
      });
    } catch (err) {
      console.error("Erro ao carregar child:", err);
      wrapper.innerHTML = "<p>Página não encontrada.</p>";
    }
  } else {
    wrapper.innerHTML = "<p>Página não encontrada.</p>";
  }
}

// ------------------------------
// Gerenciar rotas SPA via hash
// ------------------------------
export async function handleRoute(path) {
  if (!path.startsWith("/")) path = `/${path}`;

  const mainRoute = routes.find((r) => r.path.test(path));
  const childRoute = childrenRoutes.find((r) => r.path.test(path));

  // Rota principal
  if (mainRoute) {
    await loadLayout(mainRoute.page);

    if (config.useChildren) {
      const hash = location.hash.slice(1);
      const childPath =
        hash && childrenRoutes.some((r) => r.path.test(hash))
          ? hash
          : config.defaultChild;

      await loadChild(childPath);
    }
    return;
  }

  // Rota apenas child (ex.: quando acessa direto uma URL que é child)
  if (childRoute) {
    const layoutRoute =
      routes.find((r) => r.path.test(`/${config.dirsChild}`)) || routes[1];

    await loadLayout(layoutRoute.page);
    await loadChild(path);
    return;
  }

  // fallback
  content.innerHTML = "<p>Página não encontrada.</p>";
  document.title = "Erro";
}

// ------------------------------
// Intercepta links <a data-link> para SPA
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
document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("hashchange", () =>
    handleRoute(location.hash.slice(1) || "/")
  );

  document.body.addEventListener("click", navigate);

  // inicializa rota atual ou default
  handleRoute(location.hash.slice(1) || "/");
});
