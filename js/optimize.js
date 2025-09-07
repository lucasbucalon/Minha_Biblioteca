// optimize.js

// ------------------------------
// Ignorar certos erros irrelevantes
// ------------------------------
window.addEventListener("error", (event) => {
  const msg = event.message || "";
  const ignorePatterns = [
    "A listener indicated an asynchronous response",
    "chrome-extension",
  ];
  if (ignorePatterns.some((p) => msg.includes(p))) {
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

// ------------------------------
// Assets carregados
// ------------------------------
const loadedAssets = { css: new Set(), js: new Set() };

// Carrega CSS dinamicamente
async function loadCSS(href) {
  if (loadedAssets.css.has(href)) return;
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = resolve;
    document.head.appendChild(link);
    loadedAssets.css.add(href);
  });
}

// Carrega JS dinamicamente
async function loadJS(src) {
  if (loadedAssets.js.has(src)) return;
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.type = "module";
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(`Erro ao carregar ${src}`);
    document.body.appendChild(script);
    loadedAssets.js.add(src);
  });
}

// ------------------------------
// IntersectionObserver para lazy ultra
// ------------------------------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // Carrega CSS e JS de componentes baseados em classes
      Array.from(el.classList)
        .filter((cls) => cls.includes("-"))
        .forEach(async (cls) => {
          const [category, name] = cls.split("-");
          await loadCSS(`/constant/${category}/${name}/styles.css`);
          await loadJS(`/constant/${category}/${name}/script.js`);
          if (window.Components?.[cls]?.init) window.Components[cls].init();
        });

      // Lazy universal para qualquer módulo marcado com data-lazy
      if (el.dataset.lazy) {
        import(el.dataset.lazy)
          .then((m) => m.init?.(el))
          .catch((err) =>
            console.warn(`Módulo não encontrado: ${el.dataset.lazy}`, err)
          );
      }

      // Lazy universal para qualquer script.js que ainda não foi carregado
      el.querySelectorAll("script[type='module'][src$='script.js']").forEach(
        async (script) => {
          await loadJS(script.src);
        }
      );

      observer.unobserve(el);
    });
  },
  { threshold: 0.1 }
);

// ------------------------------
// Inicializa observador em todos os elementos com classes ou data-lazy
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("[class*='-'], [data-lazy]")
    .forEach((el) => observer.observe(el));

  // Carrega os scripts essenciais sempre
  loadJS("./js/components.js");
  loadJS("./js/framework.js");
});

// ------------------------------
// Lazy load universal por rota
// ------------------------------
import { routes } from "./main.js";

export function lazyLoadRoute(hash) {
  hash = hash.replace(/^#/, "");
  const route = routes.find((r) => r.path.test(hash));
  if (!route) return;

  // percorre elementos da página carregada
  document.querySelectorAll("[data-lazy]").forEach((el) => {
    import(el.dataset.lazy)
      .then((m) => m.init?.(el))
      .catch((err) =>
        console.warn(`Módulo não encontrado: ${el.dataset.lazy}`)
      );
  });

  // scripts script.js existentes na página
  document
    .querySelectorAll("script[type='module'][src$='script.js']")
    .forEach(async (script) => {
      await loadJS(script.src);
    });
}

// ------------------------------
// Aplicar lazy load de rota após SPA carregar
// ------------------------------
document.addEventListener("spa:pageLoaded", () => {
  lazyLoadRoute(location.hash);
});
