document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const pageCache = {};
  const loadedStyles = new Set();
  const loadedScripts = new Set();

  const routes = [
    { path: /^\/$/, page: "Home/home" },
    { path: /^\/Botoes$/, page: "Buttons/buttons" },
    { path: /^\/Anotacoes$/, page: "Note/note" },
    { path: /^\/Sobre$/, page: "About/about" },
    { path: /^\/Contato$/, page: "Contact/contact" },
  ];

  async function fetchPage(url) {
    if (pageCache[url]) return pageCache[url];
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Erro ao carregar a página: ${res.status}`);
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
      promises.push(
        new Promise((resolve) => {
          newLink.onload = newLink.onerror = resolve;
        })
      );
      document.head.appendChild(newLink);
    });
    return Promise.all(promises);
  }

  function executeScripts(root) {
    root.querySelectorAll("script").forEach((old) => {
      const src = old.src;
      const inline = old.textContent.trim();

      if (src) {
        if (loadedScripts.has(src)) return;
        loadedScripts.add(src);

        const script = document.createElement("script");
        script.src = src;
        script.defer = true;
        script.onload = () => console.debug(`Script carregado: ${src}`);
        script.onerror = () => console.error(`Erro ao carregar: ${src}`);
        document.body.appendChild(script);
      } else if (inline) {
        const script = document.createElement("script");
        script.textContent = inline;
        document.body.appendChild(script);
      }
      old.remove();
    });
  }

  async function updateContent(html, page, param = null) {
    const temp = document.createElement("div");
    temp.innerHTML = html;

    await ensureStyles(temp);

    content.innerHTML = temp.innerHTML;

    executeScripts(content);

    if (typeof loadConstants === "function") {
      try {
        loadConstants(content);
      } catch (e) {
        console.warn("loadConstants falhou:", e);
      }
    }

    if (param) {
      content
        .querySelectorAll("[data-param]")
        .forEach((el) => (el.textContent = param));
    }

    document.title =
      temp.querySelector("title")?.textContent || page.split("/").pop();

    document.dispatchEvent(new Event("spa:pageLoaded"));
  }

  async function loadPage(page, param = null) {
    content.setAttribute("aria-busy", "true");
    try {
      const html = await fetchPage(`pages/${page}.html`);
      await updateContent(html, page, param);
    } catch (err) {
      console.error(err);
      try {
        const html404 = await fetchPage("pages/404.html");
        await updateContent(html404, "Erro 404");
      } catch {
        content.innerHTML = "<p>Página não encontrada.</p>";
        document.title = "Erro";
      }
    } finally {
      content.removeAttribute("aria-busy");
    }
  }

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

  document.body.addEventListener("click", navigate);

  window.addEventListener("hashchange", () => {
    handleRoute(location.hash.slice(1) || "/");
  });

  handleRoute(location.hash.slice(1) || "/");
});
