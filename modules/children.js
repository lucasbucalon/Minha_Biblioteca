// /modules/children.js

const pageCache = {};
const loadedStyles = new Set();
const loadedScripts = new Set();

// ------------------------------
// Busca o HTML da página ou child
// ------------------------------
export async function fetchPage(url) {
  if (pageCache[url]) return pageCache[url];

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao carregar: ${url}`);

  const html = await res.text();
  pageCache[url] = html;
  return html;
}

// ------------------------------
// Garante que os estilos sejam aplicados
// ------------------------------
export async function ensureStyles(root) {
  const promises = [];

  root.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = link.href;
    if (!href || loadedStyles.has(href)) return;

    loadedStyles.add(href);
    const newLink = link.cloneNode(true);
    document.head.appendChild(newLink);

    promises.push(
      new Promise((resolve) => {
        newLink.onload = resolve;
        newLink.onerror = resolve;
      })
    );
  });

  return Promise.all(promises);
}

// ------------------------------
// Executa scripts inline e externos
// ------------------------------
export function executeScripts(wrapper) {
  wrapper.querySelectorAll("script").forEach((oldScript) => {
    const src = oldScript.src;

    // Evita carregar script externo repetido
    if (src && loadedScripts.has(src)) {
      oldScript.remove();
      return;
    }

    if (src) loadedScripts.add(src);

    const script = document.createElement("script");

    if (src) {
      script.src = src;
      script.type = oldScript.type || "text/javascript";
      script.defer = true;
    } else {
      script.textContent = oldScript.textContent;
    }

    wrapper.appendChild(script);
    oldScript.remove();
  });
}

// ------------------------------
// Atualiza children na rota atual
// ------------------------------
export async function updateChildren(container, html, page) {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Garante que todos os estilos do child sejam aplicados
  await ensureStyles(temp);

  const newContent = temp.querySelector("#children") || temp;

  // Cria wrapper se não existir
  let wrapper = container.querySelector("#children-wrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "children-wrapper";
    container.appendChild(wrapper);
  }

  // Insere o conteúdo novo
  const fragment = document.createDocumentFragment();
  fragment.append(...newContent.childNodes);
  wrapper.replaceChildren(fragment);

  // Executa scripts do child
  executeScripts(wrapper);

  // Executa loadConstants se existir
  if (typeof window.loadConstants === "function") {
    try {
      window.loadConstants(wrapper);
    } catch (e) {
      console.warn("Erro em loadConstants:", e);
    }
  }

  // Atualiza título e meta tags
  const routeTitle = temp.querySelector("title")?.textContent;
  if (routeTitle) document.title = routeTitle;

  const metas = {};
  temp.querySelectorAll("meta[name], meta[property]").forEach((m) => {
    const key = m.getAttribute("name") || m.getAttribute("property");
    if (key) metas[key] = m.getAttribute("content");
  });

  // Dispara evento SPA
  document.dispatchEvent(
    new CustomEvent("spa:pageLoaded", {
      detail: { page, title: routeTitle, metas },
    })
  );
}

// ------------------------------
// Detecta child baseado na URL
// ------------------------------
export function getCurrentChild(childrenRoutes, config) {
  const pathParts = location.pathname.replace(/^\/+/, "").split("/");

  const current = pathParts[1] ? `/${pathParts[1]}` : config.defaultChild;

  const matched = childrenRoutes.find((r) => r.path.test(current));
  return matched ? current : config.defaultChild;
}
