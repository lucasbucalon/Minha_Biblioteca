// optimize.js
import { config } from "../main.js";

// ------------------------------
// IGNORAR ERROS IRRELEVANTES
// ------------------------------
const IGNORED_ERRORS = [
  "A listener indicated an asynchronous response",
  "chrome-extension",
];

window.addEventListener("error", (event) => {
  const msg = event.message || "";
  if (IGNORED_ERRORS.some((p) => msg.includes(p))) {
    console.warn("Erro ignorado:", msg);
    event.preventDefault();
  }
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason || "";
  if (typeof reason === "string" && reason.includes(IGNORED_ERRORS[0])) {
    console.warn("Rejeição de promessa ignorada:", reason);
    event.preventDefault();
  }
});

// ------------------------------
// TRACK DE ASSETS CARREGADOS
// ------------------------------
const loadedAssets = {
  css: new Set(),
  js: new Set(),
};

// ------------------------------
// FUNÇÕES DE CARREGAMENTO DINÂMICO
// ------------------------------
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

// ------------------------------
// OBSERVER PARA LAZY LOAD POR VISIBILIDADE
// ------------------------------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      // CARREGA COMPONENTES COM BASE EM CLASSES
      Array.from(el.classList)
        .filter((cls) => cls.includes("-"))
        .forEach(async (cls) => {
          const [category, name] = cls.split("-");
          const css = `${config.dirs.models}/${category}/${name}/styles.css`;
          const js = `${config.dirs.models}/${category}/${name}/script.js`;

          try {
            await loadCSS(css);
            await loadJS(js);
            const key = `${category}-${name}`;
            if (window.Components?.[key]?.init) window.Components[key].init();
          } catch (e) {
            console.warn(e);
          }
        });

      // CARREGA MÓDULOS VIA DATA-LAZY
      if (el.dataset.lazy) {
        import(el.dataset.lazy)
          .then((m) => m.init?.(el))
          .catch(() => {});
      }

      // CARREGA SCRIPTS TYPE=MODULE DENTRO DO ELEMENTO
      el.querySelectorAll("script[type='module'][src$='script.js']").forEach(
        (s) => loadJS(s.src).catch(() => {})
      );

      observer.unobserve(el);
    });
  },
  { threshold: 0.1 }
);

// ------------------------------
// INICIALIZAÇÃO DE LAZY LOAD
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("[class*='-'], [data-lazy]")
    .forEach((el) => observer.observe(el));

  // CARREGAR SCRIPTS ESSENCIAIS
  [
    "./modules/layouts.js",
    "./modules/models.js",
    "./modules/children.js",
    "./modules/utils.js",
  ].forEach((src) => loadJS(src).catch(() => {}));
});

// ------------------------------
// FUNÇÃO PARA LAZY LOAD POR ROTA
// ------------------------------
export function lazyLoadRoute(hash) {
  const normalized = (hash || "").replace(/^#/, "");

  // carrega data-lazy da página
  document.querySelectorAll("[data-lazy]").forEach((el) => {
    import(el.dataset.lazy)
      .then((m) => m.init?.(el))
      .catch(() => {});
  });

  // scripts type module da página
  document
    .querySelectorAll("script[type='module'][src$='script.js']")
    .forEach((s) => loadJS(s.src).catch(() => {}));
}
