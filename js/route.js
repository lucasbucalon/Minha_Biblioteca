document.addEventListener("DOMContentLoaded", () => {
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
      const scriptId = old.src || old.textContent.slice(0, 30);
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
  // Atualiza o content
  // ------------------------------
  async function updateContent(html, page) {
    const temp = document.createElement("div");
    temp.innerHTML = html;

    await ensureStyles(temp);

    content.innerHTML = temp.innerHTML;
    executeScripts(content);

    if (window.loadConstants) loadConstants(content);

    const pageTitle =
      temp.querySelector("title")?.textContent || page.split("/").pop();
    document.title = pageTitle;

    document.dispatchEvent(new Event("spa:pageLoaded"));
  }

  // ------------------------------
  // Carrega uma página
  // ------------------------------
  async function loadPage(page) {
    try {
      const html = await fetchPage(`pages/${page}.html`);
      await updateContent(html, page);
    } catch (err) {
      console.error(err);
      try {
        const html404 = await fetchPage("pages/404.html");
        await updateContent(html404, "Erro 404");
      } catch {
        content.innerHTML = "<p>Página não encontrada.</p>";
        document.title = "Erro";
      }
    }
  }

  async function updateContent(html, page, param = null) {
    const content = document.getElementById("content");
    const temp = document.createElement("div");
    temp.innerHTML = html;

    await ensureStyles(temp);

    content.classList.add("fade-out");
    setTimeout(() => {
      content.innerHTML = temp.innerHTML;
      executeScripts(content);
      if (window.loadConstants) loadConstants(content);

      const pageTitle =
        temp.querySelector("title")?.textContent || page.split("/").pop();
      document.title = pageTitle;

      content.classList.remove("fade-out");
      content.classList.add("fade-in");
      setTimeout(() => content.classList.remove("fade-in"), 200);

      document.dispatchEvent(new Event("spa:pageLoaded"));
    }, 100);
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

  window.addEventListener("hashchange", () =>
    handleRoute(location.hash.slice(1) || "/")
  );
  document.body.addEventListener("click", navigate);

  handleRoute(location.hash.slice(1) || "/");

  // ------------------------------
  // Prefetch on hover/touch
  // ------------------------------
  function enablePrefetch() {
    document.querySelectorAll("a[data-link]").forEach((link) => {
      const url = link.getAttribute("href");
      link.addEventListener("mouseenter", () => fetchPage(`pages/${url}.html`));
      link.addEventListener("touchstart", () => fetchPage(`pages/${url}.html`));
    });
  }

  enablePrefetch();
  document.addEventListener("spa:pageLoaded", enablePrefetch);
});
