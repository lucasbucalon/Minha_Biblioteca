document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const pageCache = {};

  const routes = [
    { path: /^\/$/, page: "Home/home" }, 
    { path: /^\/Botoes$/, page: "Buttons/buttons" },
    { path: /^\/Anotacoes$/, page: "Note/note" },
    { path: /^\/Sobre$/, page: "About/about" },
    { path: /^\/Contato$/, page: "Contact/contact" },
  ];

  async function loadPage(page, param = null) {
    const url = `pages/${page}.html`;

    content.classList.add("fade-out");
    content.setAttribute("aria-busy", "true");

    try {
      let html;
      if (pageCache[url]) {
        html = pageCache[url];
      } else {
        const res = await fetch(url);
        if (!res.ok)
          throw new Error(`Erro ao carregar a página: ${res.status}`);
        html = await res.text();
        pageCache[url] = html;
      }

      const temp = document.createElement("div");
      temp.innerHTML = html;

      await ensureStyles(temp);

      setTimeout(() => {
        content.innerHTML = temp.innerHTML;
        executeScripts(content);

        if (param) {
          content
            .querySelectorAll("[data-param]")
            .forEach((el) => (el.textContent = param));
        }

        document.title = param
          ? `${page.split("/")[0]} - ${param}`
          : page.split("/")[0];

        content.classList.remove("fade-out");
        content.classList.add("fade-in");

        setTimeout(() => content.classList.remove("fade-in"), 300);
      }, 200);
    } catch (err) {
      console.error("Erro ao carregar a página:", err);
      try {
        const res404 = await fetch("pages/404.html");
        content.innerHTML = await res404.text();
        document.title = "Erro 404";
      } catch {
        content.innerHTML = "<p>Página não encontrada.</p>";
        document.title = "Erro";
      }
    } finally {
      content.removeAttribute("aria-busy");
    }
  }

  function ensureStyles(root) {
    const promises = [];
    root.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const href = link.getAttribute("href");
      if (!href) return;

      const absHref = new URL(href, window.location.origin).href;
      const alreadyLoaded = Array.from(
        document.querySelectorAll('link[rel="stylesheet"]')
      ).some((l) => new URL(l.href, window.location.origin).href === absHref);

      if (!alreadyLoaded) {
        const newLink = document.createElement("link");
        newLink.rel = "stylesheet";
        newLink.href = href;

        const p = new Promise((resolve) => {
          newLink.addEventListener("load", resolve, { once: true });
          newLink.addEventListener("error", resolve, { once: true });
        });

        document.head.appendChild(newLink);
        promises.push(p);
      }
    });
    return Promise.all(promises);
  }

  function executeScripts(scope) {
    const scripts = scope.querySelectorAll("script");
    scripts.forEach((old) => {
      const s = document.createElement("script");
      if (old.src) {
        s.src = old.src;
        s.defer = old.defer || false;
      } else {
        s.textContent = old.textContent;
      }
      document.body.appendChild(s);
      old.remove();
    });
  }

  function navigate(event) {
    const link = event.target.closest("a[data-link]");
    if (!link) return;

    event.preventDefault();
    const href = link.getAttribute("href");
    history.pushState({}, "", href);
    handleRoute(window.location.pathname);
  }

  function handleRoute(path) {
    for (const route of routes) {
      const match = path.match(route.path);
      if (match) {
        if (route.param) {
          loadPage(route.page, match[1]);
        } else {
          loadPage(route.page);
        }
        return;
      }
    }

    loadPage("404/404");
  }


  document.body.addEventListener("click", navigate);


  window.addEventListener("popstate", () =>
    handleRoute(window.location.pathname)
  );


  handleRoute(window.location.pathname);
});

function initRoute() {
  let path = window.location.pathname;

  if (!path || path === "/" || path.endsWith("/index.html")) {

    if (path.endsWith("/index.html")) {
      history.replaceState({}, "", "/");
    }
    path = "/";
  }

  handleRoute(path);
}

initRoute();

