document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");

  async function loadPage(page) {
    const url = `pages/${page}.html`;

    content.setAttribute("aria-busy", "true");
    content.style.visibility = "hidden";

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Erro ao carregar a página: ${res.status}`);
      const html = await res.text();

      const temp = document.createElement("div");
      temp.innerHTML = html;

      await ensureStyles(temp);

      content.innerHTML = temp.innerHTML;
      executeScripts(content);
    } catch (err) {
      console.error("Erro ao carregar a página:", err);
      content.innerHTML =
        "<p>Desculpe, algo deu errado ao carregar a página.</p>";
    } finally {
      content.style.visibility = "";
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

  function parseRoute() {
    let hash = window.location.hash.substring(1).trim();
    if (!hash) hash = "home";

    loadPage(hash);
  }

  window.addEventListener("hashchange", parseRoute);
  parseRoute();
});
