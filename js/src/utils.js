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

export async function updateChildren(container, html, page, useFade = true) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  await ensureStyles(temp);

  const render = () => {
    container.innerHTML = temp.innerHTML;
    executeScripts(container);
    if (window.loadConstants) {
      try {
        window.loadConstants(container);
      } catch (e) {
        console.warn(e);
      }
    }
    const title =
      temp.querySelector("title")?.textContent || page.split("/").pop();
    document.title = title;
    document.dispatchEvent(new Event("spa:pageLoaded"));
  };

  if (useFade) {
    container.classList.add("fade-out");
    setTimeout(() => {
      render();
      container.classList.remove("fade-out");
      container.classList.add("fade-in");
      setTimeout(() => container.classList.remove("fade-in"), 200);
    }, 100);
  } else {
    render();
  }
}
