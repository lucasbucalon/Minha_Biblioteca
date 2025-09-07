// route.js
import { routes } from "./main.js"; // agora funciona

const content = document.getElementById("content");
const pageCache = {};
const loadedStyles = new Set();
const loadedScripts = new Set();

// ------------------------------
// Fetch + cache de páginas
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
// Carrega CSS se ainda não carregado
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
// Executa scripts
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
// Atualiza o content (fade opcional)
async function updateContent(html, page, useFade = true) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  await ensureStyles(temp);

  const render = () => {
    content.innerHTML = temp.innerHTML;
    executeScripts(content);
    if (window.loadConstants) loadConstants(content);

    const pageTitle =
      temp.querySelector("title")?.textContent || page.split("/").pop();
    document.title = pageTitle;

    document.dispatchEvent(new Event("spa:pageLoaded"));
  };

  if (useFade) {
    content.classList.add("fade-out");
    setTimeout(() => {
      render();
      content.classList.remove("fade-out");
      content.classList.add("fade-in");
      setTimeout(() => content.classList.remove("fade-in"), 200);
    }, 100);
  } else {
    render();
  }
}

// ------------------------------
// Carrega uma página
// ------------------------------
async function loadPage(page) {
  try {
    const html = await fetchPage(`${page}.html`);
    await updateContent(html, page);
  } catch (err) {
    console.error(err);
    try {
      const html404 = await fetchPage("pages/404.html");
      await updateContent(html404, "Erro 404", false);
    } catch {
      content.innerHTML = "<p>Página não encontrada.</p>";
      document.title = "Erro";
    }
  }
}

// ------------------------------
// Navegação com hash
// ------------------------------
function navigate(event) {
  const link = event.target.closest("a[data-link]");
  if (!link) return;
  event.preventDefault();
  const href = link.getAttribute("href");
  location.hash = href;
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
// Prefetch inteligente
// ------------------------------
function enablePrefetch() {
  document.querySelectorAll("a[data-link]").forEach((link) => {
    let url = link.getAttribute("href"); // ex: "#/Botoes"
    if (url.startsWith("#")) url = url.slice(1); // remove #

    // buscar o page correspondente nas rotas
    const route = routes.find((r) => r.path.test(url));
    if (!route) return;

    link.addEventListener("mouseenter", () => fetchPage(`${route.page}.html`), {
      passive: true,
    });
    link.addEventListener("touchstart", () => fetchPage(`${route.page}.html`), {
      passive: true,
    });
  });
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

  enablePrefetch();
  document.addEventListener("spa:pageLoaded", enablePrefetch);
});

// ------------------------------
// Exportações
// ------------------------------
export { fetchPage, loadPage, pageCache, updateContent };
