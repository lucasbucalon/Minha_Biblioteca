const pageCache = {};
const loadedStyles = new Set();
const loadedScripts = new Set();

export async function fetchPage(url) {
  if (pageCache[url]) return pageCache[url];
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ao carregar: ${url}`);
  const html = await res.text();
  pageCache[url] = html;
  return html;
}

async function ensureStyles(root) {
  const promises = [];
  root.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const href = link.href;
    if (!href || loadedStyles.has(href)) return;
    loadedStyles.add(href);
    const newLink = link.cloneNode(true);
    document.head.appendChild(newLink);
    promises.push(
      new Promise((resolve) => (newLink.onload = newLink.onerror = resolve))
    );
  });
  return Promise.all(promises);
}

function executeScripts(root) {
  root.querySelectorAll("script").forEach((old) => {
    const src = old.src;
    if (src && loadedScripts.has(src)) {
      old.remove();
      return;
    }
    if (src) loadedScripts.add(src);

    const script = document.createElement("script");
    if (src) {
      script.src = src;
      script.defer = true;
    } else {
      script.textContent = old.textContent;
    }
    document.body.appendChild(script);
    old.remove();
  });
}

export async function updateChildren(container, html, page) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  await ensureStyles(temp);

  const render = () => {
    const newContent = temp.querySelector("#children-content") || temp;

    // Cria wrapper interno se não existir
    let wrapper = container.querySelector("#children-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = "children-wrapper";
      container.appendChild(wrapper);
    }

    // Substitui apenas o conteúdo do wrapper
    wrapper.replaceChildren(...newContent.childNodes);

    // Executa scripts do novo conteúdo
    executeScripts(wrapper);

    // Executa constantes se existirem
    if (window.loadConstants) {
      try {
        window.loadConstants(wrapper);
      } catch (e) {
        console.warn(e);
      }
    }

    // Atualiza título
    const title =
      temp.querySelector("title")?.textContent || page.split("/").pop();
    document.title = title;

    // Dispara evento SPA
    document.dispatchEvent(new Event("spa:pageLoaded"));
  };

  render();
}
