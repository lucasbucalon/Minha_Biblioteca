// utils.js

// Cache de páginas, estilos e scripts carregados
const pageCache = {};
const loadedStyles = new Set();
const loadedScripts = new Set();

/**
 * Busca HTML de uma rota e usa cache se disponível
 * @param {string} url - URL da página
 * @returns {Promise<string>}
 */
export async function fetchPage(url) {
  if (pageCache[url]) return pageCache[url];

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao carregar: ${url}`);

  const html = await res.text();
  pageCache[url] = html;
  return html;
}

/**
 * Aplica apenas os estilos que ainda não foram carregados
 * @param {HTMLElement} root - elemento temporário contendo o HTML do child
 */
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

/**
 * Executa scripts do child dentro do wrapper
 * Evita recarregar scripts externos duplicados
 * @param {HTMLElement} wrapper
 */
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
      script.defer = true;
    } else {
      script.textContent = oldScript.textContent;
    }

    wrapper.appendChild(script);
    oldScript.remove();
  });
}

/**
 * Atualiza o conteúdo dinâmico do SPA de forma universal
 * @param {HTMLElement} container - container principal
 * @param {string} html - HTML carregado da rota
 * @param {string} page - nome da página
 */
export async function updateChildren(container, html, page) {
  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Aplica estilos
  await ensureStyles(temp);

  // Pega apenas o conteúdo dinâmico do child (#children)
  const newContent = temp.querySelector("#children") || temp;

  // Cria o wrapper interno se não existir
  let wrapper = container.querySelector("#children-wrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "children-wrapper";
    container.appendChild(wrapper);
  }

  // Substitui conteúdo usando DocumentFragment (evita repaint desnecessário)
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
      console.warn(e);
    }
  }

  // Dispara evento SPA
  document.dispatchEvent(new Event("spa:pageLoaded"));
}
