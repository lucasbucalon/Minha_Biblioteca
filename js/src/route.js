import { routes, childrenRoutes, config } from "./main.js";
import { fetchPage, updateChildren } from "./utils.js";

const content = document.getElementById("content");

// ------------------------------
// Carregar layout principal
// ------------------------------
async function loadLayout(page) {
  try {
    const html = await fetchPage(
      page.endsWith(".html") ? page : `${page}.html`
    );
    content.innerHTML = html;
  } catch (err) {
    console.error(err);
    content.innerHTML = "<p>Página não encontrada.</p>";
    document.title = "Erro";
  }
}

// ------------------------------
// Carregar child
// ------------------------------
async function loadChild(path) {
  if (!path.startsWith("/")) path = `/${path}`;
  const route = childrenRoutes.find((r) => r.path.test(path));
  const container = document.getElementById("children");

  if (!container) return;

  if (route) {
    try {
      const html = await fetchPage(
        route.page.endsWith(".html") ? route.page : `${route.page}.html`
      );
      await updateChildren(container, html, route.page);
    } catch (err) {
      console.error(err);
      container.innerHTML = "<p>Página não encontrada.</p>";
    }
  } else {
    container.innerHTML = "<p>Página não encontrada.</p>";
  }
}

// ------------------------------
// SPA hash navigation
// ------------------------------
export async function handleRoute(path) {
  if (!path.startsWith("/")) path = `/${path}`;

  const mainRoute = routes.find((r) => r.path.test(path));
  const childRoute = childrenRoutes.find((r) => r.path.test(path));

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

  if (childRoute) {
    // Se for child, garante que o layout principal Home esteja carregado
    const layoutRoute = routes.find((r) => r.path.test("/Home")) || routes[0];
    await loadLayout(layoutRoute.page);
    await loadChild(path);
    return;
  }

  content.innerHTML = "<p>Página não encontrada.</p>";
}

// ------------------------------
// Intercepta links <a data-link>
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
// Inicialização
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("hashchange", () =>
    handleRoute(location.hash.slice(1) || "/")
  );
  document.body.addEventListener("click", navigate);

  handleRoute(location.hash.slice(1) || "/");
});
