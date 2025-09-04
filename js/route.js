document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const pageCache = {};
  const loadedStyles = new Set();

  const routes = [
    { path: /^\/$/, page: "Inicio/home" },
    { path: /^\/Botoes$/, page: "Botoes/buttons" },
    { path: /^\/Anotacoes$/, page: "Anotacoes/note" },
    { path: /^\/Sobre$/, page: "Sobre/about" },
    { path: /^\/Contato$/, page: "Contato/contact" },
  ];

  async function fetchPage(url) {
    if (pageCache[url]) return pageCache[url];
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro ao carregar a página: ${res.status}`);
    const html = await res.text();
    pageCache[url] = html;
    return html;
  }

  function ensureStyles(root) {
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

  function executeScripts(root) {
    root.querySelectorAll("script").forEach((old) => {
      const script = document.createElement("script");
      script.textContent = old.textContent;
      if (old.src) {
        script.src = old.src;
        script.defer = old.defer || false;
      }
      document.body.appendChild(script);
      old.remove();
    });
  }

  async function updateContent(html, page, param = null) {
    const temp = document.createElement("div");
    temp.innerHTML = html;

    await ensureStyles(temp);

    content.classList.add("fade-out");
    setTimeout(() => {
      content.innerHTML = temp.innerHTML;
      executeScripts(content);

      if (param) {
        content
          .querySelectorAll("[data-param]")
          .forEach((el) => (el.textContent = param));
      }

      // Atualiza título
      document.title = page.split("/")[0];

      content.classList.remove("fade-out");
      content.classList.add("fade-in");
      setTimeout(() => content.classList.remove("fade-in"), 200);

      document.dispatchEvent(new Event("spa:pageLoaded"));
    }, 100);
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
      const match = path.match(route.path);
      if (match) {
        loadPage(route.page, route.param ? match[1] : null);
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
