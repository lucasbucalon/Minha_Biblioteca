// children.js
const pageCache = {};
const loadedStyles = new Set();
const loadedScripts = new Set();

// ------------------------------
// Busca HTML do child ou página, com cache
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
// Aplica estilos <link> do HTML carregado
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
// Executa scripts internos e externos do child
// ------------------------------
export function executeScripts(wrapper) {
  wrapper.querySelectorAll("script").forEach((oldScript) => {
    const src = oldScript.src;

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
// Atualiza child na rota atual
// ------------------------------
export async function updateChildren(container, html, page) {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  await ensureStyles(temp);

  const newContent = temp.querySelector("#children") || temp;

  let wrapper = container.querySelector("#children-wrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "children-wrapper";
    container.appendChild(wrapper);
  }

  const fragment = document.createDocumentFragment();
  fragment.append(...newContent.childNodes);
  wrapper.replaceChildren(fragment);

  // Executa scripts
  executeScripts(wrapper);

  if (typeof window.loadConstants === "function") {
    try {
      window.loadConstants(wrapper);
    } catch (e) {
      console.warn("Erro em loadConstants:", e);
    }
  }

  const routeTitle = temp.querySelector("title")?.textContent;
  if (routeTitle) document.title = routeTitle;

  const metas = {};
  temp.querySelectorAll("meta[name], meta[property]").forEach((m) => {
    const key = m.getAttribute("name") || m.getAttribute("property");
    if (key) metas[key] = m.getAttribute("content");
  });

  document.dispatchEvent(
    new CustomEvent("spa:pageLoaded", {
      detail: { page, title: routeTitle, metas },
    })
  );
}

// ------------------------------
// Detecta o child atual baseado na URL
// ------------------------------
export function getCurrentChild(childrenRoutes, config) {
  const pathParts = location.pathname.replace(/^\/+/, "").split("/");
  const currentPath = pathParts[1] ? `/${pathParts[1]}` : config.defaultChild;

  const matched = childrenRoutes.find((r) => r.path.test(currentPath));
  return matched ? currentPath : config.defaultChild;
}
