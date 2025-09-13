// optimize.js

import { config } from "../src/main.js";

// otimizações: ignore errors, carregar recursos dinamicamente, lazy by visibility e lazy por rota

// ignorar erros irrelevantes (extensions etc.)
window.addEventListener("error", (event) => {
  const msg = event.message || "";
  const ignore = [
    "A listener indicated an asynchronous response",
    "chrome-extension",
  ];
  if (ignore.some((p) => msg.includes(p))) {
    console.warn("Erro ignorado:", msg);
    event.preventDefault();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason || "";
  if (
    typeof reason === "string" &&
    reason.includes("A listener indicated an asynchronous response")
  ) {
    console.warn("Rejeição de promessa ignorada:", reason);
    event.preventDefault();
  }
});

const loadedAssets = { css: new Set(), js: new Set() };

export async function loadCSS(href) {
  if (loadedAssets.css.has(href)) return;
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    link.onerror = resolve;
    document.head.appendChild(link);
    loadedAssets.css.add(href);
  });
}

export async function loadJS(src) {
  if (loadedAssets.js.has(src)) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.type = "module";
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Erro ao carregar ${src}`));
    document.body.appendChild(script);
    loadedAssets.js.add(src);
  });
}

// IntersectionObserver lazy (componentes e data-lazy)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // carregar assets constantes via classe tipo "buttons-ripple" -> /constant/buttons/ripple/...
      Array.from(el.classList)
        .filter((cls) => cls.includes("-"))
        .forEach(async (cls) => {
          const [category, name] = cls.split("-");
          const css = `${config.dirs.models}/${category}/${name}/styles.css`;
          const js = `${config.dirs.models}/${category}/${name}/script.js`;
          try {
            await loadCSS(css);
            await loadJS(js);
            // se o componente expõe window.Components['category-name'].init(), roda
            const key = `${category}-${name}`;
            if (window.Components?.[key]?.init) window.Components[key].init();
          } catch (e) {
            console.warn(e);
          }
        });

      // data-lazy: caminho do módulo ES
      if (el.dataset.lazy) {
        import(el.dataset.lazy)
          .then((m) => m.init?.(el))
          .catch(() => {});
      }

      // scripts tipo .../script.js dentro do elemento (module)
      el.querySelectorAll("script[type='module'][src$='script.js']").forEach(
        (s) => {
          const src = s.getAttribute("src");
          loadJS(src).catch(() => {});
        }
      );

      observer.unobserve(el);
    });
  },
  { threshold: 0.1 }
);

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("[class*='-'], [data-lazy]")
    .forEach((el) => observer.observe(el));

  // garantir script essenciais carregados (não duplicar)
  loadJS("./modules/layouts.js").catch(() => {});
  loadJS("./modules/models.js").catch(() => {});
  loadJS("./modules/children.js").catch(() => {});
});

// Lazy load por rota: carrega módulos marcados com data-lazy na página corrente
export function lazyLoadRoute(hash) {
  const normalized = (hash || "").replace(/^#/, "");
  // carrega todos data-lazy da página atual
  document.querySelectorAll("[data-lazy]").forEach((el) => {
    import(el.dataset.lazy)
      .then((m) => m.init?.(el))
      .catch(() => {});
  });

  // também carrega scripts module que terminam em script.js
  document
    .querySelectorAll("script[type='module'][src$='script.js']")
    .forEach((s) => {
      loadJS(s.src).catch(() => {});
    });
}
